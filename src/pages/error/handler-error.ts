import type { Router } from 'vue-router'

/**
 * 全局错误处理工具
 * 用于处理应用中的错误，并导航到错误页面
 */
export class ErrorHandler {
  private static router: Router | null = null

  /**
   * 初始化错误处理器
   * @param router Vue Router实例
   */
  static init(router: Router) {
    this.router = router

    // 设置全局未捕获异常处理
    window.addEventListener('error', (event) => {
      console.error('全局错误:', event.error)
      this.navigateToErrorPage({
        message: '发生了意外错误',
        details: event.error?.stack || event.error?.message || event.message,
      })
      return false
    })

    // 设置Promise未捕获异常处理
    window.addEventListener('unhandledrejection', (event) => {
      console.error('未处理的Promise拒绝:', event.reason)
      this.navigateToErrorPage({
        message: '异步操作失败',
        details: event.reason?.stack || event.reason?.message || String(event.reason),
      })
      return false
    })
  }

  /**
   * 导航到错误页面
   * @param error 错误信息对象
   * @param replace 是否替换当前历史记录
   */
  static navigateToErrorPage(error: { message: string; details?: string }, replace = false) {
    // 保存到localStorage以便在错误页面获取
    localStorage.setItem('lastRouteError', JSON.stringify(error))

    // 如果router可用，导航到错误页面
    if (this.router) {
      const navigationOptions = {
        name: 'error',
        query: {
          message: error.message,
          details: error.details,
        },
      }

      if (replace) {
        this.router.replace(navigationOptions)
      } else {
        this.router.push(navigationOptions)
      }
    }
  }

  /**
   * 手动处理错误
   * @param error 捕获到的错误对象
   * @param context 错误发生的上下文信息
   * @param navigate 是否导航到错误页面
   */
  static handleError(error: unknown, context = '操作', navigate = true) {
    const errorObj = error instanceof Error ? error : new Error(String(error))
    console.error(`${context}出错:`, errorObj)

    if (navigate) {
      this.navigateToErrorPage({
        message: `${context}时发生错误`,
        details: errorObj.stack || errorObj.message,
      })
    }

    return errorObj
  }
}

/**
 * 包装一个异步函数，自动处理其中的错误
 * @param fn 要包装的异步函数
 * @param context 错误发生的上下文信息
 * @param navigate 是否在出错时导航到错误页面
 */
export function withErrorHandling<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>,
  context = '操作',
  navigate = true,
) {
  return async (...args: Args): Promise<T | null> => {
    try {
      return await fn(...args)
    } catch (error) {
      ErrorHandler.handleError(error, context, navigate)
      return null
    }
  }
}

/**
 * 创建带错误处理的函数版本
 * @param fn 原始函数
 * @param context 错误上下文描述
 */
export function createSafeFunction<T, Args extends unknown[]>(
  fn: (...args: Args) => T,
  context = '操作',
) {
  return (...args: Args): T | null => {
    try {
      return fn(...args)
    } catch (error) {
      ErrorHandler.handleError(error, context, true)
      return null
    }
  }
}

export default ErrorHandler
