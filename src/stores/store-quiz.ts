import configService from '@/services/config-service'
import type { QuizData, QuizConfig } from '@/services/config-service'

/**
 * QuizStore适配器
 * 用于将旧的QuizStore接口适配到新的configService
 */
class QuizStoreAdapter {
  // 通过计算属性暴露state，保持兼容性
  get state() {
    return {
      quizData: configService.getQuizData(),
      config: configService.getQuizConfig(),
      lastLoaded: configService.getLastLoadedQuiz() || { name: '', source: '' },
    }
  }

  /**
   * 设置题库数据
   */
  setQuizData(data: QuizData) {
    configService.setQuizData(data)
  }

  /**
   * 获取题库数据
   */
  getQuizData(): QuizData | null {
    return configService.getQuizData()
  }

  /**
   * 设置刷题配置
   */
  setConfig(config: Partial<QuizConfig>) {
    configService.setQuizConfig(config)
  }

  /**
   * 获取刷题配置
   */
  getConfig() {
    return configService.getQuizConfig()
  }

  /**
   * 设置最后加载的题库
   */
  setLastLoaded(name: string, source: string) {
    configService.saveLastLoadedQuiz(name, source)
  }

  /**
   * 保存到存储
   */
  saveToStorage() {
    configService.saveQuizState()
  }

  /**
   * 清除当前题库
   */
  clearCurrentQuiz() {
    configService.clearCurrentQuiz()
  }

  /**
   * 获取最后加载的题库信息
   */
  getLastLoaded() {
    return configService.getLastLoadedQuiz() || { name: '', source: '' }
  }
}

// 创建单例实例
export const QuizStore = new QuizStoreAdapter()
