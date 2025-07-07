import { logDebug } from '@xkit-yx/utils'
import moment from 'moment'
import packageJson from '../package.json'
import {
  V2NIMMessage,
  V2NIMMessageFileAttachment,
} from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMMessageService'

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

interface IKeyMap {
  [key: string]: string
}
export const EMOJI_ICON_MAP_CONFIG: IKeyMap = {
  '[大笑]': 'icon-a-1',
  '[开心]': 'icon-a-2',
  '[色]': 'icon-a-3',
  '[酷]': 'icon-a-4',
  '[奸笑]': 'icon-a-5',
  '[亲]': 'icon-a-6',
  '[伸舌头]': 'icon-a-7',
  '[眯眼]': 'icon-a-8',
  '[可爱]': 'icon-a-9',
  '[鬼脸]': 'icon-a-10',
  '[偷笑]': 'icon-a-11',
  '[喜悦]': 'icon-a-12',
  '[狂喜]': 'icon-a-13',
  '[惊讶]': 'icon-a-14',
  '[流泪]': 'icon-a-15',
  '[流汗]': 'icon-a-16',
  '[天使]': 'icon-a-17',
  '[笑哭]': 'icon-a-18',
  '[尴尬]': 'icon-a-19',
  '[惊恐]': 'icon-a-20',
  '[大哭]': 'icon-a-21',
  '[烦躁]': 'icon-a-22',
  '[恐怖]': 'icon-a-23',
  '[两眼冒星]': 'icon-a-24',
  '[害羞]': 'icon-a-25',
  '[睡着]': 'icon-a-26',
  '[冒星]': 'icon-a-27',
  '[口罩]': 'icon-a-28',
  '[OK]': 'icon-a-29',
  '[好吧]': 'icon-a-30',
  '[鄙视]': 'icon-a-31',
  '[难受]': 'icon-a-32',
  '[不屑]': 'icon-a-33',
  '[不舒服]': 'icon-a-34',
  '[愤怒]': 'icon-a-35',
  '[鬼怪]': 'icon-a-36',
  '[发怒]': 'icon-a-37',
  '[生气]': 'icon-a-38',
  '[不高兴]': 'icon-a-39',
  '[皱眉]': 'icon-a-40',
  '[心碎]': 'icon-a-41',
  '[心动]': 'icon-a-42',
  '[好的]': 'icon-a-43',
  '[低级]': 'icon-a-44',
  '[赞]': 'icon-a-45',
  '[鼓掌]': 'icon-a-46',
  '[给力]': 'icon-a-47',
  '[打你]': 'icon-a-48',
  '[阿弥陀佛]': 'icon-a-49',
  '[拜拜]': 'icon-a-50',
  '[第一]': 'icon-a-51',
  '[拳头]': 'icon-a-52',
  '[手掌]': 'icon-a-53',
  '[剪刀]': 'icon-a-54',
  '[招手]': 'icon-a-55',
  '[不要]': 'icon-a-56',
  '[举着]': 'icon-a-57',
  '[思考]': 'icon-a-58',
  '[猪头]': 'icon-a-59',
  '[不听]': 'icon-a-60',
  '[不看]': 'icon-a-61',
  '[不说]': 'icon-a-62',
  '[猴子]': 'icon-a-63',
  '[炸弹]': 'icon-a-64',
  '[睡觉]': 'icon-a-65',
  '[筋斗云]': 'icon-a-66',
  '[火箭]': 'icon-a-67',
  '[救护车]': 'icon-a-68',
  '[便便]': 'icon-a-70',
}

export const handleEmojiTranslate = (t) => {
  const SHOW_EMOJI_ICON_MAP_CONFIG: IKeyMap = {
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
    [t('huff')]: 'icon-a-37',
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
    [t('Sleeping')]: 'icon-a-65',
    [t('Cloud')]: 'icon-a-66',
    [t('Rocket')]: 'icon-a-67',
    [t('Ambulance')]: 'icon-a-68',
    [t('Poop')]: 'icon-a-70',
  }

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
    SHOW_EMOJI_ICON_MAP_CONFIG,
    INPUT_EMOJI_SYMBOL_REG,
  }
}

export function replaceEmoji(text: string, emojiMap?: string[]) {
  const defaultEmojiMap = {
    '[Laugh]': '[大笑]',
    '[Happy]': '[开心]',
    '[Sexy]': '[色]',
    '[Cool]': '[酷]',
    '[Mischievous]': '[奸笑]',
    '[Kiss]': '[亲]',
    '[Spit]': '[伸舌头]',
    '[Squint]': '[眯眼]',
    '[Cute]': '[可爱]',
    '[Grimace]': '[鬼脸]',
    '[Snicker]': '[偷笑]',
    '[Joy]': '[喜悦]',
    '[Ecstasy]': '[狂喜]',
    '[Surprise]': '[惊讶]',
    '[Tears]': '[流泪]',
    '[Sweat]': '[流汗]',
    '[Angle]': '[天使]',
    '[Funny]': '[笑哭]',
    '[Awkward]': '[尴尬]',
    '[Thrill]': '[惊恐]',
    '[Cry]': '[大哭]',
    '[Fretting]': '[烦躁]',
    '[Terrorist]': '[恐怖]',
    '[Halo]': '[两眼冒星]',
    '[Shame]': '[害羞]',
    '[Sleep]': '[睡着]',
    '[Tired]': '[睡觉]',
    '[Mask]': '[口罩]',
    '[Ok]': '[OK]',
    '[All right]': '[好吧]',
    '[Despise]': '[鄙视]',
    '[Uncomfortable]': '[难受]',
    '[Disdain]': '[不屑]',
    '[ill]': '[不舒服]',
    '[Mad]': '[愤怒]',
    '[Ghost]': '[鬼怪]',
    '[Huff]': '[发怒]',
    '[Angry]': '[生气]',
    '[Unhappy]': '[不高兴]',
    '[Frown]': '[皱眉]',
    '[Broken]': '[心碎]',
    '[Beckoning]': '[心动]',
    '[Low]': '[低级]',
    '[Nice]': '[赞]',
    '[Applause]': '[鼓掌]',
    '[Good job]': '[给力]',
    '[Hit]': '[打你]',
    '[Please]': '[阿弥陀佛]',
    '[Bye]': '[拜拜]',
    '[First]': '[第一]',
    '[Fist]': '[拳头]',
    '[Give me five]': '[招手]',
    '[Knife]': '[剪刀]',
    '[Hi]': '[招手]',
    '[No]': '[不要]',
    '[Hold]': '[举着]',
    '[Think]': '[思考]',
    '[Pig]': '[猪头]',
    '[No listen]': '[不听]',
    '[No look]': '[不看]',
    '[No words]': '[不说]',
    '[Monkey]': '[猴子]',
    '[Bomb]': '[炸弹]',
    '[Sleeping]': '[睡觉]',
    '[Cloud]': '[筋斗云]',
    '[Rocket]': '[火箭]',
    '[Ambulance]': '[救护车]',
    '[Poop]': '[便便]',
  }

  const emojiMapConfig = emojiMap || defaultEmojiMap
  const emojiMapRegex = new RegExp(
    '(' +
      Object.keys(emojiMapConfig)
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

  return text.replace(emojiMapRegex, function (matched) {
    return emojiMapConfig[matched]
  })
}

export function getImgDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      resolve(e.target?.result as string)
    }

    reader.onerror = (e) => {
      reject(e)
    }

    reader.readAsDataURL(file)
  })
}

export function getVideoFirstFrameDataUrl(videoFile: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    video.onloadeddata = () => {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context?.drawImage(video, 0, 0, canvas.width, canvas.height)
      const dataURL = canvas.toDataURL('image/jpeg')

      resolve(dataURL)
    }

    video.onerror = () => {
      reject(new Error('Failed to load the video'))
    }

    const url = URL.createObjectURL(videoFile)

    video.preload = 'auto'
    video.autoplay = true
    video.muted = true
    video.src = url
  })
}

export const formatDate = (time: number): string => {
  const date = moment(time)
  const isCurrentDay = date.isSame(moment(), 'day')
  const isCurrentYear = date.isSame(moment(), 'year')

  return isCurrentDay
    ? date.format('HH:mm:ss')
    : isCurrentYear
    ? date.format('MM-DD HH:mm:ss')
    : date.format('YYYY-MM-DD HH:mm:ss')
}

export const hasQueryParams = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url)

    return parsedUrl.search !== ''
  } catch (error) {
    return false
  }
}

export const getDownloadUrl = (msg: V2NIMMessage) => {
  // todo 这个定义难过
  const attachment = msg.attachment as V2NIMMessageFileAttachment

  return hasQueryParams(attachment.url)
    ? `${attachment.url}&download=${msg.messageClientId}${attachment.ext}`
    : `${attachment.url}?download=${msg.messageClientId}${attachment.ext}`
}

export const getAIErrorMap = (t): { [key: number]: string } => {
  return {
    102404: t('memberNotExistsText'),
    189308: t('tipAIFailedMessageText'),
    189451: t('aiAntiSpamText'),
    107337: t('aiFunctionDisabled'),
    102422: t('aiMemberBanned'),
    102421: t('aiMemberChatBanned'),
    104404: t('aiFriendNotExists'),
    107451: t('aiMessageHitAntiSpam'),
    102304: t('notAnAi'),
    109404: t('aiTeamMemberNotExists'),
    108306: t('aiNormalTeamChatBanned'),
    109424: t('aiTeamChatBanned'),
    106403: t('aiBlockFailedText'),
    416: t('aiRateLimit'),
    414: t('aiParameterError'),
    107336: t('tipAIMessageText'),
  }
}

// 当用户或者群聊没有头像时，用于根据account生成头像背景色
export const getAvatarBackgroundColor = (account): string => {
  const colorMap: { [key: number]: string } = {
    0: '#60CFA7',
    1: '#53C3F3',
    2: '#537FF4',
    3: '#854FE2',
    4: '#BE65D9',
    5: '#E9749D',
    6: '#F9B751',
  }
  // 将account转换为数字，取余数作为头像颜色索引
  const stringToNumber = (inputString) => {
    let hash = 0

    if (inputString.length === 0) {
      return hash
    }

    for (let i = 0; i < inputString.length; i++) {
      const char = inputString.charCodeAt(i)

      hash = (hash << 5) - hash + char // 简单的加权算法
      hash = hash & hash // 将 hash 转换为 32 位整数
    }

    return Math.abs(hash) // 返回绝对值，确保为正数
  }

  const bgColorIndex = (stringToNumber(account) || 0) % 7

  return colorMap[bgColorIndex]
}

export const throttle = (func, wait: number) => {
  let lastTime = 0

  return function (this: any, ...args: any[]) {
    const now = Date.now()

    if (now - lastTime >= wait) {
      lastTime = now
      func.apply(this, args)
    }
  }
}

export const isDiscussionFunc = (serverExtension: string | undefined) => {
  try {
    return JSON.parse(serverExtension || '{}').im_ui_kit_group
  } catch (error) {
    console.warn('parse serverExtension error', error)
    return false
  }
}
