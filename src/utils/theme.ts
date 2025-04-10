/**
 * 切换暗/亮模式主题
 * @returns 返回新的主题名称
 */
export function toggleTheme(): string {
  const html = document.documentElement
  const currentTheme = html.getAttribute('theme') || 'light'
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark'

  html.setAttribute('theme', newTheme)
  localStorage.setItem('theme', newTheme)

  return newTheme
}

/**
 * 设置特定主题
 * @param theme 主题名称 'dark' | 'light'
 */
export function setTheme(theme: 'dark' | 'light'): void {
  const html = document.documentElement
  html.setAttribute('theme', theme)
  localStorage.setItem('theme', theme)
}

/**
 * 初始化主题
 * 根据本地存储或系统偏好设置主题
 */
export function initTheme(): void {
  const savedTheme = localStorage.getItem('theme')

  if (savedTheme) {
    // 使用保存的主题设置
    setTheme(savedTheme as 'dark' | 'light')
  } else {
    // 根据系统偏好设置主题
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(prefersDarkMode ? 'dark' : 'light')
  }
}

/**
 * 设置主题颜色
 * @param color 主色调（CSS变量值）
 */
export function setThemeColor(color: string): void {
  const root = document.documentElement
  root.style.setProperty('--primary-color', color)

  // 生成衍生颜色
  const rgbMatch = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)

  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 16)
    const g = parseInt(rgbMatch[2], 16)
    const b = parseInt(rgbMatch[3], 16)

    // 使颜色变暗（用于悬停状态）
    const darkenFactor = 0.85 // 减少15%亮度
    const darkerColor = `rgb(${Math.floor(r * darkenFactor)}, ${Math.floor(g * darkenFactor)}, ${Math.floor(b * darkenFactor)})`
    root.style.setProperty('--primary-color-dark', darkerColor)

    // 使颜色透明（用于背景、选中状态等）
    root.style.setProperty('--primary-color-light', `rgba(${r}, ${g}, ${b}, 0.1)`)
  }

  localStorage.setItem('theme-color', color)
}
