import {
  QuizSourceType,
  QuizCategoryType,
  type QuizData,
  type QuizItem,
  type LocalQuizCache,
  type QuizItemExtended,
} from '../pages/library/types'
import { showToast } from '../utils/toast'
import { parseTextQuiz } from '../pages/library/utils'
import { enhancedValidQuizData } from '../pages/library/fixes'
import * as storage from '../utils/storage'

/**
 * 题库服务类 - 处理题库数据的获取、保存等操作
 */
export class QuizService {
  /**
   * 加载本地存储的题库列表
   * @returns 本地题库列表
   */
  static async loadLocalQuizList(): Promise<LocalQuizCache[]> {
    try {
      const cachedList = storage.loadQuizList()

      // 过滤无效的题库（确保缓存中有数据）
      return cachedList.filter((quiz) => {
        const cacheKey = `quizCache_${quiz.name}`
        return localStorage.getItem(cacheKey) !== null
      })
    } catch (error) {
      console.error('加载本地题库列表失败:', error)
      return []
    }
  }

  /**
   * 加载在线题库列表
   * @returns 在线题库列表
   */
  static async loadOnlineQuizList(): Promise<QuizItem[]> {
    try {
      const indexUrl = '/data/index.json'
      const response = await fetch(indexUrl)

      if (!response.ok) {
        throw new Error(
          `无法加载题库索引文件 (${response.status}): 请确认public/data/index.json文件存在且格式正确`,
        )
      }

      const data = await response.json()

      if (Array.isArray(data)) {
        return data.map((item) => {
          let downloadUrl = item.download_url
          let itemPath = item.path || `${item.name}.json`

          // 规范化路径
          if (!downloadUrl) {
            if (!itemPath.startsWith('/') && !itemPath.startsWith('http')) {
              itemPath = `/data/${itemPath}`
            }
            downloadUrl = itemPath
          }

          return {
            ...item,
            path: itemPath,
            source: QuizSourceType.ONLINE,
            download_url: downloadUrl,
          }
        })
      }

      throw new Error('题库索引格式无效: 应为题库数组')
    } catch (error) {
      console.error('加载在线题库列表失败:', error)
      showToast(`加载在线题库列表失败: ${(error as Error).message}`, 'error')
      return []
    }
  }

  /**
   * 加载远程题库列表
   * @returns 远程题库列表
   */
  static async loadRemoteQuizList(): Promise<QuizItem[]> {
    // 检查是否配置了GitHub
    const owner = localStorage.getItem('github_owner')
    const repoName = localStorage.getItem('github_repo')
    const token = localStorage.getItem('github_token')

    if (!owner || !repoName) {
      return []
    }

    try {
      const branch = localStorage.getItem('github_branch') || 'main'
      const path = localStorage.getItem('github_path') || ''

      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `token ${token}`
      }

      const repo = `${owner}/${repoName}`
      const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`

      const response = await fetch(apiUrl, { headers })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`GitHub API错误 (${response.status}): ${errorData.message || '未知错误'}`)
      }

      const files = await response.json()

      if (!Array.isArray(files)) {
        throw new Error('GitHub API返回格式错误')
      }

      return files
        .filter(
          (file) =>
            file.type === 'file' && (file.name.endsWith('.json') || file.name.endsWith('.txt')),
        )
        .map((file) => ({
          name: file.name.replace(/\.(json|txt)$/, ''),
          path: file.path,
          download_url: file.download_url,
          source: QuizSourceType.REMOTE,
          info: `来自${repo}的远程题库`,
        }))
    } catch (error) {
      console.error('加载GitHub题库列表失败:', error)
      return []
    }
  }

  /**
   * 从URL加载题库数据
   * @param url 题库URL
   * @returns 题库数据
   */
  static async loadQuizFromUrl(url: string): Promise<QuizData> {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`获取题库失败 (${response.status})`)
    }

    const text = await response.text()
    let data: Record<string, unknown>

    try {
      if (url.endsWith('.json')) {
        data = JSON.parse(text)
      } else if (url.endsWith('.txt')) {
        data = parseTextQuiz(text) as unknown as Record<string, unknown>
      } else {
        // 尝试自动检测格式
        try {
          data = JSON.parse(text)
        } catch {
          data = parseTextQuiz(text) as unknown as Record<string, unknown>
        }
      }

      if (!enhancedValidQuizData(data as unknown as QuizData)) {
        throw new Error('题库格式无效')
      }

      return data as unknown as QuizData
    } catch (error) {
      console.error('解析题库失败:', error)
      throw new Error(`解析题库数据失败: ${(error as Error).message}`)
    }
  }

  /**
   * 从本地文件加载题库
   * @param file 文件对象
   * @returns Promise<QuizData>
   */
  static loadQuizFromFile(file: File): Promise<QuizData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = function (e) {
        try {
          const content = e.target?.result as string
          let data: Record<string, unknown>

          if (file.name.endsWith('.json')) {
            data = JSON.parse(content)
          } else if (file.name.endsWith('.txt')) {
            data = parseTextQuiz(content) as unknown as Record<string, unknown>
          } else {
            throw new Error('不支持的文件格式')
          }

          if (enhancedValidQuizData(data as unknown as QuizData)) {
            resolve(data as unknown as QuizData)
          } else {
            reject(new Error('题库格式无效'))
          }
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => reject(new Error('读取文件失败'))

      if (file.name.endsWith('.json') || file.name.endsWith('.txt')) {
        reader.readAsText(file)
      } else {
        reject(new Error('不支持的文件格式，请上传 .json 或 .txt 文件'))
      }
    })
  }

  /**
   * 保存题库到本地缓存，并更新题库列表
   * @param quiz 题库信息
   * @param data 题库数据
   */
  static saveQuizToLocalCache(quiz: QuizItem, data: QuizData): void {
    // 保存题库数据
    storage.saveQuizToStorage(quiz.name, data)

    // 确定导入的来源类型
    const importSource =
      quiz.source === QuizSourceType.ONLINE
        ? QuizSourceType.ONLINE_IMPORT
        : quiz.source === QuizSourceType.REMOTE
          ? QuizSourceType.REMOTE_IMPORT
          : QuizSourceType.LOCAL

    // 更新题库列表
    const localList = storage.loadQuizList()
    const existingIndex = localList.findIndex(
      (q) => q.name === quiz.name && q.source === importSource,
    )

    const updatedQuiz: LocalQuizCache = {
      id: `${importSource}-${Date.now()}`,
      name: quiz.name,
      path: 'localStorage',
      source: importSource,
      info: quiz.info || `从${quiz.source}导入`,
      title: quiz.name,
      lastModified: Date.now(),
    }

    if (existingIndex >= 0) {
      localList[existingIndex] = updatedQuiz
    } else {
      localList.push(updatedQuiz)
    }

    storage.saveQuizList(localList)
  }

  /**
   * 删除本地缓存的题库
   * @param quizName 题库名称
   */
  static deleteLocalQuiz(quizName: string): void {
    // 删除缓存
    storage.removeQuizFromStorage(quizName)

    // 更新列表
    const list = storage.loadQuizList()
    const updatedList = list.filter((quiz) => quiz.name !== quizName)
    storage.saveQuizList(updatedList)

    // 如果是当前加载的题库，也清除当前题库
    const lastLoaded = storage.getLastLoadedQuiz()
    if (lastLoaded && lastLoaded.name === quizName) {
      localStorage.removeItem('quizData')
      localStorage.removeItem('lastLoadedQuiz')
    }
  }

  /**
   * 获取题库分类
   * @param sourceType 来源类型
   * @returns 分类类型
   */
  static getQuizCategory(sourceType: QuizSourceType): string {
    switch (sourceType) {
      case QuizSourceType.LOCAL:
      case QuizSourceType.ONLINE_IMPORT:
      case QuizSourceType.REMOTE_IMPORT:
        return QuizCategoryType.CACHE
      case QuizSourceType.ONLINE:
        return QuizCategoryType.ONLINE
      case QuizSourceType.REMOTE:
        return QuizCategoryType.REMOTE
      default:
        return QuizCategoryType.CACHE
    }
  }

  /**
   * 获取题库来源显示名称
   * @param sourceType 来源类型
   * @returns 显示名称
   */
  static getSourceLabel(sourceType: QuizSourceType): string {
    switch (sourceType) {
      case QuizSourceType.LOCAL:
        return '从文件导入'
      case QuizSourceType.ONLINE_IMPORT:
        return '从在线导入'
      case QuizSourceType.REMOTE_IMPORT:
        return '从远程导入'
      case QuizSourceType.ONLINE:
        return '在线题库'
      case QuizSourceType.REMOTE:
        return '远程题库'
      default:
        return '未知来源'
    }
  }

  /**
   * 获取要显示的题库描述
   * @param quiz 题库信息
   * @returns 题库描述
   */
  static getQuizDescription(quiz: QuizItemExtended | null): string {
    if (!quiz) return '暂无描述'

    if (quiz.info) return quiz.info
    if (quiz.data?.description) return quiz.data.description

    return this.getSourceLabel(quiz.source)
  }
}
