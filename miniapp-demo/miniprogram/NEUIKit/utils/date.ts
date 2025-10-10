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

/**
 * 格式化消息时间（用于消息列表显示）
 * 避免使用toLocaleTimeString等可能导致英文显示的API
 * @param timestamp 时间戳
 * @returns 格式化后的时间字符串
 */
export function formatMessageTime(timestamp: number): string {
  if (!timestamp) {
    return '';
  }
  
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // 一分钟内
  if (diff < 60 * 1000) {
    return '刚刚';
  }
  
  // 一小时内
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes}分钟前`;
  }
  
  // 今天
  if (date.toDateString() === now.toDateString()) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  
  // 昨天
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `昨天 ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  
  // 今年
  if (date.getFullYear() === now.getFullYear()) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  
  // 其他年份
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

/**
 * 格式化会话列表时间（类似Vue版本的conversation-item时间格式）
 * @param timestamp 时间戳
 * @returns 格式化后的时间字符串
 */
export function formatConversationTime(timestamp: number): string {
  if (!timestamp) {
    return '';
  }
  
  const date = new Date(timestamp);
  const now = new Date();
  
  // 判断是否是今天
  const isCurrentDay = date.toDateString() === now.toDateString();
  // 判断是否是今年
  const isCurrentYear = date.getFullYear() === now.getFullYear();
  
  if (isCurrentDay) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } else if (isCurrentYear) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } else {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
}
