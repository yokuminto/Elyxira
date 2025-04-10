/**
 * 存储工具模块
 * 用于提供本地存储相关操作
 */
import type { QuizData } from '@/pages/library/types'

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
