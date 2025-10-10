import zhCn from './zh-cn'

const i18n = {
  'zh-cn': zhCn
}

// 获取当前语言
const getCurrentLanguage = (): string => {
  return wx.getSystemInfoSync().language || 'zh-cn'
}

// 获取翻译文本
export const t = (key: string): string => {
  const lang = getCurrentLanguage()
  const langData = i18n[lang as keyof typeof i18n] || i18n['zh-cn']
  return langData[key as keyof typeof langData] || key
}

export default i18n