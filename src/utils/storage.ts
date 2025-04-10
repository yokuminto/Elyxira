import type { QuizData, LocalQuizCache } from '../pages/library/types'

/**
 * 保存题库到本地存储
 * @param name 题库名称
 * @param data 题库数据
 */
export function saveQuizToStorage(name: string, data: QuizData): void {
  const cacheKey = `quizCache_${name}`
  localStorage.setItem(cacheKey, JSON.stringify(data))
}

/**
 * 从本地存储加载题库
 * @param name 题库名称
 * @returns 题库数据或null
 */
export function loadQuizFromStorage(name: string): QuizData | null {
  const cacheKey = `quizCache_${name}`
  const data = localStorage.getItem(cacheKey)

  if (!data) return null

  try {
    return JSON.parse(data)
  } catch (e) {
    console.error(`解析缓存题库失败: ${name}`, e)
    return null
  }
}

/**
 * 从本地存储中删除题库
 * @param name 题库名称
 */
export function removeQuizFromStorage(name: string): void {
  const cacheKey = `quizCache_${name}`
  localStorage.removeItem(cacheKey)
}

/**
 * 保存题库列表到本地存储
 * @param list 题库列表
 */
export function saveQuizList(list: LocalQuizCache[]): void {
  localStorage.setItem('cachedQuizList', JSON.stringify(list))
}

/**
 * 从本地存储加载题库列表
 * @returns 题库列表或空数组
 */
export function loadQuizList(): LocalQuizCache[] {
  const data = localStorage.getItem('cachedQuizList')

  if (!data) return []

  try {
    return JSON.parse(data)
  } catch (e) {
    console.error('解析题库列表失败', e)
    return []
  }
}

/**
 * 保存最后一次加载的题库信息
 * @param quizName 题库名称
 * @param source 来源类型
 */
export function saveLastLoadedQuiz(quizName: string, source: string): void {
  localStorage.setItem(
    'lastLoadedQuiz',
    JSON.stringify({
      name: quizName,
      source: source,
    }),
  )
}

/**
 * 获取最后一次加载的题库信息
 * @returns 题库信息或null
 */
export function getLastLoadedQuiz(): { name: string; source: string } | null {
  const data = localStorage.getItem('lastLoadedQuiz')

  if (!data) return null

  try {
    return JSON.parse(data)
  } catch (e) {
    return null
  }
}

/**
 * 清除所有题库相关的本地存储
 */
export function clearAllQuizStorage(): void {
  // 先获取所有题库名称
  const quizList = loadQuizList()

  // 删除每个题库的缓存
  quizList.forEach((quiz) => {
    const cacheKey = `quizCache_${quiz.name}`
    localStorage.removeItem(cacheKey)
  })

  // 删除题库列表和最后加载的题库信息
  localStorage.removeItem('cachedQuizList')
  localStorage.removeItem('lastLoadedQuiz')
  localStorage.removeItem('quizData')
}
