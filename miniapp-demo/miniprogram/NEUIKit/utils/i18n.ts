import en from '../locale/en'
import zh from '../locale/zh-Hans'
const i18nData: any = {
  en,
  zh,
}

let currentLanguage: string = 'zh'

export function setLanguage(language: string) {
  currentLanguage = language
}

export const t = (key: string) => {
  return i18nData[currentLanguage][key] || key
}
