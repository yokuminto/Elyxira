/**
 * 显示 toast 提示消息
 * @param message 提示消息
 * @param type 提示类型：'info' | 'success' | 'warning' | 'error'
 * @param duration 显示时长（毫秒）
 */

import { useToast, POSITION, TYPE } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

// 映射 toast 类型
const mapToastType = (type: 'info' | 'success' | 'warning' | 'error') => {
  switch (type) {
    case 'info':
      return TYPE.INFO
    case 'success':
      return TYPE.SUCCESS
    case 'warning':
      return TYPE.WARNING
    case 'error':
      return TYPE.ERROR
    default:
      return TYPE.DEFAULT
  }
}

/**
 * 显示 toast 提示消息
 * @param message 提示消息
 * @param type 提示类型：'info' | 'success' | 'warning' | 'error'
 * @param duration 显示时长（毫秒）
 * @returns 用于提前关闭 toast 的函数
 */
export function showToast(
  message: string,
  type: 'info' | 'success' | 'warning' | 'error' = 'info',
  duration: number = 3000,
): () => void {
  // 获取 toast 接口
  const toast = useToast()

  // 显示 toast
  const toastId = toast(message, {
    type: mapToastType(type),
    timeout: duration,
    position: POSITION.TOP_RIGHT,
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
  })

  // 返回销毁函数（可用于提前关闭 Toast）
  return () => {
    toast.dismiss(toastId)
  }
}

/**
 * 注入 toast 样式
 * 添加自定义样式使其更紧凑
 */
export function injectToastStyles(): void {
  // 添加自定义样式
  if (!document.getElementById('custom-toast-styles')) {
    const styleElement = document.createElement('style')
    styleElement.id = 'custom-toast-styles'
    styleElement.textContent = customToastStyle
    document.head.appendChild(styleElement)
  }
}

// 自定义Toast样式，使其更紧凑
export const customToastStyle = `
/* 自定义更紧凑的Toast样式 */
.Vue-Toastification__container {
  padding: 0;
  min-width: 240px;
}

.Vue-Toastification__toast {
  min-height: auto !important;
  padding: 8px 12px !important;
  font-size: 14px !important;
  border-radius: 4px !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15) !important;
  margin-bottom: 8px !important;
}

.Vue-Toastification__toast-body {
  margin: 0 !important;
  padding: 0 !important;
}

.Vue-Toastification__icon {
  margin-right: 8px !important;
  height: 20px !important;
  width: 20px !important;
  min-width: 20px !important;
}

/* 不同类型Toast的颜色 */
.Vue-Toastification__toast--info {
  background-color: #2196F3 !important;
}

.Vue-Toastification__toast--success {
  background-color: #4CAF50 !important;
}

.Vue-Toastification__toast--warning {
  background-color: #FF9800 !important;
}

.Vue-Toastification__toast--error {
  background-color: #F44336 !important;
}

/* 增加透明度，使其更轻盈 */
.Vue-Toastification__toast {
  opacity: 0.95 !important;
}
`
