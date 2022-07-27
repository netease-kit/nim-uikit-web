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
