export interface QuizItem {
  name: string
  source: QuizSourceType
  path?: string
  info?: string
  download_url?: string
  lastModified?: number
  id?: string
}

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

export interface Chapter {
  title: string
  questions: Question[]
}

export interface Question {
  id?: string
  title: string
  options: string[]
  answer: number | number[]
  explanation?: string
}

export interface QuizData {
  title: string
  description?: string
  author?: string
  version?: string
  questionCount?: number
  lastModified?: number
  chapters: Chapter[]
}

export enum QuizMode {
  NORMAL = 'normal',
  RANDOM = 'random',
  EXAM = 'exam',
  WRONG = 'wrong',
  REVIEW = 'review',
  RANGE = 'range',
}

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
