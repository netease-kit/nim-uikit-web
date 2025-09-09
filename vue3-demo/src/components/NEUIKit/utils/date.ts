import { t } from './i18n'

export function caculateTimeago(dateTimeStamp: number): string {
  const minute = 1000 * 60 // 把分，时，天，周，半个月，一个月用毫秒表示
  const hour = minute * 60
  const day = hour * 24
  const week = day * 7
  const now = new Date().getTime() // 获取当前时间毫秒
  const diffValue = now - dateTimeStamp // 时间差
  let result = ''

  if (diffValue < 0) {
    return t('nowText')
  }
  const minC = Math.floor(diffValue / minute) // 计算时间差的分，时，天，周，月
  const hourC = Math.floor(diffValue / hour)
  const dayC = Math.floor(diffValue / day)
  const weekC = Math.floor(diffValue / week)
  if (weekC >= 1 && weekC <= 4) {
    result = ` ${weekC}${t('weekText')}`
  } else if (dayC >= 1 && dayC <= 6) {
    result = ` ${dayC}${t('dayText')}`
  } else if (hourC >= 1 && hourC <= 23) {
    result = ` ${hourC}${t('hourText')}`
  } else if (minC >= 1 && minC <= 59) {
    result = ` ${minC}${t('minuteText')}`
  } else if (diffValue >= 0 && diffValue <= minute) {
    result = t('nowText')
  } else {
    const datetime = new Date()
    datetime.setTime(dateTimeStamp)
    const Nyear = datetime.getFullYear()
    const Nmonth =
      datetime.getMonth() + 1 < 10
        ? `0${datetime.getMonth() + 1}`
        : datetime.getMonth() + 1
    const Ndate =
      datetime.getDate() < 10 ? `0${datetime.getDate()}` : datetime.getDate()
    result = `${Nyear}-${Nmonth}-${Ndate}`
  }
  return result
}

export const formatDateRange = (type: string) => {
  const date = new Date()
  let year = date.getFullYear()
  let month: string | number = date.getMonth() + 1
  let day: string | number = date.getDate()

  if (type === 'start') {
    year = year - 100
  } else if (type === 'end') {
    year = year
  }
  month = month > 9 ? month : '0' + month
  day = day > 9 ? day : '0' + day
  return `${year}-${month}-${day}`
}
