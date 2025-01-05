import { saveAs } from 'file-saver'

/**
 * 格式化文件大小
 * @param size
 */
export function formatSize(size?: number): string {
  if (size === undefined || size === null) return '0B';
  if (size < 1024) return `${size}B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)}KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(2)}MB`;
  return `${(size / 1024 / 1024 / 1024).toFixed(2)}GB`;
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
