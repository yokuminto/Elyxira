import { reactive, readonly } from 'vue'
import { QuizMode, QuizSourceType, type QuizData } from '../pages/library/types'
import { showToast } from '../utils/toast'
import * as storage from '../utils/storage'

interface QuizConfig {
  chapterIndex: string
  mode: QuizMode
  rangeStart: number
  rangeEnd: number
  randomize: boolean
  wrongOnly: boolean
}

// 默认配置
const defaultConfig: QuizConfig = {
  chapterIndex: 'all',
  mode: QuizMode.NORMAL,
  rangeStart: 1,
  rangeEnd: 50,
  randomize: false,
  wrongOnly: false,
}

// 创建响应式状态
const state = reactive<{
  quizData: QuizData | null
  config: QuizConfig
  lastLoaded: {
    name: string
    source: string
  }
  stats: {
    totalAnswered: number
    correctCount: number
    wrongCount: number
    dailyActivity: number[]
  }
}>({
  quizData: null,
  config: { ...defaultConfig },
  lastLoaded: {
    name: '',
    source: '',
  },
  stats: {
    totalAnswered: 0,
    correctCount: 0,
    wrongCount: 0,
    dailyActivity: [0, 0, 0, 0, 0, 0, 0], // 一周内每天的做题数量
  },
})

// QuizStore 单例
export const QuizStore = {
  // 只读状态，防止直接修改
  state: readonly(state),

  // 获取题库数据
  getQuizData(): QuizData | null {
    return state.quizData
  },

  // 设置题库数据
  setQuizData(data: QuizData): void {
    state.quizData = data
  },

  // 获取刷题配置
  getConfig(): QuizConfig {
    return { ...state.config }
  },

  // 设置刷题配置
  setConfig(config: Partial<QuizConfig>): void {
    state.config = { ...state.config, ...config }
  },

  // 保存最后加载的题库信息
  setLastLoaded(name: string, source: string): void {
    state.lastLoaded.name = name
    state.lastLoaded.source = source
    storage.saveLastLoadedQuiz(name, source)
  },

  // 获取最后加载的题库信息
  getLastLoaded(): { name: string; source: string } {
    return { ...state.lastLoaded }
  },

  // 保存状态到本地存储
  saveToStorage(): void {
    if (state.quizData) {
      localStorage.setItem('quizData', JSON.stringify(state.quizData))
      localStorage.setItem('selectedChapter', state.config.chapterIndex)
      localStorage.setItem('quizMode', state.config.mode)
      localStorage.setItem('rangeStart', state.config.rangeStart.toString())
      localStorage.setItem('rangeEnd', state.config.rangeEnd.toString())
      localStorage.setItem('lastLoadedQuiz', JSON.stringify(state.lastLoaded))

      // 保存到独立缓存
      if (state.lastLoaded.name) {
        storage.saveQuizToStorage(state.lastLoaded.name, state.quizData)
      }
    }
  },

  // 从本地存储恢复状态
  loadFromStorage(): boolean {
    try {
      // 恢复题库数据
      const savedData = localStorage.getItem('quizData')
      if (savedData) {
        state.quizData = JSON.parse(savedData)
      } else {
        return false
      }

      // 恢复最后加载的题库信息
      const lastQuiz = localStorage.getItem('lastLoadedQuiz')
      if (lastQuiz) {
        state.lastLoaded = JSON.parse(lastQuiz)
      }

      // 恢复设置
      const savedChapter = localStorage.getItem('selectedChapter')
      if (savedChapter) state.config.chapterIndex = savedChapter

      const savedMode = localStorage.getItem('quizMode')
      if (savedMode && Object.values(QuizMode).includes(savedMode as QuizMode)) {
        state.config.mode = savedMode as QuizMode
      }

      // 恢复范围值
      const rangeStart = localStorage.getItem('rangeStart')
      if (rangeStart) state.config.rangeStart = parseInt(rangeStart)

      const rangeEnd = localStorage.getItem('rangeEnd')
      if (rangeEnd) state.config.rangeEnd = parseInt(rangeEnd)

      // 恢复统计数据
      this.loadStatsFromStorage()

      return true
    } catch (error) {
      console.error('从本地存储恢复状态失败:', error)
      return false
    }
  },

  // 从本地存储加载统计数据
  loadStatsFromStorage(): void {
    try {
      const statsData = localStorage.getItem('quizStats')
      if (statsData) {
        const stats = JSON.parse(statsData)
        state.stats = { ...state.stats, ...stats }
      }
    } catch (error) {
      console.error('加载统计数据失败:', error)
    }
  },

  // 保存统计数据到本地存储
  saveStatsToStorage(): void {
    localStorage.setItem('quizStats', JSON.stringify(state.stats))
  },

  // 更新答题统计
  updateStats(
    param:
      | boolean
      | Partial<{
          totalAnswered: number
          correctCount: number
          wrongCount: number
        }>,
  ): void {
    // 处理旧版本参数（单个布尔值表示是否答对）
    if (typeof param === 'boolean') {
      state.stats.totalAnswered++

      if (param) {
        // isCorrect
        state.stats.correctCount++
      } else {
        state.stats.wrongCount++
      }
    }
    // 处理新版本参数（统计对象）
    else {
      if (param.totalAnswered !== undefined) {
        state.stats.totalAnswered = param.totalAnswered
      }
      if (param.correctCount !== undefined) {
        state.stats.correctCount = param.correctCount
      }
      if (param.wrongCount !== undefined) {
        state.stats.wrongCount = param.wrongCount
      }
    }

    // 更新今日活动
    const today = new Date().getDay() // 0-6，表示周日到周六
    state.stats.dailyActivity[today]++

    // 保存统计数据
    this.saveStatsToStorage()
  },

  // 获取题库章节数组
  getChapters(): string[] {
    if (!state.quizData || !state.quizData.chapters) return []
    return state.quizData.chapters.map((c) => c.title)
  },

  // 获取题库总题目数
  getTotalQuestions(): number {
    if (!state.quizData || !state.quizData.chapters) return 0

    return state.quizData.chapters.reduce((total, chapter) => {
      return total + (chapter.questions?.length || 0)
    }, 0)
  },

  // 获取已答题数量
  getAnsweredCount(): number {
    return state.stats.totalAnswered
  },

  // 获取正确题数
  getCorrectCount(): number {
    return state.stats.correctCount
  },

  // 获取正确率
  getAccuracyRate(): string {
    const total = state.stats.totalAnswered
    if (total === 0) return '0%'
    return Math.round((state.stats.correctCount / total) * 100) + '%'
  },

  // 清除当前题库
  clearCurrentQuiz(): void {
    state.quizData = null
    state.lastLoaded = { name: '', source: '' }
    localStorage.removeItem('quizData')
    localStorage.removeItem('lastLoadedQuiz')
  },
}

// 导出类型
export type { QuizConfig }
