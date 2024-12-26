//demo 国际化
import { demo_en, demo_zh } from '../locales/demo_locale'

const demoLocaleMap = {
  zh: demo_zh,
  en: demo_en,
}

const languageType =
  (sessionStorage.getItem('languageType') as 'zh' | 'en') || 'zh'

//国际化
export const t = (str: keyof typeof demo_zh): string => {
  return demoLocaleMap[languageType][str]
}

/**
 * 秒转换为时分秒
 */
export const convertSecondsToTime = (seconds: number): string => {
  const hours: number = Math.floor(seconds / 3600)
  const minutes: number = Math.floor((seconds - hours * 3600) / 60)
  const remainingSeconds: number = seconds - hours * 3600 - minutes * 60

  let timeString = ''

  const includeHours = seconds >= 3600

  if (includeHours) {
    if (hours < 10) {
      timeString += '0'
    }

    timeString += hours.toString() + ':'
  }

  if (minutes < 10) {
    timeString += '0'
  }

  timeString += minutes.toString() + ':'

  if (remainingSeconds < 10) {
    timeString += '0'
  }

  timeString += remainingSeconds.toString()

  return timeString
}

//话单类型
export const g2StatusMap = {
  1: t('callDurationText'),
  2: t('callCancelText'),
  3: t('callRejectedText'),
  4: t('callTimeoutText'),
  5: t('callBusyText'),
}

export const callTypeMap = {
  audio: '1',
  vedio: '2',
}
