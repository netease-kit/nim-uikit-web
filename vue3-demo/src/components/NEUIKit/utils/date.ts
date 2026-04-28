/**
 * 辅助函数：补零（将 5 转为 "05"）
 */
const padZero = (num: number): string => {
  return num > 9 ? String(num) : "0" + num;
};

/**
 * 辅助函数：判断两个日期是否是同一天
 */
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * 辅助函数：判断两个日期是否是同一年
 */
const isSameYear = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear();
};

/**
 * 辅助函数：格式化日期
 */
const formatDateTime = (date: Date, format: string): string => {
  const year = date.getFullYear();
  const month = padZero(date.getMonth() + 1);
  const day = padZero(date.getDate());
  const hours = padZero(date.getHours());
  const minutes = padZero(date.getMinutes());

  return format
    .replace("YYYY", String(year))
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes);
};

export const formatDateRange = (type: string | number) => {
  const date = new Date();
  let year = date.getFullYear();
  let month: string | number = date.getMonth() + 1;
  let day: string | number = date.getDate();

  if (type === "start") {
    year = year - 100;
  }
  month = month > 9 ? month : "0" + month;
  day = day > 9 ? day : "0" + day;
  return `${year}-${month}-${day}`;
};

export const formatDate = (time: string | number | undefined): string => {
  if (time === undefined || time === null || time === "") {
    return "";
  }

  let date: Date;

  if (typeof time === "string") {
    const s = time.trim();
    if (!s) return "";
    if (/^[0-9]+$/.test(s)) {
      const t = Number(s);
      if (t >= 946684800000 && t <= 4102444800000) {
        date = new Date(t);
      } else if (t >= 946684800 && t <= 4102444800) {
        date = new Date(t * 1000);
      } else if (t >= 100001 && t <= 999912) {
        const year = Math.floor(t / 100);
        const month = t % 100;
        date = new Date(year, month - 1, 1);
      } else if (t >= 10000101 && t <= 99991231) {
        const year = Math.floor(t / 10000);
        const month = Math.floor((t % 10000) / 100);
        const day = t % 100;
        date = new Date(year, month - 1, day);
      } else {
        date = new Date(s.length >= 13 ? t : t * 1000);
      }
    } else {
      date = new Date(s);
    }
  } else {
    const t = Number(time);
    if (t >= 946684800000 && t <= 4102444800000) {
      date = new Date(t);
    } else if (t >= 946684800 && t <= 4102444800) {
      date = new Date(t * 1000);
    } else if (t >= 100001 && t <= 999912) {
      const year = Math.floor(t / 100);
      const month = t % 100;
      date = new Date(year, month - 1, 1);
    } else if (t >= 10000101 && t <= 99991231) {
      const year = Math.floor(t / 10000);
      const month = Math.floor((t % 10000) / 100);
      const day = t % 100;
      date = new Date(year, month - 1, day);
    } else {
      const len = String(Math.floor(Math.abs(t))).length;
      date = new Date(len >= 13 ? t : t * 1000);
    }
  }

  const now = new Date();
  const isCurrentDay = isSameDay(date, now);
  const isCurrentYear = isSameYear(date, now);

  return formatDateTime(
    date,
    isCurrentDay ? "HH:mm" : isCurrentYear ? "MM-DD" : "YYYY-MM-DD"
  );
};