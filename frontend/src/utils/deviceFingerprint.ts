/**
 * 设备指纹生成工具
 * 基于浏览器和硬件特征生成唯一设备ID
 */

/**
 * Canvas指纹(最重要的特征)
 * 不同GPU渲染相同内容会有细微差别
 */
async function getCanvasFingerprint(): Promise<string> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) return 'no-canvas'

  canvas.width = 200
  canvas.height = 50

  // 绘制渐变背景
  const gradient = ctx.createLinearGradient(0, 0, 200, 50)
  gradient.addColorStop(0, '#f60')
  gradient.addColorStop(0.5, '#069')
  gradient.addColorStop(1, '#0f0')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 200, 50)

  // 绘制文本(字体渲染会因系统不同而略有差异)
  ctx.font = '14px "Arial", sans-serif'
  ctx.fillStyle = '#fff'
  ctx.fillText('RedInk Device ID 🔒', 10, 25)

  // 添加形状
  ctx.beginPath()
  ctx.arc(150, 25, 15, 0, Math.PI * 2, true)
  ctx.closePath()
  ctx.fill()

  return canvas.toDataURL()
}

/**
 * WebGL指纹
 * GPU型号和驱动程序信息
 */
function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null

    if (!gl) return 'no-webgl'

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    if (!debugInfo) return 'no-debug-info'

    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)

    return `${vendor}|${renderer}`
  } catch (e) {
    return 'webgl-error'
  }
}

/**
 * SHA-256 哈希函数
 */
async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * 生成设备指纹
 * 组合多个浏览器特征生成唯一ID
 */
export async function generateDeviceFingerprint(): Promise<string> {
  // 收集各种设备特征
  const components = [
    // 1. 浏览器信息
    navigator.userAgent,
    navigator.language,
    navigator.languages?.join(',') || '',
    navigator.platform,

    // 2. 硬件特征
    navigator.hardwareConcurrency || 0,
    navigator.deviceMemory || 0,
    navigator.maxTouchPoints || 0,

    // 3. 屏幕特征
    screen.width,
    screen.height,
    screen.colorDepth,
    screen.pixelDepth,
    window.devicePixelRatio || 1,

    // 4. 时区
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    new Date().getTimezoneOffset(),

    // 5. Canvas指纹(核心)
    await getCanvasFingerprint(),

    // 6. WebGL指纹
    getWebGLFingerprint(),

    // 7. 字体检测(可选,性能开销较大)
    // await getFontFingerprint(),
  ]

  // 组合并哈希
  const combined = components.join('|')
  const fingerprint = await sha256(combined)

  console.log('🔐 设备指纹已生成:', fingerprint.substring(0, 16) + '...')

  return fingerprint
}

/**
 * 获取或生成设备ID
 * 优先从localStorage读取,避免重复计算
 */
export async function getDeviceId(): Promise<string> {
  const STORAGE_KEY = 'redink_device_id'
  const STORAGE_VERSION_KEY = 'redink_device_id_version'
  const CURRENT_VERSION = '1.0'

  // 检查版本,如果算法更新则重新生成
  const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY)

  if (storedVersion === CURRENT_VERSION) {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      console.log('📱 使用缓存的设备ID')
      return stored
    }
  }

  // 生成新的设备ID
  console.log('🔄 生成新的设备指纹...')
  const deviceId = await generateDeviceFingerprint()

  // 缓存到localStorage
  localStorage.setItem(STORAGE_KEY, deviceId)
  localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION)

  return deviceId
}

/**
 * 清除设备ID缓存
 * 用于测试或用户主动解绑设备
 */
export function clearDeviceId(): void {
  localStorage.removeItem('redink_device_id')
  localStorage.removeItem('redink_device_id_version')
  console.log('🗑️ 设备ID已清除')
}
