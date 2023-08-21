import logDebug from 'yunxin-log-debug'
import packageJson from '../package.json'

export { logDebug }

export const logger = logDebug({
  level: 'debug',
  version: packageJson.version,
  appName: packageJson.name,
})

// 传入的是空，返回旧值
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

// 传入的是空，返回空
export const mergeActions = <T>(
  defaultActions: T[],
  propsActions: T[],
  key: keyof T
): T[] => {
  return propsActions.map((i) => {
    const defaultAction = defaultActions.find((j) => i[key] === j[key])
    if (defaultAction) {
      return {
        ...defaultAction,
        ...i,
      }
    } else {
      return i
    }
  })
}

export const groupByPy = <T>(
  arr: T[],
  keys: {
    firstKey: string
    secondKey?: string
    thirdKey?: string
  },
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
    const v =
      item[keys.firstKey] ||
      item[keys.secondKey || ''] ||
      item[keys.thirdKey || '']
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
                p.queue.forEach((j) => j.resolve(_))
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

/**
 * 解析 sessionId，形如 scene-accid
 */
export const parseSessionId = (
  sessionId: string
): { scene: string; to: string } => {
  const [scene, ...to] = sessionId.split('-')
  return {
    scene,
    // 这样处理是为了防止有些用户 accid 中自带 -
    to: to.join('-'),
  }
}

interface IKeyMap {
  [key: string]: string
}

export const handleEmojiTranslate = (t) => {
  const EMOJI_ICON_MAP_CONFIG: IKeyMap = {
    [t('Laugh')]: 'icon-a-1',
    [t('Happy')]: 'icon-a-2',
    [t('Sexy')]: 'icon-a-3',
    [t('Cool')]: 'icon-a-4',
    [t('Mischievous')]: 'icon-a-5',
    [t('Kiss')]: 'icon-a-6',
    [t('Spit')]: 'icon-a-7',
    [t('Squint')]: 'icon-a-8',
    [t('Cute')]: 'icon-a-9',
    [t('Grimace')]: 'icon-a-10',
    [t('Snicker')]: 'icon-a-11',
    [t('Joy')]: 'icon-a-12',
    [t('Ecstasy')]: 'icon-a-13',
    [t('Surprise')]: 'icon-a-14',
    [t('Tears')]: 'icon-a-15',
    [t('Sweat')]: 'icon-a-16',
    [t('Angle')]: 'icon-a-17',
    [t('Funny')]: 'icon-a-18',
    [t('Awkward')]: 'icon-a-19',
    [t('Thrill')]: 'icon-a-20',
    [t('Cry')]: 'icon-a-21',
    [t('Fretting')]: 'icon-a-22',
    [t('Terrorist')]: 'icon-a-23',
    [t('Halo')]: 'icon-a-24',
    [t('Shame')]: 'icon-a-25',
    [t('Sleep')]: 'icon-a-26',
    [t('Tired')]: 'icon-a-27',
    [t('Mask')]: 'icon-a-28',
    [t('ok')]: 'icon-a-29',
    [t('AllRight')]: 'icon-a-30',
    [t('Despise')]: 'icon-a-31',
    [t('Uncomfortable')]: 'icon-a-32',
    [t('Disdain')]: 'icon-a-33',
    [t('ill')]: 'icon-a-34',
    [t('Mad')]: 'icon-a-35',
    [t('Ghost')]: 'icon-a-36',
    [t('Angry')]: 'icon-a-37',
    [t('Angry')]: 'icon-a-38',
    [t('Unhappy')]: 'icon-a-39',
    [t('Frown')]: 'icon-a-40',
    [t('Broken')]: 'icon-a-41',
    [t('Beckoning')]: 'icon-a-42',
    [t('Ok')]: 'icon-a-43',
    [t('Low')]: 'icon-a-44',
    [t('Nice')]: 'icon-a-45',
    [t('Applause')]: 'icon-a-46',
    [t('GoodJob')]: 'icon-a-47',
    [t('Hit')]: 'icon-a-48',
    [t('Please')]: 'icon-a-49',
    [t('Bye')]: 'icon-a-50',
    [t('First')]: 'icon-a-51',
    [t('Fist')]: 'icon-a-52',
    [t('GiveMeFive')]: 'icon-a-53',
    [t('Knife')]: 'icon-a-54',
    [t('Hi')]: 'icon-a-55',
    [t('No')]: 'icon-a-56',
    [t('Hold')]: 'icon-a-57',
    [t('Think')]: 'icon-a-58',
    [t('Pig')]: 'icon-a-59',
    [t('NoListen')]: 'icon-a-60',
    [t('NoLook')]: 'icon-a-61',
    [t('NoWords')]: 'icon-a-62',
    [t('Monkey')]: 'icon-a-63',
    [t('Bomb')]: 'icon-a-64',
    [t('Sleep')]: 'icon-a-65',
    [t('Cloud')]: 'icon-a-66',
    [t('Rocket')]: 'icon-a-67',
    [t('Ambulance')]: 'icon-a-68',
    [t('Poop')]: 'icon-a-70',
  }
  // TODO react-string-replace 的行为不是那么的好理解，比如像下面这个正则就一定要加 '()'，后面最好干掉自己实现
  const INPUT_EMOJI_SYMBOL_REG = new RegExp(
    '(' +
      Object.keys(EMOJI_ICON_MAP_CONFIG)
        .map((item) => {
          const left = `\\${item.slice(0, 1)}`
          const right = `\\${item.slice(-1)}`
          const mid = item.slice(1, -1)
          return `${left}${mid}${right}`
        })
        .join('|') +
      ')',
    'g'
  )
  return {
    EMOJI_ICON_MAP_CONFIG,
    INPUT_EMOJI_SYMBOL_REG,
  }
}
