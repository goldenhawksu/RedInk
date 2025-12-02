<template>
  <div id="app">
    <!-- 移动端汉堡菜单按钮 -->
    <button class="mobile-menu-btn" @click="toggleSidebar" aria-label="菜单">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>

    <!-- 遮罩层 -->
    <div
      class="sidebar-overlay"
      :class="{ active: sidebarOpen }"
      @click="closeSidebar"
    ></div>

    <!-- 侧边栏 Sidebar -->
    <aside class="layout-sidebar" :class="{ 'mobile-open': sidebarOpen }">
      <div class="logo-area">
        <img src="/logo.png" alt="CTS" class="logo-icon" />
        <span class="logo-text">CTS</span>
      </div>

      <nav class="nav-menu">
        <RouterLink to="/" class="nav-item" active-class="active" @click="closeSidebar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          <span class="nav-text">创作中心</span>
        </RouterLink>
        <RouterLink to="/history" class="nav-item" active-class="active" @click="closeSidebar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span class="nav-text">历史记录</span>
        </RouterLink>
        <RouterLink to="/settings" class="nav-item" active-class="active" @click="closeSidebar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6m-6-6h6m6 0h-6"></path><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          <span class="nav-text">系统设置</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <img src="/logo.png" alt="CTS" class="user-avatar" />
          <div class="user-details">
            <div class="user-name">CTS</div>
            <div class="user-handle">Su</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="layout-main">
      <RouterView v-slot="{ Component, route }">
        <component :is="Component" />

        <!-- 全局页脚版权信息（首页除外） -->
        <footer v-if="route.path !== '/'" class="global-footer">
          <div class="footer-content">
            <div class="footer-text">
              © 2025 <a href="https://github.com/goldenhawksu/RedInk" target="_blank" rel="noopener noreferrer">RedInk</a> by 默子 (Histone)
            </div>
            <div class="footer-license">
              Licensed under <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-NC-SA 4.0</a>
            </div>
          </div>
        </footer>
      </RouterView>
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
import { ref, onMounted } from 'vue'
import { setupAutoSave } from './stores/generator'

// 侧边栏状态
const sidebarOpen = ref(false)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

// 启用自动保存到 localStorage
onMounted(() => {
  setupAutoSave()
})
</script>

<style>
/* 移动端汉堡菜单按钮 */
.mobile-menu-btn {
  display: none;
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 1001;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--primary);
  border: none;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(255, 36, 66, 0.3);
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.mobile-menu-btn:active {
  transform: scale(0.95);
}

/* 遮罩层 */
.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.sidebar-overlay.active {
  opacity: 1;
  pointer-events: auto;
}

/* 侧边栏底部样式 */
.sidebar-footer {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
}

.user-handle {
  font-size: 12px;
  color: var(--text-sub);
}

/* 移动端样式 */
@media (max-width: 768px) {
  .mobile-menu-btn {
    display: flex;
  }

  .sidebar-overlay {
    display: block;
  }

  .layout-sidebar {
    width: 280px; /* 移动端固定宽度 */
    transform: translateX(-100%);
    box-shadow: none;
  }

  .layout-sidebar.mobile-open {
    transform: translateX(0);
    box-shadow: 4px 0 12px rgba(0, 0, 0, 0.15);
  }

  /* 移动端保持显示导航文字 */
  .nav-item {
    padding: 14px 18px;
    justify-content: flex-start;
  }

  /* 移动端显示用户信息 */
  .user-info {
    justify-content: flex-start;
  }

  /* 移动端显示Logo文字 */
  .logo-area {
    justify-content: flex-start;
  }
}
</style>
