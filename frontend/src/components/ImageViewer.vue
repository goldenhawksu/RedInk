<template>
  <Teleport to="body">
    <div v-if="show" class="image-viewer-overlay" @click.self="close">
      <div class="image-viewer-container">
        <!-- 关闭按钮 -->
        <button class="viewer-close" @click="close" title="关闭 (ESC)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <!-- 左箭头 -->
        <button
          v-if="images.length > 1"
          class="viewer-nav viewer-prev"
          @click="prev"
          :disabled="currentIndex === 0"
          title="上一张 (←)"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <!-- 图片容器 -->
        <div class="viewer-image-wrapper">
          <img
            :src="currentImageUrl"
            :alt="`Page ${currentIndex + 1}`"
            @load="onImageLoad"
            :style="imageStyle"
          />
          <div class="viewer-info">
            {{ currentIndex + 1 }} / {{ images.length }}
          </div>
        </div>

        <!-- 右箭头 -->
        <button
          v-if="images.length > 1"
          class="viewer-nav viewer-next"
          @click="next"
          :disabled="currentIndex === images.length - 1"
          title="下一张 (→)"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>

        <!-- 底部缩略图导航 -->
        <div v-if="images.length > 1" class="viewer-thumbnails">
          <div
            v-for="(img, idx) in images"
            :key="idx"
            class="viewer-thumbnail"
            :class="{ active: idx === currentIndex }"
            @click="goTo(idx)"
          >
            <img :src="getThumbnailUrl(img)" :alt="`Page ${idx + 1}`" />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

interface Props {
  show: boolean
  images: string[]  // 图片URL数组
  initialIndex?: number
  taskId?: string  // 用于生成完整URL
}

const props = withDefaults(defineProps<Props>(), {
  initialIndex: 0
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'change', index: number): void
}>()

const currentIndex = ref(props.initialIndex)
const imageLoaded = ref(false)
const imageStyle = ref({})

// 当前图片URL
const currentImageUrl = computed(() => {
  if (currentIndex.value < 0 || currentIndex.value >= props.images.length) {
    return ''
  }
  const img = props.images[currentIndex.value]
  return getFullImageUrl(img)
})

// 获取完整图片URL(原图)
function getFullImageUrl(img: string) {
  if (!img) return ''
  // 如果已经是完整URL,直接使用
  if (img.startsWith('http://') || img.startsWith('https://')) {
    return img.split('?')[0] + '?thumbnail=false'
  }
  // 否则构建相对路径
  return img
}

// 获取缩略图URL
function getThumbnailUrl(img: string) {
  if (!img) return ''
  if (img.startsWith('http://') || img.startsWith('https://')) {
    return img.split('?')[0] + '?thumbnail=true'
  }
  return img
}

// 图片加载完成
function onImageLoad() {
  imageLoaded.value = true
}

// 导航函数
function prev() {
  if (currentIndex.value > 0) {
    currentIndex.value--
    imageLoaded.value = false
    emit('change', currentIndex.value)
  }
}

function next() {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++
    imageLoaded.value = false
    emit('change', currentIndex.value)
  }
}

function goTo(index: number) {
  if (index >= 0 && index < props.images.length) {
    currentIndex.value = index
    imageLoaded.value = false
    emit('change', currentIndex.value)
  }
}

function close() {
  emit('close')
}

// 键盘事件处理
function handleKeydown(e: KeyboardEvent) {
  if (!props.show) return

  switch (e.key) {
    case 'Escape':
      close()
      break
    case 'ArrowLeft':
      prev()
      break
    case 'ArrowRight':
      next()
      break
  }
}

// 监听show变化,重置索引
watch(() => props.show, (newShow) => {
  if (newShow) {
    currentIndex.value = props.initialIndex
    imageLoaded.value = false
    // 禁止body滚动
    document.body.style.overflow = 'hidden'
  } else {
    // 恢复body滚动
    document.body.style.overflow = ''
  }
})

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.image-viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.image-viewer-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.viewer-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.2s;
}

.viewer-close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.viewer-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 64px;
  height: 64px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.2s;
}

.viewer-nav:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-50%) scale(1.1);
}

.viewer-nav:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.viewer-prev {
  left: 40px;
}

.viewer-next {
  right: 40px;
}

.viewer-image-wrapper {
  position: relative;
  max-width: 90%;
  max-height: 85vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.viewer-image-wrapper img {
  max-width: 100%;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  animation: zoomIn 0.3s ease;
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.viewer-info {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 14px;
  background: rgba(0, 0, 0, 0.5);
  padding: 8px 16px;
  border-radius: 20px;
  white-space: nowrap;
}

.viewer-thumbnails {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 12px;
  max-width: 90%;
  overflow-x: auto;
}

.viewer-thumbnail {
  width: 60px;
  height: 60px;
  cursor: pointer;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid transparent;
  transition: all 0.2s;
  flex-shrink: 0;
}

.viewer-thumbnail:hover {
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.1);
}

.viewer-thumbnail.active {
  border-color: white;
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.5);
}

.viewer-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .viewer-nav {
    width: 48px;
    height: 48px;
  }

  .viewer-prev {
    left: 20px;
  }

  .viewer-next {
    right: 20px;
  }

  .viewer-thumbnails {
    max-width: calc(100% - 40px);
  }

  .viewer-thumbnail {
    width: 48px;
    height: 48px;
  }
}
</style>
