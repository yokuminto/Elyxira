/**
 * 配置与状态管理服务
 * 负责所有配置、存储和状态管理的功能
 */

// ============================================================
// 类型定义部分
// ============================================================

// UI设置接口
export interface UiSettings {
  darkMode: boolean
  themeColor: string
  customColor: string
  fontSize: number
  fontFamily: string
  animationEnabled: boolean
}

// 测验设置接口
export interface QuizSettings {
  autoSubmit: boolean
  autoNext: boolean
  allowSkip: boolean
  showNotesAfterAnswer: boolean
  lockAnswerAfterSubmit: boolean
  showCorrectAnswerImmediately: boolean
  showProgress: boolean
  swipeGestureEnabled: boolean
  randomMode: boolean
  reviewMode: boolean
  viewWrongAfterAll?: boolean
  canEditQuestion?: boolean
}

// API配置接口
export interface ApiConfig {
  enabled: boolean
  autoGenerate?: boolean
  streamOutput?: boolean
  autoSync?: boolean
  apiUrl?: string
  apiKey?: string
  model?: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  topP?: number
}

// GitHub仓库配置
export interface GithubConfig {
  owner: string
  repo: string
  branch: string
  path: string
  token: string
  forceSync?: boolean
  syncQuizName?: string
  createRemoteRepo?: boolean
}

// 通用设置接口
export interface GeneralSettings {
  uiSettings: UiSettings
  quizSettings: QuizSettings
  debugEnabled: boolean
  apiConfig: ApiConfig
}

// API预设接口 (新增)
export interface ApiPreset extends ApiConfig {
  name: string
}

// 完整应用配置
export interface AppSettings extends Omit<GeneralSettings, 'apiConfig'> {
  githubConfig: GithubConfig
  lastSyncTimestamp: number
  apiPresets: ApiPreset[]
  activeApiPresetName: string
}

// 导出配置数据格式
export interface ConfigExportData {
  timestamp: string
  version: string
  exportDate: string
  generalSettings: Record<string, unknown>
  quizSettings: Record<string, unknown>
  apiPresets?: ApiPreset[]
  activeApiPresetName?: string
  repoSettings: Record<string, unknown>
  stats: Record<string, unknown>
  statisticsData?: Record<string, unknown>
  userAnswers?: Record<string, unknown>
}

// 测验模式枚举
export enum QuizMode {
  NORMAL = 'normal',
  RANDOM = 'random',
  EXAM = 'exam',
  WRONG = 'wrong',
  REVIEW = 'review',
  RANGE = 'range',
}

// 定义题库来源类型枚举
export enum QuizSourceType {
  LOCAL = 'local', // 本地导入
  ONLINE_IMPORT = 'online-import', // 从在线导入的缓存
  REMOTE_IMPORT = 'remote-import', // 从远程导入的缓存
  ONLINE = 'online', // 在线题库
  REMOTE = 'remote', // 远程题库
}

// 定义题库分类类型枚举
export enum QuizCategoryType {
  CACHE = 'cache', // 缓存（包含local, online-import, remote-import）
  ONLINE = 'online', // 在线
  REMOTE = 'remote', // 远程
}

// 笔记处理结果接口
export interface NotesRenderResult {
  contentHtml: string
}

// 笔记生成回调接口
export interface NotesGenerationCallbacks {
  onStart?: () => void
  onProgress?: (chunk: string) => void
  onCompletion?: (note: string) => void
  onError?: (error: Error) => void
}

// 测验章节接口
export interface Chapter {
  title: string
  questions: Question[]
}

// 测验问题接口
export interface Question {
  id?: string
  title: string
  options: string[]
  answer: number | number[] | string
  explanation?: string
  notes?: string
  question?: string
  userAnswer?: string | null
  chapterTitle?: string
  number?: number
}

// 测验数据接口
export interface QuizData {
  title: string
  description?: string
  author?: string
  version?: string
  questionCount?: number
  lastModified?: number
  chapters: Chapter[]
}

// 本地题库缓存接口
export interface LocalQuizCache {
  id: string
  name: string
  path: string
  source: string
  info?: string
  title?: string
  lastModified: number
  data?: QuizData
}

// 题库项接口
export interface QuizItem {
  name: string
  source: QuizSourceType
  path?: string
  info?: string
  download_url?: string
  lastModified?: number
  id?: string
}

// 扩展题库项接口
export interface QuizItemExtended {
  id: string
  source: QuizSourceType
  name: string
  path?: string
  download_url?: string
  info?: string
  title?: string
  quiz?: QuizItem
  lastModified?: number
  data?: QuizData
}

// 选中题库接口
export interface SelectedQuiz {
  source: string
  quiz: QuizItem
}

// GitHub API 文件接口
export interface GithubApiFile {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string
  type: string
  content?: string
}

// 测验配置接口
export interface QuizConfig {
  chapterIndex: string
  mode: QuizMode
  rangeStart: number
  rangeEnd: number
  randomize: boolean
  wrongOnly: boolean
}

import { showToast } from '@/utils/toast'
import { reactive, readonly } from 'vue'
import { quizParserService } from './service-quiz-parser'
import { marked, Marked } from 'marked' // Import Marked type

// 配置存储的唯一键名
const SETTINGS_KEY = 'app_settings'

// 默认UI设置
const DEFAULT_UI_SETTINGS: UiSettings = {
  darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
  themeColor: 'default',
  customColor: '#4caf50',
  fontSize: 14,
  fontFamily: 'sans-serif',
  animationEnabled: false,
}

// 默认测验设置
const DEFAULT_QUIZ_SETTINGS: QuizSettings = {
  autoSubmit: false,
  autoNext: false,
  allowSkip: false,
  showNotesAfterAnswer: false,
  lockAnswerAfterSubmit: false,
  showCorrectAnswerImmediately: false,
  showProgress: false,
  swipeGestureEnabled: false,
  randomMode: false,
  reviewMode: false,
  viewWrongAfterAll: false,
  canEditQuestion: false,
}

// 默认API配置
const DEFAULT_API_CONFIG: ApiConfig = {
  enabled: false,
  autoGenerate: false,
  streamOutput: false,
  autoSync: false,
  apiUrl: '',
  apiKey: '',
  model: '',
  systemPrompt: '',
  temperature: 0.7,
  maxTokens: 2000,
  topP: 1,
}

// 默认GitHub配置
const DEFAULT_GITHUB_CONFIG: GithubConfig = {
  owner: '',
  repo: '',
  branch: 'main',
  path: '',
  token: '',
  forceSync: false,
  syncQuizName: '',
  createRemoteRepo: false,
}

// 默认应用设置
const DEFAULT_SETTINGS: AppSettings = {
  uiSettings: DEFAULT_UI_SETTINGS,
  quizSettings: DEFAULT_QUIZ_SETTINGS,
  debugEnabled: false,
  githubConfig: DEFAULT_GITHUB_CONFIG,
  lastSyncTimestamp: 0,
  apiPresets: [createDefaultPreset(DEFAULT_API_CONFIG)],
  activeApiPresetName: 'Default',
}

// 默认测验配置
const DEFAULT_QUIZ_CONFIG: QuizConfig = {
  chapterIndex: 'all',
  mode: QuizMode.NORMAL,
  rangeStart: 1,
  rangeEnd: 50,
  randomize: false,
  wrongOnly: false,
}

// Helper function to generate a default preset
function createDefaultPreset(config: ApiConfig, name = 'Default'): ApiPreset {
  const baseConfig = { ...DEFAULT_API_CONFIG, ...config }
  return { name, ...baseConfig }
}

// 定义API请求参数的接口
interface ApiRequestParams {
  model: string
  messages: { role: string; content: string }[]
  max_tokens: number
  temperature: number
  top_p: number
  stream: boolean
  user: string
}

/**
 * 配置服务类
 */
class ConfigService {
  private settings: AppSettings
  private version = '1.0'
  private listeners: Map<string, Array<() => void>> = new Map()

  // 存储测验状态
  private quizState = reactive<{
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
    config: { ...DEFAULT_QUIZ_CONFIG },
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

  // 只读状态，用于兼容旧代码
  public state = readonly(this.quizState)

  constructor() {
    this.settings = this.loadSettings()
    this.applyTheme()
    this.initQuizFromStorage()
  }

  /**
   * 加载设置
   */
  private loadSettings(): AppSettings {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_KEY)
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings)

        return this.mergeWithDefaults(parsed)
      }
      return { ...DEFAULT_SETTINGS }
    } catch (error) {
      console.error('加载配置失败:', error)
      // 如果加载失败，确保返回包含有效预设的默认设置
      const defaults = { ...DEFAULT_SETTINGS }
      if (!defaults.apiPresets || defaults.apiPresets.length === 0) {
        defaults.apiPresets = [createDefaultPreset(DEFAULT_API_CONFIG)]
        defaults.activeApiPresetName = 'Default'
      }
      if (
        !defaults.activeApiPresetName ||
        !defaults.apiPresets.some((p) => p.name === defaults.activeApiPresetName)
      ) {
        defaults.activeApiPresetName = defaults.apiPresets[0].name
      }
      return defaults
    }
  }

  /**
   * 将存储的设置与默认值合并
   */
  private mergeWithDefaults(storedSettings: Partial<AppSettings>): AppSettings {
    // 确保 apiPresets 和 activeApiPresetName 存在并有效
    const apiPresets =
      storedSettings.apiPresets && storedSettings.apiPresets.length > 0
        ? storedSettings.apiPresets.map((p) => ({ ...DEFAULT_API_CONFIG, ...p })) // 合并每个预设与默认值
        : [...DEFAULT_SETTINGS.apiPresets]

    const activeApiPresetName =
      storedSettings.activeApiPresetName &&
      apiPresets.some((p) => p.name === storedSettings.activeApiPresetName)
        ? storedSettings.activeApiPresetName
        : apiPresets[0]?.name || 'Default' // 如果无效，则使用第一个预设的名称

    return {
      uiSettings: { ...DEFAULT_UI_SETTINGS, ...storedSettings.uiSettings },
      quizSettings: { ...DEFAULT_QUIZ_SETTINGS, ...storedSettings.quizSettings },
      debugEnabled: storedSettings.debugEnabled ?? DEFAULT_SETTINGS.debugEnabled,
      githubConfig: { ...DEFAULT_GITHUB_CONFIG, ...storedSettings.githubConfig },
      lastSyncTimestamp: storedSettings.lastSyncTimestamp ?? 0,
      apiPresets: apiPresets,
      activeApiPresetName: activeApiPresetName,
    }
  }

  /**
   * 保存设置
   */
  private saveSettings(): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings))
      this.notifyListeners('settings')
    } catch (error) {
      console.error('保存配置失败:', error)
      showToast('保存配置失败: ' + (error as Error).message, 'error')
    }
  }

  /**
   * 应用主题设置
   */
  private applyTheme(): void {
    const { darkMode, fontSize, fontFamily } = this.settings.uiSettings
    document.documentElement.setAttribute('theme', darkMode ? 'dark' : 'light')
    document.documentElement.style.setProperty('--font-size', `${fontSize}px`)
    document.documentElement.style.setProperty('--font-family', fontFamily)
  }

  /**
   * 添加配置变更监听器
   * @param key 监听的配置类型（'settings', 'ui', 'quiz', 'api', 'github'）
   * @param callback 当配置变更时调用的回调函数
   */
  public addListener(key: string, callback: () => void): void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, [])
    }
    this.listeners.get(key)?.push(callback)
  }

  /**
   * 移除配置变更监听器
   */
  public removeListener(key: string, callback: () => void): void {
    if (this.listeners.has(key)) {
      const callbacks = this.listeners.get(key)
      const index = callbacks?.indexOf(callback) ?? -1
      if (index !== -1 && callbacks) {
        callbacks.splice(index, 1)
      }
    }
  }

  /**
   * 通知指定类型的监听器
   */
  private notifyListeners(key: string): void {
    const callbacks = this.listeners.get(key)
    if (callbacks) {
      callbacks.forEach((callback) => callback())
    }

    // 同时通知全局监听器
    if (key !== 'settings') {
      this.notifyListeners('settings')
    }
  }

  /**
   * 获取所有设置
   */
  public getSettings(): AppSettings {
    // 确保返回的设置包含有效的预设和活动名称
    const settings = { ...this.settings }
    if (!settings.apiPresets || settings.apiPresets.length === 0) {
      settings.apiPresets = [createDefaultPreset(DEFAULT_API_CONFIG)]
      settings.activeApiPresetName = 'Default'
    }
    if (
      !settings.activeApiPresetName ||
      !settings.apiPresets.some((p) => p.name === settings.activeApiPresetName)
    ) {
      settings.activeApiPresetName = settings.apiPresets[0].name
    }
    return settings
  }

  /**
   * 更新设置
   */
  public updateSettings(newSettings: Partial<AppSettings>, notify: boolean = true): void {
    // 合并新旧设置，特别处理预设列表和活动名称
    const mergedSettings = { ...this.settings, ...newSettings }

    // 确保 apiPresets 仍然是一个数组
    if (!Array.isArray(mergedSettings.apiPresets)) {
      mergedSettings.apiPresets = [...this.settings.apiPresets] // 恢复之前的状态或默认
      if (mergedSettings.apiPresets.length === 0) {
        mergedSettings.apiPresets = [createDefaultPreset(DEFAULT_API_CONFIG)]
      }
    }
    // 确保 activeApiPresetName 仍然有效
    if (
      !mergedSettings.activeApiPresetName ||
      !mergedSettings.apiPresets.some((p) => p.name === mergedSettings.activeApiPresetName)
    ) {
      mergedSettings.activeApiPresetName = mergedSettings.apiPresets[0]?.name || 'Default'
    }

    this.settings = mergedSettings
    this.saveSettings()
    this.applyTheme() // applyTheme 通常不依赖API设置，保留
    if (notify) {
      showToast('设置已保存', 'success')
    }
    this.notifyListeners('settings') // 确保通知设置变更
    this.notifyListeners('api') // 如果API相关设置改变也通知
  }

  /***********************************************
   * UI设置方法
   ***********************************************/
  /**
   * 获取UI设置
   */
  public getUiSettings(): UiSettings {
    return { ...this.settings.uiSettings }
  }

  /**
   * 更新UI设置
   */
  public updateUiSettings(uiSettings: Partial<UiSettings>, notify: boolean = true): void {
    this.settings.uiSettings = { ...this.settings.uiSettings, ...uiSettings }
    this.saveSettings()
    this.applyTheme()
    this.notifyListeners('ui')
    if (notify) {
      showToast('界面设置已保存', 'success')
    }
  }

  /**
   * 切换深色模式
   */
  public toggleDarkMode(): void {
    const darkMode = !this.settings.uiSettings.darkMode
    this.updateUiSettings({ darkMode })
  }

  /**
   * 设置字体大小
   */
  public setFontSize(fontSize: number): void {
    this.updateUiSettings({ fontSize })
  }

  /***********************************************
   * 测验设置方法
   ***********************************************/
  /**
   * 获取测验设置
   */
  public getQuizSettings(): QuizSettings {
    return { ...this.settings.quizSettings }
  }

  /**
   * 更新测验设置
   */
  public updateQuizSettings(quizSettings: Partial<QuizSettings>, notify: boolean = true): void {
    this.settings.quizSettings = { ...this.settings.quizSettings, ...quizSettings }
    this.saveSettings()

    // 更新当前活动的 quiz 配置
    if (quizSettings.randomMode !== undefined) {
      this.quizState.config.randomize = quizSettings.randomMode
    }

    // 如果是随机模式或复习模式发生变化，需要更新 mode
    if (quizSettings.randomMode !== undefined || quizSettings.reviewMode !== undefined) {
      // 优先判断复习模式
      if (quizSettings.reviewMode) {
        this.quizState.config.mode = QuizMode.REVIEW
      }
      // 然后判断随机模式
      else if (quizSettings.randomMode) {
        this.quizState.config.mode = QuizMode.RANDOM
      }
      // 两者都不是则使用普通模式
      else {
        this.quizState.config.mode = QuizMode.NORMAL
      }

      // 保存到本地存储
      this.saveQuizConfigToStorage()
    }

    this.notifyListeners('quiz')
    if (notify) {
      showToast('测验设置已保存', 'success')
    }
  }

  /***********************************************
   * API配置方法
   ***********************************************/
  /**
   * 获取当前活动的API配置
   */
  public getApiConfig(): ApiConfig {
    const activePreset = this.settings.apiPresets.find(
      (p) => p.name === this.settings.activeApiPresetName,
    )
    // 如果找不到活动预设（理论上不应发生），返回第一个预设或默认值
    if (!activePreset) {
      console.warn(`活动预设 "${this.settings.activeApiPresetName}" 未找到，返回第一个预设。`)
      return this.settings.apiPresets[0]
        ? { ...this.settings.apiPresets[0] }
        : { ...DEFAULT_API_CONFIG }
    }
    // 返回活动预设的配置部分，不包含 name
    const { name, ...config } = activePreset
    return config
  }

  /**
   * 更新当前活动的API配置
   */
  public updateApiConfig(apiConfig: Partial<ApiConfig>, notify: boolean = true): void {
    const activePresetIndex = this.settings.apiPresets.findIndex(
      (p) => p.name === this.settings.activeApiPresetName,
    )

    if (activePresetIndex === -1) {
      console.error(`无法更新：活动预设 "${this.settings.activeApiPresetName}" 未找到。`)
      showToast('更新API配置失败：未找到活动预设', 'error')
      return
    }

    // 更新活动预设的配置
    this.settings.apiPresets[activePresetIndex] = {
      ...this.settings.apiPresets[activePresetIndex], // 保留 name 和现有属性
      ...apiConfig, // 应用新的配置值
    }

    this.saveSettings()
    this.notifyListeners('api') // 通知API配置变更
    if (notify) {
      showToast(`API预设 "${this.settings.activeApiPresetName}" 已保存`, 'success')
    }
  }

  /**
   * 获取所有API预设列表
   */
  public getApiPresets(): ApiPreset[] {
    // 返回预设列表的深拷贝，防止外部修改
    return JSON.parse(JSON.stringify(this.settings.apiPresets))
  }

  /**
   * 获取当前活动预设的名称
   */
  public getActiveApiPresetName(): string {
    return this.settings.activeApiPresetName
  }

  /**
   * 添加一个新的API预设
   * @param name 新预设的名称
   * @param configToCopy 可选，要复制配置的预设名称，默认为当前活动预设
   * @returns boolean 是否成功添加
   */
  public addApiPreset(name: string, configToCopy?: string): boolean {
    if (!name || name.trim() === '') {
      showToast('预设名称不能为空', 'error')
      return false
    }
    name = name.trim() // 去除前后空格

    if (this.settings.apiPresets.some((p) => p.name === name)) {
      showToast(`预设名称 "${name}" 已存在`, 'error')
      return false
    }

    const sourcePresetName = configToCopy || this.settings.activeApiPresetName
    const sourcePreset = this.settings.apiPresets.find((p) => p.name === sourcePresetName)

    if (!sourcePreset) {
      console.error(`无法复制配置：源预设 "${sourcePresetName}" 未找到。将使用默认配置创建。`)
      const newPreset: ApiPreset = createDefaultPreset({ ...DEFAULT_API_CONFIG }, name)
      this.settings.apiPresets.push(newPreset)
    } else {
      const newPreset: ApiPreset = { ...sourcePreset, name: name } // 复制配置并设置新名称
      this.settings.apiPresets.push(newPreset)
    }

    this.saveSettings()
    this.notifyListeners('api') // 通知预设列表可能已更改
    showToast(`已添加预设 "${name}"`, 'success')
    return true
  }

  /**
   * 删除一个API预设
   * @param name 要删除的预设名称
   * @returns boolean 是否成功删除
   */
  public deleteApiPreset(name: string): boolean {
    if (this.settings.apiPresets.length <= 1) {
      showToast('无法删除最后一个预设', 'warning')
      return false
    }

    const presetIndex = this.settings.apiPresets.findIndex((p) => p.name === name)
    if (presetIndex === -1) {
      showToast(`未找到要删除的预设 "${name}"`, 'error')
      return false
    }

    this.settings.apiPresets.splice(presetIndex, 1)

    // 如果删除的是当前活动的预设，则将活动预设设置为列表中的第一个
    if (this.settings.activeApiPresetName === name) {
      this.settings.activeApiPresetName = this.settings.apiPresets[0].name
      this.notifyListeners('api') // 活动预设已更改，需要通知
    }

    this.saveSettings()
    this.notifyListeners('api') // 预设列表已更改
    showToast(`已删除预设 "${name}"`, 'success')
    return true
  }

  /**
   * 设置当前活动的API预设
   * @param name 要激活的预设名称
   * @returns boolean 是否成功设置
   */
  public setActiveApiPreset(name: string): boolean {
    const presetExists = this.settings.apiPresets.some((p) => p.name === name)
    if (!presetExists) {
      showToast(`未找到预设 "${name}"`, 'error')
      return false
    }

    if (this.settings.activeApiPresetName !== name) {
      this.settings.activeApiPresetName = name
      this.saveSettings()
      this.notifyListeners('api') // 通知活动预设已更改
    }
    return true
  }

  /**
   * 重命名一个API预设
   * @param oldName 旧名称
   * @param newName 新名称
   * @returns boolean 是否成功重命名
   */
  public renameApiPreset(oldName: string, newName: string): boolean {
    if (!newName || newName.trim() === '') {
      showToast('新预设名称不能为空', 'error')
      return false
    }
    newName = newName.trim()

    if (oldName === newName) return true // 名称相同，无需操作

    if (this.settings.apiPresets.some((p) => p.name === newName)) {
      showToast(`预设名称 "${newName}" 已存在`, 'error')
      return false
    }

    const presetIndex = this.settings.apiPresets.findIndex((p) => p.name === oldName)
    if (presetIndex === -1) {
      showToast(`未找到要重命名的预设 "${oldName}"`, 'error')
      return false
    }

    this.settings.apiPresets[presetIndex].name = newName

    // 如果重命名的是当前活动的预设，更新活动名称
    if (this.settings.activeApiPresetName === oldName) {
      this.settings.activeApiPresetName = newName
    }

    this.saveSettings()
    this.notifyListeners('api') // 通知预设列表可能已更改
    showToast(`预设 "${oldName}" 已重命名为 "${newName}"`, 'success')
    return true
  }

  /***********************************************
   * GitHub配置方法
   ***********************************************/
  /**
   * 获取GitHub配置
   */
  public getGithubConfig(): GithubConfig {
    return { ...this.settings.githubConfig }
  }

  /**
   * 更新GitHub配置
   */
  public updateGithubConfig(githubConfig: Partial<GithubConfig>, notify: boolean = true): void {
    // 确保必填字段存在
    const updatedConfig: GithubConfig = {
      owner: githubConfig.owner ?? this.settings.githubConfig.owner,
      repo: githubConfig.repo ?? this.settings.githubConfig.repo,
      branch: githubConfig.branch ?? this.settings.githubConfig.branch,
      path: githubConfig.path ?? this.settings.githubConfig.path,
      token: githubConfig.token ?? this.settings.githubConfig.token,
      forceSync: githubConfig.forceSync ?? this.settings.githubConfig.forceSync,
      syncQuizName: githubConfig.syncQuizName ?? this.settings.githubConfig.syncQuizName,
      createRemoteRepo:
        githubConfig.createRemoteRepo ?? this.settings.githubConfig.createRemoteRepo,
    }

    this.settings.githubConfig = updatedConfig
    this.saveSettings()
    this.settings.lastSyncTimestamp = Date.now()
    this.notifyListeners('github')
    if (notify) {
      showToast('GitHub设置已保存', 'success')
    }
  }

  /**
   * 获取上次同步时间
   */
  public getLastSyncTimestamp(): number {
    return this.settings.lastSyncTimestamp || 0
  }

  /**
   * 更新同步时间戳
   */
  public updateSyncTimestamp(): void {
    this.settings.lastSyncTimestamp = Date.now()
    this.saveSettings()
  }

  /***********************************************
   * 调试设置方法
   ***********************************************/
  /**
   * 获取调试模式状态
   */
  public isDebugEnabled(): boolean {
    return !!this.settings.debugEnabled
  }

  /**
   * 更新调试模式
   */
  public setDebugEnabled(enabled: boolean, notify: boolean = true): void {
    this.settings.debugEnabled = enabled
    this.saveSettings()
    if (notify) {
      showToast(enabled ? '调试模式已启用' : '调试模式已禁用', 'info')
    }
  }

  /***********************************************
   * 导入导出方法
   ***********************************************/
  /**
   * 导出配置
   */
  public exportConfig(): string {
    try {
      const configToExport: ConfigExportData = {
        timestamp: new Date().toISOString(),
        version: this.version,
        exportDate: new Date().toISOString(),
        generalSettings: {
          uiSettings: this.settings.uiSettings,
          debugEnabled: this.settings.debugEnabled,
        } as Record<string, unknown>,
        quizSettings: this.settings.quizSettings as unknown as Record<string, unknown>,
        apiPresets: this.settings.apiPresets,
        activeApiPresetName: this.settings.activeApiPresetName,
        repoSettings: this.settings.githubConfig as unknown as Record<string, unknown>,
        stats: {},
      }

      // 获取统计数据
      const userStats = localStorage.getItem('userStats')
      if (userStats) {
        configToExport.stats = JSON.parse(userStats)
        configToExport.statisticsData = JSON.parse(userStats)
      }

      const dataStr = JSON.stringify(configToExport, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
      const exportFileDefaultName = `elyxira-config-${new Date().toISOString().split('T')[0]}.json`

      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()

      showToast('配置已导出', 'success')
      return exportFileDefaultName
    } catch (error) {
      console.error('导出配置失败:', error)
      showToast(`导出配置失败: ${(error as Error).message}`, 'error')
      throw error
    }
  }

  /**
   * 导入配置
   */
  public importConfig(configData: unknown): boolean {
    try {
      if (!this.validateConfigData(configData)) {
        showToast('无效的配置文件格式或版本不兼容', 'error')
        return false
      }

      const typedConfig = configData as ConfigExportData

      // 构建新的设置对象
      const newSettings: Partial<AppSettings> = { ...this.settings }

      // --- 导入 General Settings ---
      if (typedConfig.generalSettings) {
        if (typedConfig.generalSettings.uiSettings) {
          newSettings.uiSettings = {
            ...this.settings.uiSettings,
            ...(typedConfig.generalSettings.uiSettings as UiSettings),
          }
        }
        newSettings.debugEnabled =
          'debugEnabled' in typedConfig.generalSettings
            ? !!typedConfig.generalSettings.debugEnabled
            : this.settings.debugEnabled
      }

      // --- 导入 Quiz Settings ---
      if (typedConfig.quizSettings) {
        newSettings.quizSettings = {
          ...this.settings.quizSettings,
          ...(typedConfig.quizSettings as unknown as QuizSettings),
        }
      }

      // --- 导入 API Presets ---
      if (
        typedConfig.apiPresets &&
        Array.isArray(typedConfig.apiPresets) &&
        typedConfig.apiPresets.length > 0
      ) {
        // 验证并合并每个导入的预设
        newSettings.apiPresets = typedConfig.apiPresets.map((p) => {
          // 先确定预设名称
          const presetName =
            typeof p.name === 'string' && p.name.trim() ? p.name.trim() : `Imported-${Date.now()}`
          // 构建预设对象，确保 name 只设置一次
          const preset = {
            ...DEFAULT_API_CONFIG, // 从默认配置开始
            ...p, // 应用导入的配置 (会覆盖默认值，可能包含 name)
            name: presetName, // 强制使用我们验证/生成的名称
          }
          return preset
        })

        // 验证并设置活动预设名称
        if (
          typedConfig.activeApiPresetName &&
          newSettings.apiPresets.some((p) => p.name === typedConfig.activeApiPresetName)
        ) {
          newSettings.activeApiPresetName = typedConfig.activeApiPresetName
        } else {
          // 如果导入的活动名称无效，则使用第一个导入的预设名称
          newSettings.activeApiPresetName = newSettings.apiPresets[0].name
        }
      }

      // --- 导入 Repo Settings ---
      if (typedConfig.repoSettings) {
        newSettings.githubConfig = {
          ...this.settings.githubConfig,
          ...(typedConfig.repoSettings as unknown as GithubConfig),
        }
      }

      // --- 更新设置 ---
      // 直接赋值，因为 newSettings 是基于 this.settings 构建的完整对象
      this.settings = newSettings as AppSettings // 类型断言，因为我们已经填充了所有必需字段

      this.saveSettings()
      this.applyTheme()

      // --- 统计数据单独保存 ---
      if (typedConfig.stats || typedConfig.statisticsData) {
        localStorage.setItem(
          'userStats',
          JSON.stringify(typedConfig.stats || typedConfig.statisticsData),
        )
      }

      // --- 通知所有监听器 ---
      this.notifyListeners('settings')
      this.notifyListeners('ui')
      this.notifyListeners('quiz')
      this.notifyListeners('api') // API 配置已改变
      this.notifyListeners('github')

      showToast('配置已成功导入', 'success')
      return true
    } catch (error) {
      console.error('导入配置失败:', error)
      showToast('导入配置失败：' + (error as Error).message, 'error')
      return false
    }
  }

  /**
   * 验证配置数据格式
   */
  private validateConfigData(data: unknown): data is ConfigExportData {
    if (!data || typeof data !== 'object') return false

    const config = data as Record<string, unknown>
    // 基本验证保持不变
    const basicValid =
      'timestamp' in config &&
      'version' in config &&
      typeof config.timestamp === 'string' &&
      typeof config.version === 'string'
    if (!basicValid) return false

    // 可选：更严格的验证，检查是否存在 apiPresets 或旧的 apiSettings
    // const hasApiSettings = 'apiPresets' in config || 'apiSettings' in config;
    // return hasApiSettings; // 如果要求必须有API设置

    return true // 目前只做基本验证
  }

  /**
   * 重置所有配置
   */
  public resetAllSettings(): void {
    // 保留 GitHub 配置和其他可能不希望重置的设置（如果需要）
    // const githubConfig = this.settings.githubConfig;

    // 重置为默认值，这现在包含了默认的预设列表和活动名称
    this.settings = { ...DEFAULT_SETTINGS }
    // 如果需要保留特定配置： this.settings.githubConfig = githubConfig;

    localStorage.removeItem(SETTINGS_KEY) // 移除旧的存储
    localStorage.removeItem('userStats')
    localStorage.removeItem('quizStats') // 也清除测验统计
    localStorage.removeItem('quizData')
    localStorage.removeItem('lastLoadedQuiz')
    localStorage.removeItem('cachedQuizList') // 清除题库列表

    this.saveSettings() // 保存重置后的默认设置
    this.applyTheme()

    // 重置内存中的测验状态
    this.quizState.quizData = null
    this.quizState.config = { ...DEFAULT_QUIZ_CONFIG }
    this.quizState.lastLoaded = { name: '', source: '' }
    this.quizState.stats = {
      totalAnswered: 0,
      correctCount: 0,
      wrongCount: 0,
      dailyActivity: [0, 0, 0, 0, 0, 0, 0],
    }

    // 通知所有监听器
    this.notifyListeners('settings')
    this.notifyListeners('ui')
    this.notifyListeners('quiz')
    this.notifyListeners('api')
    this.notifyListeners('github')

    showToast('所有设置已重置为默认值', 'success')
  }

  /***********************************************
   * 缓存管理方法
   ***********************************************/
  /**
   * 清除题库缓存
   */
  public clearQuizCache(): boolean {
    try {
      let count = 0
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i)
        if (key && (key.startsWith('quizCache_') || key === 'cachedQuizList')) {
          localStorage.removeItem(key)
          count++
        }
      }

      if (count > 0) {
        showToast(`已清除 ${count} 项题库缓存`, 'success')
      } else {
        showToast('没有找到题库缓存', 'info')
      }

      return count > 0
    } catch (error) {
      console.error('清除题库缓存失败:', error)
      showToast(`清除缓存失败: ${(error as Error).message}`, 'error')
      return false
    }
  }

  /**
   * 获取缓存统计信息
   */
  public getCacheStats(): { totalSize: number; items: { key: string; size: number }[] } {
    let totalSize = 0
    const items: { key: string; size: number }[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        const value = localStorage.getItem(key) || ''
        const size = (key.length + value.length) * 2 // 估算大小（UTF-16，每个字符2字节）

        totalSize += size

        // 如果是题库相关缓存，添加到列表
        if (key.startsWith('quizCache_')) {
          items.push({
            key: key.replace('quizCache_', ''),
            size,
          })
        }
      }
    }

    return { totalSize, items }
  }

  /***********************************************
   * 题库存储方法
   ***********************************************/
  /**
   * 保存题库到本地存储
   * @param name 题库名称
   * @param data 题库数据
   */
  public saveQuizToStorage(name: string, data: QuizData): void {
    const cacheKey = `quizCache_${name}`
    localStorage.setItem(cacheKey, JSON.stringify(data))
  }

  /**
   * 从本地存储加载题库
   * @param name 题库名称
   * @returns 题库数据或null
   */
  public loadQuizFromStorage(name: string): QuizData | null {
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
  public removeQuizFromStorage(name: string): void {
    const cacheKey = `quizCache_${name}`
    localStorage.removeItem(cacheKey)
  }

  /**
   * 保存题库列表到本地存储
   * @param list 题库列表
   */
  public saveQuizList(list: LocalQuizCache[]): void {
    localStorage.setItem('cachedQuizList', JSON.stringify(list))
  }

  /**
   * 从本地存储加载题库列表
   * @returns 题库列表或空数组
   */
  public loadQuizList(): LocalQuizCache[] {
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
  public saveLastLoadedQuiz(quizName: string, source: string): void {
    this.quizState.lastLoaded.name = quizName
    this.quizState.lastLoaded.source = source

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
   */
  public getLastLoadedQuiz(): { name: string; source: string } | null {
    if (this.quizState.lastLoaded.name) {
      return { ...this.quizState.lastLoaded }
    }

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
  public clearAllQuizStorage(): void {
    // 先获取所有题库名称
    const quizList = this.loadQuizList()

    // 删除每个题库的缓存
    quizList.forEach((quiz) => {
      const cacheKey = `quizCache_${quiz.name}`
      localStorage.removeItem(cacheKey)
    })

    // 删除题库列表和最后加载的题库信息
    localStorage.removeItem('cachedQuizList')
    localStorage.removeItem('lastLoadedQuiz')
    localStorage.removeItem('quizData')

    // 清除状态
    this.quizState.quizData = null
    this.quizState.lastLoaded = { name: '', source: '' }
    this.quizState.config = { ...DEFAULT_QUIZ_CONFIG }

    showToast('已清除所有题库缓存', 'success')
  }

  /**
   * 获取题库数据
   */
  public getQuizData(): QuizData | null {
    return this.quizState.quizData
  }

  /**
   * 设置题库数据
   */
  public setQuizData(data: QuizData): void {
    this.quizState.quizData = data
  }

  /**
   * 获取刷题配置
   */
  public getQuizConfig(): QuizConfig {
    return { ...this.quizState.config }
  }

  /**
   * 设置刷题配置
   */
  public setQuizConfig(config: Partial<QuizConfig>): void {
    this.quizState.config = { ...this.quizState.config, ...config }
    this.saveQuizConfigToStorage()
  }

  /**
   * 保存测验配置到本地存储
   */
  private saveQuizConfigToStorage(): void {
    localStorage.setItem('selectedChapter', this.quizState.config.chapterIndex)
    localStorage.setItem('quizMode', this.quizState.config.mode)
    localStorage.setItem('rangeStart', this.quizState.config.rangeStart.toString())
    localStorage.setItem('rangeEnd', this.quizState.config.rangeEnd.toString())
  }

  /**
   * 初始化加载测验状态
   */
  private initQuizFromStorage(): boolean {
    try {
      // 恢复题库数据
      const savedData = localStorage.getItem('quizData')
      if (savedData) {
        this.quizState.quizData = JSON.parse(savedData)
      } else {
        return false
      }

      // 恢复最后加载的题库信息
      const lastQuiz = localStorage.getItem('lastLoadedQuiz')
      if (lastQuiz) {
        this.quizState.lastLoaded = JSON.parse(lastQuiz)
      }

      // 恢复设置
      const savedChapter = localStorage.getItem('selectedChapter')
      if (savedChapter) this.quizState.config.chapterIndex = savedChapter

      const savedMode = localStorage.getItem('quizMode')
      if (savedMode && Object.values(QuizMode).includes(savedMode as QuizMode)) {
        this.quizState.config.mode = savedMode as QuizMode
      }

      // 恢复范围值
      const rangeStart = localStorage.getItem('rangeStart')
      if (rangeStart) this.quizState.config.rangeStart = parseInt(rangeStart)

      const rangeEnd = localStorage.getItem('rangeEnd')
      if (rangeEnd) this.quizState.config.rangeEnd = parseInt(rangeEnd)

      // 恢复统计数据
      this.loadQuizStatsFromStorage()

      return true
    } catch (error) {
      console.error('从本地存储恢复状态失败:', error)
      return false
    }
  }

  /**
   * 保存测验状态到本地存储
   */
  public saveQuizState(): void {
    if (this.quizState.quizData) {
      localStorage.setItem('quizData', JSON.stringify(this.quizState.quizData))
      this.saveQuizConfigToStorage()
      localStorage.setItem('lastLoadedQuiz', JSON.stringify(this.quizState.lastLoaded))

      // 保存到独立缓存
      if (this.quizState.lastLoaded.name) {
        this.saveQuizToStorage(this.quizState.lastLoaded.name, this.quizState.quizData)
      }
    }
  }

  /**
   * 从本地存储加载统计数据
   */
  private loadQuizStatsFromStorage(): void {
    try {
      const statsData = localStorage.getItem('quizStats')
      if (statsData) {
        const stats = JSON.parse(statsData)
        this.quizState.stats = { ...this.quizState.stats, ...stats }
      }
    } catch (error) {
      console.error('加载统计数据失败:', error)
    }
  }

  /**
   * 保存统计数据到本地存储
   */
  private saveQuizStatsToStorage(): void {
    localStorage.setItem('quizStats', JSON.stringify(this.quizState.stats))
  }

  /**
   * 更新答题统计
   */
  public updateQuizStats(
    param: Partial<{
      totalAnswered: number
      correctCount: number
      wrongCount: number
    }>,
  ): void {
    if (param.totalAnswered !== undefined) {
      this.quizState.stats.totalAnswered = param.totalAnswered
    }
    if (param.correctCount !== undefined) {
      this.quizState.stats.correctCount = param.correctCount
    }
    if (param.wrongCount !== undefined) {
      this.quizState.stats.wrongCount = param.wrongCount
    }

    // 更新今日活动
    const today = new Date().getDay() // 0-6，表示周日到周六
    this.quizState.stats.dailyActivity[today]++

    // 保存统计数据
    this.saveQuizStatsToStorage()
  }

  /**
   * 获取题库章节数组
   */
  public getQuizChapters(): string[] {
    if (!this.quizState.quizData || !this.quizState.quizData.chapters) return []
    return this.quizState.quizData.chapters.map((c) => c.title)
  }

  /**
   * 获取题库总题目数
   */
  public getQuizTotalQuestions(): number {
    if (!this.quizState.quizData || !this.quizState.quizData.chapters) return 0

    return this.quizState.quizData.chapters.reduce((total, chapter) => {
      return total + (chapter.questions?.length || 0)
    }, 0)
  }

  /**
   * 获取已答题数量
   */
  public getQuizAnsweredCount(): number {
    return this.quizState.stats.totalAnswered
  }

  /**
   * 获取正确题数
   */
  public getQuizCorrectCount(): number {
    return this.quizState.stats.correctCount
  }

  /**
   * 获取正确率
   */
  public getQuizAccuracyRate(): string {
    const total = this.quizState.stats.totalAnswered
    if (total === 0) return '0%'
    return Math.round((this.quizState.stats.correctCount / total) * 100) + '%'
  }

  /**
   * 清除当前题库
   */
  public clearCurrentQuiz(): void {
    this.quizState.quizData = null
    this.quizState.lastLoaded = { name: '', source: '' }
    localStorage.removeItem('quizData')
    localStorage.removeItem('lastLoadedQuiz')
  }

  /***********************************************
   * GitHub同步方法
   ***********************************************/
  /**
   * 从GitHub同步题库到本地
   * @param quizName 题库名称
   * @returns 同步后的题库数据
   */
  public async syncQuizFromGithub(quizName: string): Promise<QuizData | null> {
    try {
      const githubConfig = this.getGithubConfig()
      if (!this.validateGithubConfig(githubConfig)) {
        showToast('GitHub配置不完整', 'error')
        return null
      }

      // 首先获取仓库中所有的题库列表
      const path = githubConfig.path || 'quizzes'
      const repoContentsUrl = `https://api.github.com/repos/${githubConfig.owner}/${githubConfig.repo}/contents/${path}?ref=${githubConfig.branch}`

      const listResponse = await fetch(repoContentsUrl, {
        headers: {
          Authorization: `token ${githubConfig.token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      })

      if (!listResponse.ok) {
        showToast(`获取远程题库列表失败 (${listResponse.status})`, 'error')
        return null
      }

      // 解析仓库内容
      const contents = await listResponse.json()

      // 过滤出所有JSON文件
      const quizFiles = Array.isArray(contents)
        ? contents.filter(
            (file) =>
              file.type === 'file' && (file.name.endsWith('.json') || file.name.endsWith('.txt')),
          )
        : []

      // 没有找到任何题库文件
      if (quizFiles.length === 0) {
        showToast(`远程仓库中未找到任何题库文件`, 'error')
        return null
      }

      // 查找匹配的题库文件
      // 首先尝试精确匹配: quizName.json
      let targetFile = quizFiles.find(
        (file) => file.name === `${quizName}.json` || file.name === `${quizName}.txt`,
      )

      // 如果没有精确匹配，尝试部分匹配
      if (!targetFile) {
        targetFile = quizFiles.find((file) =>
          file.name.toLowerCase().includes(quizName.toLowerCase()),
        )
      }

      // 如果还是没有匹配，提示错误
      if (!targetFile) {
        showToast(`远程仓库中未找到匹配的题库：${quizName}`, 'error')
        // 提示可用的题库列表
        if (quizFiles.length > 0) {
          const availableQuizzes = quizFiles
            .map((f) => f.name.replace(/\.(json|txt)$/, ''))
            .join(', ')
          console.info(`远程仓库中可用的题库: ${availableQuizzes}`)
        }
        return null
      }

      // 获取文件内容
      const contentResponse = await fetch(targetFile.download_url)
      if (!contentResponse.ok) {
        showToast('下载题库内容失败', 'error')
        return null
      }

      // 提取不带扩展名的文件名作为题库名称
      const actualQuizName = targetFile.name.replace(/\.(json|txt)$/, '')

      const contentText = await contentResponse.text()
      let quizData: QuizData

      try {
        // 从JSON字符串解析数据
        const parsedJson = JSON.parse(contentText)
        // 使用quizParserService处理数据，确保格式正确，传入实际文件名作为source
        quizData = quizParserService.parse(parsedJson, actualQuizName)
      } catch (error) {
        showToast('解析题库数据失败：无效的JSON格式', 'error')
        return null
      }

      // 使用增强的验证方法
      if (!this.enhancedValidQuizData(quizData)) {
        showToast('无效的题库数据格式', 'error')
        return null
      }

      // 检查是否已有本地题库，如果有则合并笔记和用户答案
      const existingQuizData = this.loadQuizFromStorage(actualQuizName)
      if (existingQuizData) {
        console.log(`合并本地题库笔记: ${actualQuizName}`)

        // 遍历本地题库中的所有问题
        existingQuizData.chapters.forEach((chapter) => {
          chapter.questions.forEach((question) => {
            if (question.id && (question.notes || question.userAnswer !== undefined)) {
              // 在新拉取的题库中查找相同ID的问题，并保留笔记和用户答案
              quizData.chapters.forEach((targetChapter) => {
                const targetQuestion = targetChapter.questions.find((q) => q.id === question.id)
                if (targetQuestion) {
                  // 只在远程题库没有笔记或本地有笔记的情况下保留本地笔记
                  if (
                    question.notes &&
                    (!targetQuestion.notes || targetQuestion.notes.trim() === '')
                  ) {
                    console.log(
                      `保留本地笔记: 题目ID=${question.id}, 笔记长度=${question.notes.length}`,
                    )
                    targetQuestion.notes = question.notes
                  }
                  // 保留用户答案
                  if (question.userAnswer !== undefined) {
                    targetQuestion.userAnswer = question.userAnswer
                  }
                }
              })
            }
          })
        })
      }

      // 保存到本地缓存
      this.saveQuizToStorage(actualQuizName, quizData)

      // 更新本地题库列表
      const cachedList = this.loadQuizList()
      const existingIndex = cachedList.findIndex(
        (q) => q.name === actualQuizName && q.source === QuizSourceType.REMOTE_IMPORT,
      )

      const localEntry: LocalQuizCache = {
        id: `remote-import-${Date.now()}`,
        name: actualQuizName,
        path: 'localStorage',
        source: QuizSourceType.REMOTE_IMPORT,
        info: `从GitHub同步：${githubConfig.owner}/${githubConfig.repo}`,
        title: quizData.title || actualQuizName,
        lastModified: Date.now(),
        data: quizData,
      }

      if (existingIndex >= 0) {
        cachedList[existingIndex] = localEntry
      } else {
        cachedList.push(localEntry)
      }

      this.saveQuizList(cachedList)

      // 更新同步时间
      this.updateSyncTimestamp()

      showToast(`成功从GitHub同步题库：${actualQuizName}`, 'success')
      return quizData
    } catch (error) {
      showToast(`同步题库失败：${(error as Error).message}`, 'error')
      return null
    }
  }

  /**
   * 将题库推送到GitHub
   * @param quizName 题库名称
   * @param forceSync 是否强制同步（覆盖远程）
   * @returns 是否成功
   */
  public async pushQuizToGithub(quizName: string, forceSync?: boolean): Promise<boolean> {
    try {
      const githubConfig = this.getGithubConfig()
      if (!this.validateGithubConfig(githubConfig)) {
        showToast('GitHub配置不完整', 'error')
        return false
      }

      // 从本地获取题库数据
      const quizData = this.loadQuizFromStorage(quizName)
      if (!quizData) {
        showToast(`本地未找到题库：${quizName}`, 'error')
        return false
      }

      // 确保推送前保留用户所有的笔记和用户答案
      if (this.quizState.quizData && this.quizState.quizData.title === quizData.title) {
        // 如果当前加载的就是要推送的题库，需要确保所有最新的用户笔记都被保存
        const currentQuizData = this.quizState.quizData

        // 遍历当前数据中的所有问题，更新笔记和用户答案
        currentQuizData.chapters.forEach((chapter) => {
          chapter.questions.forEach((question) => {
            if (question.id && (question.notes || question.userAnswer !== undefined)) {
              // 在quizData中查找相同ID的问题并更新笔记
              quizData.chapters.forEach((targetChapter) => {
                const targetQuestion = targetChapter.questions.find((q) => q.id === question.id)
                if (targetQuestion) {
                  if (question.notes) {
                    console.log(
                      `更新推送题库笔记: 题目ID=${question.id}, 笔记长度=${question.notes.length}`,
                    )
                    targetQuestion.notes = question.notes
                  }
                  if (question.userAnswer !== undefined)
                    targetQuestion.userAnswer = question.userAnswer
                }
              })
            }
          })
        })

        // 保存更新后的数据到本地存储
        this.saveQuizToStorage(quizName, quizData)
      }

      // 确保题库数据格式正确
      if (!this.enhancedValidQuizData(quizData)) {
        console.warn('题库数据格式可能有问题，尝试标准化...')
        // 尝试通过解析器标准化格式
        try {
          const standardizedData = quizParserService.parse(quizData, quizName)
          // 重新保存标准化后的数据
          this.saveQuizToStorage(quizName, standardizedData)
        } catch (error) {
          showToast(`题库数据格式错误: ${(error as Error).message}`, 'error')
          return false
        }
      }

      // 构建文件路径
      const filePath = `${githubConfig.path || 'quizzes'}/${quizName}.json`
      const fileUrl = `https://api.github.com/repos/${githubConfig.owner}/${githubConfig.repo}/contents/${filePath}`

      // 检查文件是否已存在，决定是创建还是更新
      let existingSha: string | null = null

      // 即使在强制同步模式下，也需要获取SHA以便更新
      try {
        const checkResponse = await fetch(`${fileUrl}?ref=${githubConfig.branch}`, {
          headers: {
            Authorization: `token ${githubConfig.token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        })

        if (checkResponse.ok) {
          const fileInfo = await checkResponse.json()
          existingSha = fileInfo.sha as string
        }
      } catch (error) {
        // 忽略检查错误，假设文件不存在
      }

      // 准备请求体
      const content = JSON.stringify(quizData, null, 2)
      const contentBase64 = btoa(unescape(encodeURIComponent(content)))

      const requestBody: Record<string, unknown> = {
        message: existingSha ? `更新题库：${quizName}` : `添加题库：${quizName}`,
        content: contentBase64,
        branch: githubConfig.branch,
      }

      // 如果是更新现有文件，需要提供sha
      if (existingSha) {
        requestBody.sha = existingSha
      }

      // 发送请求
      const response = await fetch(fileUrl, {
        method: 'PUT',
        headers: {
          Authorization: `token ${githubConfig.token}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github.v3+json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`GitHub API错误 (${response.status}): ${errorData.message || '未知错误'}`)
      }

      // 更新同步时间
      this.updateSyncTimestamp()

      showToast(`成功推送题库到GitHub：${quizName}`, 'success')
      return true
    } catch (error) {
      showToast(`推送题库失败：${(error as Error).message}`, 'error')
      return false
    }
  }

  /**
   * 验证GitHub配置是否完整
   */
  private validateGithubConfig(config: GithubConfig): boolean {
    return !!(config.owner && config.repo && config.token && config.branch)
  }

  /**
   * 验证题库数据格式
   */
  private validateQuizData(data: unknown): boolean {
    if (!data || typeof data !== 'object') return false

    // 进行类型转换
    const quizData = data as Partial<QuizData>

    // 基本结构检查
    if (!Array.isArray(quizData.chapters)) return false

    // 检查每个章节
    for (const chapter of quizData.chapters) {
      if (typeof chapter !== 'object') return false
      if (typeof chapter.title !== 'string') return false
      if (!Array.isArray(chapter.questions)) return false

      // 检查每个问题
      for (const question of chapter.questions) {
        if (typeof question !== 'object') return false
        if (typeof question.title !== 'string') return false
        if (!Array.isArray(question.options)) return false
        if (question.answer === undefined) return false
      }
    }

    return true
  }

  /**
   * 处理题库同步完成后的操作
   * @param result 同步结果对象
   * @returns 包含更新后题库信息的对象或null
   */
  public async handleQuizSyncComplete(result: {
    action: string
    quiz: string
    overrideLocal?: boolean
    success: boolean
    retainedNotes?: boolean // 新增：标记是否保留了本地笔记
  }): Promise<{
    quizName: string
    source: string
    wasOverridden: boolean
    data?: QuizData
    isNewQuiz?: boolean // 新增：标记是否是新创建的题库
  } | null> {
    if (!result.success) return null

    // 如果不是拉取操作，仅刷新数据无需特殊处理
    if (result.action !== 'pull') return null

    const quizName = result.quiz
    const data = this.loadQuizFromStorage(quizName)
    if (!data) {
      showToast(`找不到拉取的题库数据: ${quizName}`, 'error')
      return null
    }

    // 更新本地题库列表，确保分类为"从远程导入"
    const cachedList = this.loadQuizList()

    // 创建新的本地条目
    const localEntry: LocalQuizCache = {
      id: `remote-import-${Date.now()}`,
      name: quizName,
      path: 'localStorage',
      source: QuizSourceType.REMOTE_IMPORT,
      info: `从远程导入: ${quizName}`,
      title: data.title || quizName,
      lastModified: Date.now(),
      data: data,
    }

    // 查找是否存在同名题库
    const existingIndex = cachedList.findIndex(
      (q) =>
        q.name === quizName &&
        (q.source === QuizSourceType.LOCAL ||
          q.source === QuizSourceType.REMOTE_IMPORT ||
          q.source === QuizSourceType.ONLINE_IMPORT),
    )

    // 标记是否是全新创建的题库
    const isNewQuiz = existingIndex < 0

    // 根据覆盖选项决定是否替换已存在的题库
    let wasOverridden = false
    if (existingIndex >= 0 && result.overrideLocal) {
      cachedList[existingIndex] = localEntry
      wasOverridden = true
    } else if (existingIndex < 0) {
      cachedList.push(localEntry)
      wasOverridden = true // 对于全新题库也标记为覆盖，这样可以自动加载
    }

    // 保存更新后的题库列表
    this.saveQuizList(cachedList)

    // 如果是新题库或需要覆盖，则设置为当前题库
    if ((isNewQuiz || wasOverridden) && result.overrideLocal) {
      // 设置为当前数据
      this.setQuizData(data)

      // 更新最近加载记录
      this.saveLastLoadedQuiz(quizName, QuizSourceType.REMOTE_IMPORT)

      // 设置默认的测验配置
      this.setQuizConfig({
        chapterIndex: 'all',
        mode: QuizMode.NORMAL,
        rangeStart: 1,
        rangeEnd: this.calculateTotalQuestions(data),
        randomize: false,
        wrongOnly: false,
      })

      // 保存状态
      this.saveQuizState()
    }

    return {
      quizName,
      source: QuizSourceType.REMOTE_IMPORT,
      wasOverridden,
      isNewQuiz,
      data,
    }
  }

  /**
   * 计算题库总题数
   */
  private calculateTotalQuestions(data: QuizData): number {
    let total = 0
    if (data && data.chapters) {
      data.chapters.forEach((chapter) => {
        if (chapter.questions && Array.isArray(chapter.questions)) {
          total += chapter.questions.length
        }
      })
    }
    return total > 0 ? total : 100 // 默认100题
  }

  /***********************************************
   * 通用设置方法
   ***********************************************/
  /**
   * 保存通用设置
   */
  public saveGeneralSettings(settings: {
    uiSettings: UiSettings
    quizSettings: QuizSettings
    debugEnabled: boolean
  }): void {
    // 更新UI设置
    this.updateUiSettings(settings.uiSettings, false)

    // 更新测验设置
    this.updateQuizSettings(settings.quizSettings, false)

    // 更新调试模式
    this.setDebugEnabled(settings.debugEnabled, false)

    // 更新当前活动的 quiz 配置模式
    const { randomMode, reviewMode } = settings.quizSettings
    if (reviewMode) {
      this.quizState.config.mode = QuizMode.REVIEW
    } else if (randomMode) {
      this.quizState.config.mode = QuizMode.RANDOM
    } else {
      this.quizState.config.mode = QuizMode.NORMAL
    }
    this.quizState.config.randomize = randomMode

    // 保存测验配置到本地存储
    this.saveQuizConfigToStorage()
    this.saveQuizState()

    // 通知 'settings' 监听器，因为通用设置已更改
    this.notifyListeners('settings')

    showToast('通用设置已保存', 'success')
  }

  /**
   * 保存题目笔记到当前测验数据
   * @param questionId 问题ID
   * @param noteContent 笔记内容
   * @returns 是否保存成功
   */
  public saveNoteToQuestion(
    questionId: string | number | undefined,
    noteContent: string | undefined,
  ): boolean {
    if (!this.quizState.quizData || !questionId) return false

    const foundQuestion = this.findQuestionById(questionId)
    if (foundQuestion) {
      foundQuestion.notes = noteContent
      this.saveQuizToStorage(this.quizState.quizData.title, this.quizState.quizData)
      return true
    }
    return false
  }

  /**
   * 获取题目笔记
   * @param questionId 问题ID
   * @returns 笔记内容，如果未找到问题或笔记不存在则返回空字符串
   */
  public getNoteByQuestionId(questionId: string | number | undefined): string {
    if (!questionId) return ''

    const question = this.findQuestionById(questionId)
    return question?.notes || ''
  }

  /**
   * 渲染笔记内容为HTML
   */
  public async renderNote(
    noteContent: string,
    isGenerating: boolean,
    marked: Marked,
  ): Promise<NotesRenderResult> {
    const mainContent = noteContent || ''

    if (!mainContent && !isGenerating) {
      return {
        contentHtml: '<p class="page-quiz__notes-placeholder">这道题目还没有笔记...</p>',
      }
    }

    let mainHtmlContent = mainContent ? await marked.parse(mainContent) : ''

    if (!mainHtmlContent) {
      mainHtmlContent = isGenerating
        ? '<p class="page-quiz__notes-placeholder">思考中...</p>'
        : '<p class="page-quiz__notes-placeholder">这道题目还没有笔记...</p>'
    }

    return {
      contentHtml: mainHtmlContent,
    }
  }

  /**
   * 通过ID查找问题
   */
  private findQuestionById(questionId: string | number | undefined): Question | undefined {
    if (!this.quizState.quizData || !questionId) return undefined

    for (const chapter of this.quizState.quizData.chapters) {
      const question = chapter.questions.find((q) => q.id === questionId)
      if (question) return question
    }
    return undefined
  }

  /**
   * 格式化生成的笔记内容
   */
  public formatNote(content: string): string {
    return content.trim()
  }

  /**
   * 获取生成笔记的API请求参数
   */
  public getNotesGenerationRequestParams(question: Question): ApiRequestParams {
    const apiConfig = this.getApiConfig()
    const model = apiConfig.model || ''
    const temperature = apiConfig.temperature || 0.7
    const maxTokens = apiConfig.maxTokens || 2000
    const topP = apiConfig.topP || 1
    const systemPrompt = apiConfig.systemPrompt || ''

    // 生成提示词
    let prompt = `<question>\n${question.title}\n\n`

    if (question.options && question.options.length > 0) {
      question.options.forEach((option, index) => {
        const label = String.fromCharCode(65 + index) // A, B, C, D...
        prompt += `${label}. ${option}\n`
      })
    }

    if (question.answer !== undefined) {
      let answerText = ''
      if (Array.isArray(question.answer)) {
        answerText = question.answer
          .map((ans) => {
            if (typeof ans === 'number') {
              return String.fromCharCode(65 + ans)
            }
            return ans
          })
          .join(', ')
      } else if (typeof question.answer === 'number') {
        answerText = String.fromCharCode(65 + question.answer)
      } else {
        answerText = question.answer
      }
      prompt += `\n正确答案: ${answerText}`
    }

    if (question.explanation) {
      prompt += `\n解析: ${question.explanation}`
    }

    prompt += '\n</question>\n请严格根据提示词生成本题的笔记内容。'

    // 构建消息数组
    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: prompt,
      },
    ]

    // 返回符合OpenRouter格式的请求参数
    const requestParams: ApiRequestParams = {
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
      top_p: topP,
      stream: apiConfig.streamOutput ?? false,
      user: 'elyxira-quiz-user',
    }

    return requestParams
  }

  /***********************************************
   * 题库处理工具方法
   ***********************************************/
  /**
   * 从文本解析题库数据
   * @param text 文本内容
   * @returns 解析后的题库数据
   */
  public parseTextQuiz(text: string): QuizData {
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

  /**
   * 验证题库数据结构
   */
  public enhancedValidQuizData(data: Record<string, unknown> | QuizData): boolean {
    try {
      const parsedData = quizParserService.parse(data)

      if (!parsedData || !Array.isArray(parsedData.chapters) || parsedData.chapters.length === 0) {
        console.error('验证失败: 解析后数据缺少有效章节')
        return false
      }

      const hasQuestions = parsedData.chapters.some(
        (chapter) => Array.isArray(chapter.questions) && chapter.questions.length > 0,
      )

      if (!hasQuestions) {
        console.warn('解析后数据中没有题目')
      }

      return true
    } catch (error) {
      console.error('题库数据验证失败:', error)
      return false
    }
  }

  /**
   * 从文件导入配置
   * @param file 文件对象
   * @returns 是否导入成功
   */
  public async importConfigFromFile(file: File): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          if (event.target && typeof event.target.result === 'string') {
            const configData = JSON.parse(event.target.result)
            const success = this.importConfig(configData)
            if (success) {
              resolve(true)
            } else {
              reject(new Error('Invalid config file format or content.'))
            }
          } else {
            reject(new Error('Failed to read file content.'))
          }
        } catch (e) {
          console.error('Error parsing config file:', e)
          reject(new Error('Failed to parse config file. Ensure it is valid JSON.'))
        }
      }
      reader.onerror = (error) => {
        console.error('Error reading file:', error)
        reject(new Error('Failed to read the selected file.'))
      }
      reader.readAsText(file)
    })
  }

  /**
   * 更新问题数据
   */
  public updateQuestion(
    questionId: string | number | undefined,
    updatedData: Partial<Question>,
  ): boolean {
    if (!this.quizState.quizData || !questionId) return false

    for (const chapter of this.quizState.quizData.chapters) {
      const questionIndex = chapter.questions.findIndex((q) => q.id === questionId)
      if (questionIndex !== -1) {
        chapter.questions[questionIndex] = {
          ...chapter.questions[questionIndex],
          ...updatedData,
          id: chapter.questions[questionIndex].id || questionId.toString(),
        }
        this.saveQuizState()
        return true
      }
    }

    console.warn(`未找到要更新的问题，ID: ${questionId}`)
    return false
  }
}

// 创建单例实例
const configService = new ConfigService()

export default configService
