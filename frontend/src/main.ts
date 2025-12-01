import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Styles
import './assets/css/variables.css'
import './assets/css/base.css'
import './assets/css/components.css'
import './assets/css/home.css'
import './assets/css/history.css'
import './assets/css/mobile.css' // 移动端优化样式

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
