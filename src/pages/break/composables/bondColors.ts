/**
 * 羁绊组颜色常量（三个文件共用，避免重复）
 * 仙舟同盟 / 幻想乡 / 天才俱乐部
 */
export const BOND_COLORS: Record<string, string> = {
  xianzhou: '#5c6bc0',
  touhou: '#ef5350',
  genius: '#26a69a',
}

export const BOND_COLOR_DEFAULT = '#7a7a9a'

export function bondColor(target: string | { bondGroup: string }): string {
  const group = typeof target === 'string' ? target : target.bondGroup
  return BOND_COLORS[group] ?? BOND_COLOR_DEFAULT
}
