// 简单的 Basic Auth 拦截器
export function checkBasicAuth(): boolean {
  // 检查是否在生产环境
  if (import.meta.env.MODE !== 'production') {
    return true;
  }

  // 检查 sessionStorage 中是否已认证
  const isAuthenticated = sessionStorage.getItem('authenticated');
  if (isAuthenticated === 'true') {
    return true;
  }

  // 弹出认证对话框
  const credentials = prompt('请输入访问凭证 (格式: CTS:xxx)');

  if (!credentials) {
    alert('需要认证才能访问');
    return false;
  }

  const [username, password] = credentials.split(':');

  // 验证凭证
  if (username === 'CTS' && password === 'IcanWewill') {
    sessionStorage.setItem('authenticated', 'true');
    return true;
  }

  alert('认证失败,凭证错误');
  return false;
}
