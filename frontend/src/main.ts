import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { checkBasicAuth } from './utils/auth'

// Styles
import './assets/css/variables.css'
import './assets/css/base.css'
import './assets/css/components.css'
import './assets/css/home.css'
import './assets/css/history.css'
import './assets/css/mobile.css' // 移动端优化样式

// 生产环境认证检查
if (import.meta.env.MODE === 'production') {
  if (!checkBasicAuth()) {
    // 认证失败,阻止应用启动
    document.body.innerHTML = '<h1 style="text-align:center;margin-top:50px;">认证失败,请刷新页面重试</h1>';
    throw new Error('Authentication failed');
  }
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

