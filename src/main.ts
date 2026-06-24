// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ErrorHandler from './pages/error/handler-error'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import './styles/variables.css'
import './styles/modal.css'

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
  faPlus,
  faTrashAlt,
  faList,
} from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faGithub } from '@fortawesome/free-brands-svg-icons'

const app = createApp(App)

app.config.errorHandler = (err, instance, info) => {
  console.error('Vue 应用错误:', err)
  ErrorHandler.handleError(err, `Vue 组件渲染 (${info})`)
  return false
}

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
  faPlus,
  faTrashAlt,
  faList,
)
library.add(faGithub as IconDefinition)

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
