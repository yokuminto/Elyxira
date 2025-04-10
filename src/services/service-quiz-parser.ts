import type { QuizData, Question, Chapter } from './config-service'

/**
 * 解析器接口，定义解析器的基本结构
 */
interface QuizParser {
  /**
   * 检测数据是否符合该解析器处理的格式
   * @param data 待检测的数据
   * @returns 是否匹配该解析器格式
   */
  canParse(data: unknown): boolean

  /**
   * 解析数据为标准QuizData格式
   * @param data 待解析的数据
   * @param source 可选的数据来源信息（如文件名）
   * @returns 标准格式的QuizData
   */
  parse(data: unknown, source?: string): QuizData
}

/**
 * 标准格式解析器
 * 处理已经符合标准QuizData格式的数据
 */
class StandardFormatParser implements QuizParser {
  canParse(data: unknown): boolean {
    if (!data || typeof data !== 'object') return false

    const obj = data as Record<string, unknown>

    // 必须有chapters字段，且为非空数组
    if (!Array.isArray(obj.chapters) || obj.chapters.length === 0) return false

    // 检查第一个章节
    const firstChapter = obj.chapters[0] as Record<string, unknown>
    if (!firstChapter.title || !Array.isArray(firstChapter.questions)) return false

    // 如果有问题，检查第一个问题的格式
    if (firstChapter.questions.length > 0) {
      const firstQuestion = firstChapter.questions[0] as Record<string, unknown>
      if (!firstQuestion.title || !Array.isArray(firstQuestion.options)) return false
    }

    return true
  }

  parse(data: unknown): QuizData {
    // 已经是标准格式，直接转换返回
    return data as QuizData
  }
}

/**
 * 文本格式解析器
 * 处理简单的文本格式题库
 */
class TextFormatParser implements QuizParser {
  canParse(data: unknown): boolean {
    return typeof data === 'string' && !this.isJson(data as string)
  }

  private isJson(text: string): boolean {
    try {
      JSON.parse(text)
      return true
    } catch {
      return false
    }
  }

  parse(data: unknown, source?: string): QuizData {
    if (typeof data !== 'string') {
      throw new Error('TextFormatParser只能处理字符串数据')
    }

    const text = data
    const lines = text.split('\n').filter((line) => line.trim())
    const title = source ? source.replace(/\.(txt|json)$/, '') : lines[0] || '未命名题库'
    const chapters: Chapter[] = []

    let currentChapter: Chapter = {
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
}

/**
 * 人卫执医格式解析器
 * 处理人卫执医及类似格式的JSON数据
 */
class PmphFormatParser implements QuizParser {
  canParse(data: unknown): boolean {
    if (!data || typeof data !== 'object') return false

    const obj = data as Record<string, unknown>

    // 检查是否有questions数组，这是人卫执医格式的特征
    if (Array.isArray(obj.questions) && obj.questions.length > 0) {
      return true
    }

    // 如果是数组，也可能是人卫执医格式
    if (Array.isArray(data) && data.length > 0) {
      const firstItem = data[0] as Record<string, unknown>
      if (firstItem && typeof firstItem === 'object') {
        return (
          firstItem.question !== undefined ||
          firstItem.title !== undefined ||
          firstItem.stem !== undefined ||
          firstItem.options !== undefined ||
          firstItem.answer !== undefined
        )
      }
    }

    return false
  }

  parse(data: unknown, source?: string): QuizData {
    const jsonData = data as Record<string, unknown>

    // 题库标题
    let title = (jsonData.title as string) || '题库'

    // 尝试从source获取题库标题
    if (source) {
      title = source.replace(/\.(json|txt)$/, '')
    } else if (jsonData.fileName && typeof jsonData.fileName === 'string') {
      title = jsonData.fileName.replace(/\.(json|txt)$/, '')
    } else if (jsonData.name && typeof jsonData.name === 'string') {
      title = jsonData.name
    }

    // 处理方括号包裹的标题
    if (title.includes('[') && title.includes(']')) {
      title = title.replace(/\[|\]/g, '')
    }

    // 初始化章节
    const chapters: Chapter[] = []
    const defaultChapter: Chapter = {
      title: '默认章节',
      questions: [],
    }

    // 处理题目数据
    this.processQuestions(jsonData, defaultChapter)

    // 添加默认章节到章节列表
    if (defaultChapter.questions.length > 0) {
      chapters.push(defaultChapter)
    }

    // 处理章节数据
    this.processChapters(jsonData, chapters)

    // 返回标准格式的数据
    return {
      title,
      description: typeof jsonData.description === 'string' ? jsonData.description : '导入的题库',
      author: typeof jsonData.author === 'string' ? jsonData.author : '',
      version: typeof jsonData.version === 'string' ? jsonData.version : '1.0',
      lastModified: Date.now(),
      chapters: chapters.length > 0 ? chapters : [defaultChapter],
    }
  }

  /**
   * 处理题目数据
   */
  private processQuestions(data: Record<string, unknown>, chapter: Chapter): void {
    // 检查是否有直接的questions数组
    if (Array.isArray(data.questions)) {
      data.questions.forEach((item: unknown, index: number) => {
        if (!item || typeof item !== 'object') return

        const itemObj = item as Record<string, unknown>
        this.createQuestion(itemObj, index, chapter)
      })
    } else if (Array.isArray(data)) {
      // 可能是题目数组
      data.forEach((item: unknown, index: number) => {
        if (!item || typeof item !== 'object') return

        const itemObj = item as Record<string, unknown>
        this.createQuestion(itemObj, index, chapter)
      })
    }
  }

  /**
   * 处理章节数据
   */
  private processChapters(data: Record<string, unknown>, chapters: Chapter[]): void {
    if (Array.isArray(data.chapters) && data.chapters.length > 0) {
      data.chapters.forEach((chapter: unknown, chapterIndex: number) => {
        if (!chapter || typeof chapter !== 'object') return

        const chapterObj = chapter as Record<string, unknown>

        if (
          chapterObj.title &&
          Array.isArray(chapterObj.questions) &&
          chapterObj.questions.length > 0
        ) {
          const processedChapter: Chapter = {
            title:
              typeof chapterObj.title === 'string' ? chapterObj.title : `第${chapterIndex + 1}章`,
            questions: [],
          }

          chapterObj.questions.forEach((q: unknown, index: number) => {
            if (!q || typeof q !== 'object') return

            const qObj = q as Record<string, unknown>
            this.createQuestion(qObj, index, processedChapter)
          })

          if (processedChapter.questions.length > 0) {
            chapters.push(processedChapter)
          }
        }
      })
    }
  }

  /**
   * 创建标准格式的题目
   */
  private createQuestion(data: Record<string, unknown>, index: number, chapter: Chapter): void {
    // 创建题目对象
    const question: Question = {
      id:
        typeof data.id === 'string' || typeof data.id === 'number'
          ? String(data.id)
          : `q-${Date.now()}-${index}`,
      title: '',
      options: [],
      answer: 0,
      explanation: '',
    }

    // 处理题目标题
    if (typeof data.question === 'string') {
      question.title = data.question
    } else if (typeof data.title === 'string') {
      question.title = data.title
    } else if (typeof data.stem === 'string') {
      question.title = data.stem
    } else if (typeof data.content === 'string') {
      question.title = data.content
    } else {
      question.title = `第${index + 1}题`
    }

    // 处理特殊标记
    if (question.title.includes('<p>') || question.title.includes('</p>')) {
      question.title = question.title.replace(/<\/?p>/g, '')
    }

    // 处理解析
    if (typeof data.analysis === 'string') {
      question.explanation = data.analysis
    } else if (typeof data.explanation === 'string') {
      question.explanation = data.explanation
    } else if (typeof data.parse === 'string') {
      question.explanation = data.parse
    } else if (typeof data.comment === 'string') {
      question.explanation = data.comment
    }

    // 处理选项
    question.options = this.extractOptions(data)

    // 处理答案
    question.answer = this.extractAnswer(data, question.options.length)

    // 添加到章节
    chapter.questions.push(question)
  }

  /**
   * 从题目数据中提取选项
   */
  private extractOptions(data: Record<string, unknown>): string[] {
    // 尝试从常见选项字段提取
    if (Array.isArray(data.options)) {
      return this.processOptionsArray(data.options)
    } else if (data.options && typeof data.options === 'object') {
      return this.processOptionsObject(data.options as Record<string, unknown>)
    } else if (Array.isArray(data.choices)) {
      return this.processOptionsArray(data.choices)
    } else if (data.choices && typeof data.choices === 'object') {
      return this.processOptionsObject(data.choices as Record<string, unknown>)
    }

    // 尝试从A, B, C, D等属性中提取选项
    const options: string[] = []
    const optionKeys = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

    for (const key of optionKeys) {
      if (key in data && typeof data[key] === 'string') {
        options.push(data[key] as string)
      }
    }

    // 如果找到了至少两个选项，则认为这是有效的选项集
    if (options.length >= 2) {
      return options
    }

    // 默认选项
    return ['选项A', '选项B', '选项C', '选项D']
  }

  /**
   * 处理选项数组
   */
  private processOptionsArray(options: unknown[]): string[] {
    return options.map((opt: unknown) => {
      if (typeof opt === 'string') return opt
      if (typeof opt === 'number') return String(opt)
      if (opt === null) return ''

      if (typeof opt === 'object') {
        const optObj = opt as Record<string, unknown>

        if (typeof optObj.text === 'string') return optObj.text
        if (typeof optObj.content === 'string') return optObj.content
        if (typeof optObj.label === 'string') return optObj.label
        if (typeof optObj.value === 'string') return optObj.value
        if (typeof optObj.option === 'string') return optObj.option

        // 可能有像 {A: "选项内容"} 这样的格式
        const keys = Object.keys(optObj)
        if (keys.length === 1 && typeof optObj[keys[0]] === 'string') {
          return optObj[keys[0]] as string
        }

        return JSON.stringify(opt)
      }

      return String(opt)
    })
  }

  /**
   * 处理选项对象
   */
  private processOptionsObject(options: Record<string, unknown>): string[] {
    // 提取选项键
    let keys = Object.keys(options)

    // 尝试按顺序排序键
    keys = keys.sort((a, b) => {
      // 如果是A,B,C,D形式
      if (/^[A-Z]$/.test(a) && /^[A-Z]$/.test(b)) {
        return a.charCodeAt(0) - b.charCodeAt(0)
      }
      // 如果是数字形式
      if (/^\d+$/.test(a) && /^\d+$/.test(b)) {
        return parseInt(a) - parseInt(b)
      }
      // 默认字典序
      return a.localeCompare(b)
    })

    return keys.map((key) => {
      const opt = options[key]
      if (typeof opt === 'string') return opt
      if (typeof opt === 'number') return String(opt)
      if (opt === null) return ''

      if (typeof opt === 'object') {
        const optObj = opt as Record<string, unknown>

        if (typeof optObj.text === 'string') return optObj.text
        if (typeof optObj.content === 'string') return optObj.content
        if (typeof optObj.label === 'string') return optObj.label
        if (typeof optObj.value === 'string') return optObj.value

        return JSON.stringify(opt)
      }

      return String(opt)
    })
  }

  /**
   * 从题目数据中提取答案
   */
  private extractAnswer(data: Record<string, unknown>, optionsLength: number): number | number[] {
    let answer: unknown = undefined

    // 尝试从常见答案字段提取
    if (data.answer !== undefined) {
      answer = data.answer
    } else if (data.correct !== undefined) {
      answer = data.correct
    } else if (data.rightAnswer !== undefined) {
      answer = data.rightAnswer
    } else if (data.correctAnswer !== undefined) {
      answer = data.correctAnswer
    }

    return this.processAnswer(answer, optionsLength)
  }

  /**
   * 处理答案，转换为索引
   */
  private processAnswer(answer: unknown, optionsLength: number): number | number[] {
    // 数字答案
    if (typeof answer === 'number') {
      return Math.min(Math.max(0, answer), optionsLength - 1)
    }

    // 字符串答案
    if (typeof answer === 'string') {
      // 处理 "A", "B", "C" 等格式
      if (/^[A-Z]$/.test(answer)) {
        const index = answer.charCodeAt(0) - 65 // 'A'的ASCII码是65
        return Math.min(Math.max(0, index), optionsLength - 1)
      }

      // 处理 "1", "2", "3" 等格式
      if (/^\d+$/.test(answer)) {
        const index = parseInt(answer) - 1
        return Math.min(Math.max(0, index), optionsLength - 1)
      }

      // 处理多选，如 "AB" "AC" 等
      if (/^[A-Z]+$/.test(answer)) {
        return Array.from(answer).map((char) => {
          const index = char.charCodeAt(0) - 65
          return Math.min(Math.max(0, index), optionsLength - 1)
        })
      }

      // 处理逗号分隔的多选答案
      if (answer.includes(',')) {
        return answer.split(',').map((part) => {
          if (/^[A-Z]$/.test(part)) {
            return part.charCodeAt(0) - 65
          }
          if (/^\d+$/.test(part)) {
            return parseInt(part) - 1
          }
          return 0
        })
      }
    }

    // 数组答案
    if (Array.isArray(answer)) {
      return answer.map((ans) => {
        if (typeof ans === 'number') {
          return Math.min(Math.max(0, ans), optionsLength - 1)
        }
        if (typeof ans === 'string') {
          if (/^[A-Z]$/.test(ans)) {
            return ans.charCodeAt(0) - 65
          }
          if (/^\d+$/.test(ans)) {
            return parseInt(ans) - 1
          }
        }
        return 0
      })
    }

    // 默认返回第一个选项
    return 0
  }
}

/**
 * 题库解析器服务
 * 统一管理和使用各种解析器
 */
export class QuizParserService {
  private parsers: QuizParser[] = []

  constructor() {
    // 注册默认解析器（按优先级顺序）
    this.register(new StandardFormatParser())
    this.register(new TextFormatParser())
    this.register(new PmphFormatParser())
  }

  /**
   * 注册新的解析器
   * @param parser 解析器实例
   */
  register(parser: QuizParser): void {
    this.parsers.push(parser)
  }

  /**
   * 解析题库数据
   * @param data 待解析的数据
   * @param source 可选的数据来源信息
   * @returns 解析后的标准题库数据
   */
  parse(data: unknown, source?: string): QuizData {
    // 如果输入是字符串且可能是JSON，尝试解析
    let jsonData: unknown = data
    if (typeof data === 'string') {
      try {
        jsonData = JSON.parse(data)
      } catch (e) {
        // 非JSON字符串，保持原样
      }
    }

    // 遍历所有解析器，使用第一个匹配的
    for (const parser of this.parsers) {
      if (parser.canParse(jsonData)) {
        return parser.parse(jsonData, source)
      }
    }

    // 所有解析器都不匹配，使用最通用的解析器（这里是PmphFormatParser）
    return new PmphFormatParser().parse(jsonData, source)
  }
}

// 导出单例实例，方便直接使用
export const quizParserService = new QuizParserService()

/**
 * 统一的解析函数，使用QuizParserService处理各种格式
 * @param data 待解析的数据
 * @param source 可选的数据来源信息
 * @returns 解析后的标准题库数据
 */
export function parseQuiz(data: unknown, source?: string): QuizData {
  return quizParserService.parse(data, source)
}
