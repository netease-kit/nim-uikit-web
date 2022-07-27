export { default as EventTracking } from './eventTracking'
export { default as request } from './request'
export * from './request/types'
export { default as Storage } from './storage'
export * from './storage/types'

/**
 * 异步频率控制
 * 一段时间内只请求一次，多余的用这一次执行的结果做为结果
 * @param fn
 * @param delay
 */
export const frequencyControl = <R = any>(
  fn: (...args: any) => Promise<R>,
  delay: number
): ((...args: any) => Promise<R>) => {
  const queue: any[] = []
  let last = 0
  let timer: any

  return function (...args: any): Promise<R> {
    return new Promise((resolve, reject) => {
      queue.push({ resolve, reject })

      const cur = Date.now()

      const consumer = (success: boolean, res: any) => {
        while (queue.length) {
          const { resolve, reject } = queue.shift()
          success ? resolve(res) : reject(res)
        }
      }

      const excute = () => {
        last = cur
        if (!queue.length) return
        // @ts-ignore
        fn.apply(this, args).then(
          (res) => {
            consumer(true, res)
          },
          (err) => {
            consumer(false, err)
          }
        )
      }

      if (cur - last > delay) {
        excute()
      } else {
        clearTimeout(timer)
        timer = setTimeout(() => {
          excute()
        }, delay)
      }
    })
  }
}

interface IFileType {
  [key: string]: RegExp
}
export function getFileType(filename: string): string {
  const fileMap: IFileType = {
    img: /(png|gif|jpg)/,
    pdf: /pdf$/,
    word: /(doc|docx)$/,
    excel: /(xls|xlsx)$/,
    ppt: /(ppt|pptx)$/,
    zip: /(zip|rar|7z)$/,
    audio: /(mp3|wav|wmv)$/,
    video: /(mp4|mkv|rmvb|wmv|avi|flv|mov)$/,
  }
  return Object.keys(fileMap).find((type) => fileMap[type].test(filename)) || ''
}

/**
 * 解析输入的文件大小
 * @param size 文件大小，单位b
 * @param level 递归等级，对应fileSizeMap
 */
export const parseFileSize = (size: number, level = 0): string => {
  const fileSizeMap: { [key: number]: string } = {
    0: 'B',
    1: 'KB',
    2: 'MB',
    3: 'GB',
    4: 'TB',
  }

  const handler = (size: number, level: number): string => {
    if (level >= Object.keys(fileSizeMap).length) {
      return 'the file is too big'
    }
    if (size < 1024) {
      return `${size}${fileSizeMap[level]}`
    }
    return handler(Math.round(size / 1024), level + 1)
  }
  return handler(size, level)
}

export const addUrlSearch = (url: string, search: string): string => {
  const urlObj = new URL(url)
  urlObj.search += (urlObj.search.startsWith('?') ? '&' : '?') + search
  return urlObj.href
}

export function debounce(fn, wait): () => void {
  let timer: any = null

  return function (...args) {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }

    timer = setTimeout(() => {
      // @ts-ignore
      fn.apply(this, args)
    }, wait)
  }
}
