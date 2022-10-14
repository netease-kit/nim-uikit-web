import logDebug from 'yunxin-log-debug'
import packageJson from '../package.json'

export { logDebug }

export const logger = logDebug({
  level: 'debug',
  version: packageJson.version,
  appName: packageJson.name,
})

export function mergeArrs<T>(
  oldArr: T[],
  newArr: Partial<T>[],
  key: keyof T
): T[] {
  const map = new Map<T[keyof T], T>()

  oldArr.forEach((item) => {
    // @ts-ignore
    map.set(item[key], item)
  })

  newArr.forEach((item) => {
    // @ts-ignore
    const exist = map.get(item[key])
    let finalItem = item
    if (exist) {
      finalItem = { ...exist, ...item }
    }
    // @ts-ignore
    map.set(item[key], finalItem)
  })

  return [...map.values()]
}

export const groupByPy = <T>(
  arr: T[],
  key: keyof T,
  isLowerCase = true
): { key: string; data: T[] }[] => {
  const res: { [key: string]: T[] } = {}
  const OTHER_TAG = '#'

  const add = (k: string, v: T) => {
    const _k = isLowerCase ? k.toLowerCase() : k.toUpperCase()
    if (!res[_k]) {
      res[_k] = [v]
    } else {
      res[_k].push(v)
    }
  }

  arr.forEach((item) => {
    const v = item[key]
    if (!!v && typeof v === 'string') {
      const str = v[0]
      if (/^[a-zA-Z]$/.test(str)) {
        add(str.toLowerCase(), item)
      } else if (/^[\u4e00-\u9fa5]$/.test(str)) {
        const en = '*abcdefghjklmnopqrstwxyz'.split('')
        const zh = '阿八嚓哒妸发旮哈讥咔垃痳拏噢妑七呥扨它穵夕丫帀'.split('')
        const k = en.find(
          (k, ki) =>
            (!zh[ki - 1] || zh[ki - 1].localeCompare(str, 'zh') <= 0) &&
            str.localeCompare(zh[ki], 'zh') == -1
        )
        if (k && k !== '*') {
          add(k, item)
        } else {
          add(OTHER_TAG, item)
        }
      } else {
        add(OTHER_TAG, item)
      }
    } else {
      add(OTHER_TAG, item)
    }
  })

  const data = Object.keys(res).map((k) => ({ key: k, data: res[k] }))
  const sortData = data
    .filter((item) => item.key !== OTHER_TAG)
    .sort((a, b) => a.key.localeCompare(b.key, 'en'))
  const otherData = data.filter((item) => item.key === OTHER_TAG)

  return sortData.concat(otherData)
}

export const frequencyControl = <
  P extends string,
  R extends { account: string }
>(
  fn: (params: P[]) => Promise<R[]>,
  delay: number,
  limit: number
): ((params: P) => Promise<R>) => {
  const promiseQueue: { args: P; queue: { resolve: any; reject: any }[] }[] = []
  let requesting = false
  let timer: any

  return function (args) {
    return new Promise((resolve, reject) => {
      const p = promiseQueue.find((item) => item.args === args)
      if (p) {
        p.queue.push({ resolve, reject })
      } else {
        promiseQueue.push({ args, queue: [{ resolve, reject }] })
      }

      if (requesting) {
        return
      }

      const handler = (
        pq: { args: P; queue: { resolve: any; reject: any }[] }[]
      ) => {
        if (!pq.length) {
          return
        }
        requesting = true
        fn.call(
          // @ts-ignore
          this,
          pq.map((item) => item.args)
        )
          .then((res) => {
            while (pq.length) {
              const p = pq.shift()
              if (p) {
                const _ = res.find((j) => j.account === p.args)
                if (_) {
                  p.queue.forEach((j) => j.resolve(_))
                }
              }
            }
          })
          .catch((err) => {
            while (pq.length) {
              const p = pq.shift()
              if (p) {
                p.queue.forEach((item) => item.reject(err))
              }
            }
          })
          .finally(() => {
            requesting = false
            if (promiseQueue.length) {
              handler(promiseQueue.splice(0, limit))
            }
          })
      }

      // 如果参数数量到达 limit，立即执行
      if (promiseQueue.length >= limit) {
        clearTimeout(timer)
        handler(promiseQueue.splice(0, limit))
      } else {
        clearTimeout(timer)
        timer = setTimeout(() => {
          handler(promiseQueue.splice(0, limit))
        }, delay)
      }
    })
  }
}
