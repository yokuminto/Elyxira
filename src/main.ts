// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import ErrorHandler from './pages/error/handler-error'
// 导入 Toast 插件
import Toast from 'vue-toastification'
// 导入 Toast 样式
import 'vue-toastification/dist/index.css'
// 导入全局样式
import './styles/variables.css'
import './styles/modal.css'

// 初始化全局错误处理器 - 移动到 app 创建和 router 使用之后
// ErrorHandler.init(router)

const app = createApp(App)

// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue 应用错误:', err)
  ErrorHandler.handleError(err, `Vue 组件渲染 (${info})`)
  return false
}

app.use(createPinia())
app.use(router)

// 在 router 插件使用后初始化 ErrorHandler
ErrorHandler.init(router)

// 注册 Toast 插件
app.use(Toast, {
  // 默认配置
  position: 'top-right',
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 60,
  showCloseButtonOnHover: true,
  hideProgressBar: true,
  closeButton: false,
  icon: true,
  rtl: false,
  newestOnTop: true,
})

app.mount('#app')
