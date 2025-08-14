import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import  router from './router'
import { useAuthStore } from '@/store/authStore'

const app = createApp(App)

// 创建Pinia实例
const pinia = createPinia()
app.use(pinia)

// 创建并设置authStore
const authStore = useAuthStore()
app.config.globalProperties.$authStore = authStore

// 设置路由
//const router = router(app)
app.use(router)

app.mount('#app')