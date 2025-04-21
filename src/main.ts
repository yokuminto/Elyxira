// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import ErrorHandler from './pages/error/handler-error'
// import feather from 'feather-icons' // 删除 feather-icons 导入
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import './styles/variables.css'
import './styles/modal.css'
// import { nextTick } from 'vue' // nextTick 不再需要

// 添加 Font Awesome 导入
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faArrowLeft,
  faSun,
  faMoon,
  faCog,
  faRepeat,
  faThLarge,
  faEdit,
  faCheckCircle,
  faChevronRight,
  faChevronLeft,
  faUndo,
  faSync,
  faTimes,
  faBolt,
  faSlidersH,
} from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'

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

// 添加 Font Awesome 图标到库
library.add(
  faArrowLeft,
  faSun,
  faMoon,
  faCog,
  faRepeat,
  faThLarge,
  faEdit,
  faCheckCircle,
  faChevronRight,
  faChevronLeft,
  faUndo,
  faSync,
  faTimes,
  faBolt,
  faSlidersH,
  faGithub,
)

// 注册 Font Awesome 组件
app.component('font-awesome-icon', FontAwesomeIcon)

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

// 移除 feather.replace()
// 使用 nextTick 确保 DOM 准备好后再替换图标
// nextTick(() => {
//   feather.replace()
// })
