import { saveAs } from 'file-saver'

/**
 * 格式化文件大小
 * @param size
 */
export function formatSize(size?: number): string {
  if (size === undefined || size === null) return '0B'
  if (size < 1024) return `${size}B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)}KB`
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(2)}MB`
  return `${(size / 1024 / 1024 / 1024).toFixed(2)}GB`
}

/**
 * 下载图片
 * @param url 图片下载地址
 * @param fileName 要保存为的文件名
 */
export function downloadImage(url?: string, fileName?: string) {
  if (!url) {
    return
  }
  saveAs(url, fileName)
}

/**
 * 将输入的颜色值转换为标准的 #RRGGBB 格式的十六进制颜色字符串
 * @param input - 要转换的颜色值，可以是带有或不带有 0x 前缀的十六进制字符串
 * @returns 转换后的标准十六进制颜色字符串
 */
export function toHexColor(input: string) {
  // 去掉 0x 前缀
  const colorValue = input.startsWith('0x') ? input.slice(2) : input

  // 将剩余部分解析为十六进制数，再转成 6 位十六进制字符串
  const hexColor = parseInt(colorValue, 16).toString(16).padStart(6, '0')

  // 返回标准 #RRGGBB 格式
  return `#${hexColor}`
}
