/**
 * 全局类型定义
 */

// 通用响应类型
export interface BaseResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// API请求状态
export enum RequestStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

// 通用分页数据结构
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 通用ID类型
export type ID = string | number

// 主题类型
export type ThemeType = 'light' | 'dark'

// 通用排序方向
export type SortDirection = 'asc' | 'desc'

// 通用排序选项
export interface SortOption {
  field: string
  direction: SortDirection
}

// 通用过滤选项
export interface FilterOption {
  field: string
  value: string | number | boolean | null
  operator?: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith'
}

// 通用分页参数
export interface PaginationParams {
  page: number
  pageSize: number
  sort?: SortOption[]
  filter?: FilterOption[]
  search?: string
}

// 通用表格列定义
export interface TableColumn<T = unknown> {
  key: string
  title: string
  dataIndex?: string
  width?: number | string
  fixed?: 'left' | 'right'
  sortable?: boolean
  filterable?: boolean
  render?: (value: unknown, record: T, index: number) => unknown
}

// 尺寸类型
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// 方向类型
export type Direction = 'horizontal' | 'vertical'

// 按钮类型
export type ButtonType =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'text'

// 状态类型
export type StatusType = 'success' | 'error' | 'warning' | 'info' | 'default'

// 通用结果类型
export type Result<T, E = Error> =
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: E }

// 通用事件处理器类型
export type EventHandler<E extends Event = Event> = (event: E) => void

// 可为空类型
export type Nullable<T> = T | null | undefined

// 可选记录类型
export type OptionalRecord<K extends string | number | symbol, T> = Partial<Record<K, T>>

// 深度部分类型
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T
