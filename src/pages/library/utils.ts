import type { QuizData, Question } from './types'

// 从文本解析题库数据
export const parseTextQuiz = (text: string): QuizData => {
  const lines = text.split('\n').filter((line) => line.trim())
  const title = lines[0] || '未命名题库'
  const chapters: { title: string; questions: Question[] }[] = []

  let currentChapter: { title: string; questions: Question[] } = {
    title: '默认章节',
    questions: [],
  }
  let currentQuestion: Question | null = null

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()

    if (line.startsWith('## ')) {
      // 新章节
      if (currentChapter.questions.length > 0) {
        chapters.push(currentChapter)
      }
      currentChapter = { title: line.substring(3), questions: [] }
      currentQuestion = null
    } else if (line.match(/^\d+\./)) {
      // 新题目
      if (currentQuestion) {
        currentChapter.questions.push(currentQuestion)
      }
      currentQuestion = {
        id: `q-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        title: line.substring(line.indexOf('.') + 1).trim(),
        options: [],
        answer: 0,
        explanation: '',
      }
    } else if (line.startsWith('- ') && currentQuestion) {
      // 选项
      currentQuestion.options.push(line.substring(2).trim())
    } else if (line.startsWith('答案:') && currentQuestion) {
      // 答案
      const answerText = line.substring(3).trim()
      currentQuestion.answer = parseInt(answerText) - 1 || 0
    } else if (line.startsWith('解析:') && currentQuestion) {
      // 解析
      currentQuestion.explanation = line.substring(3).trim()
    }
  }

  // 添加最后一个题目和章节
  if (currentQuestion) {
    currentChapter.questions.push(currentQuestion)
  }
  if (currentChapter.questions.length > 0) {
    chapters.push(currentChapter)
  }

  return {
    title,
    chapters,
    description: '从文本导入',
    lastModified: Date.now(),
  }
}
