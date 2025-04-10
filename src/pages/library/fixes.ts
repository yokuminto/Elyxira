/**
 * 增强版题库数据验证函数，提高兼容性
 * 验证题库数据是否符合要求的结构
 */
export const enhancedValidQuizData = (data: Record<string, unknown>): boolean => {
  if (!data || typeof data !== 'object') return false
  if (!Array.isArray(data.chapters)) return false

  // 至少有一个章节
  if (data.chapters.length === 0) return false

  // 检查章节结构
  for (const chapter of data.chapters) {
    if (!chapter.title || !Array.isArray(chapter.questions)) {
      return false
    }

    // 检查题目结构
    for (const question of chapter.questions) {
      if (!question.title || !Array.isArray(question.options) || question.options.length === 0) {
        return false
      }

      // 检查答案 - 可以是数字或数字数组
      if (typeof question.answer !== 'number' && !Array.isArray(question.answer)) {
        return false
      }
    }
  }

  return true
}
