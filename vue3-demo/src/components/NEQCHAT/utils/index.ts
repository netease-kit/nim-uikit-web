type RandomColor =
  | "#60CFA7"
  | "#53C3F3"
  | "#537FF4"
  | "#854FE2"
  | "#BE65D9"
  | "#E9749D"
  | "#F9B751";
const randomColors: RandomColor[] = [
  "#60CFA7",
  "#53C3F3",
  "#537FF4",
  "#854FE2",
  "#BE65D9",
  "#E9749D",
  "#F9B751",
];
const AccountColors: {
  [accid: string]: RandomColor;
} = {};

export const getColorByAccid = (accid: string) => {
  if (AccountColors[accid]) return AccountColors[accid];
  const newColor = randomColors[Math.floor(Math.random() * 7)];
  AccountColors[accid] = newColor;
  return newColor;
};

export const emptyFunc = () => {
  // do nothing
};

export const filterStr = (str: string) => {
  let text = "";
  for (let i = 0; i < str.length; i++) {
    switch (str.charCodeAt(i)) {
      case 34: // "
        text += "&quot;";
        break;
      case 38: // &
        text += "&amp;";
        break;
      case 39: // '
        text += "&#x27;"; // modified from escape-html; used to be '&#39'
        break;
      case 60: // <
        text += "&lt;";
        break;
      case 62: // >
        text += "&gt;";
        break;
      default:
        text += str[i];
        break;
    }
  }
  return text;
};

export const parseFileSize = (size: number, level = 0): string => {
  const fileSizeMap: { [key: number]: string } = {
    0: "B",
    1: "KB",
    2: "MB",
    3: "GB",
    4: "TB",
  };

  const handler = (size: number, level: number): string => {
    if (level >= Object.keys(fileSizeMap).length) {
      return "the file is too big";
    }
    if (size < 1024) {
      return `${size}${fileSizeMap[level]}`;
    }
    return handler(Math.round(size / 1024), level + 1);
  };
  return handler(size, level);
};

export const matchExt = (extname: string): string => {
  const regMap: { [key: string]: RegExp } = {
    pdf: /pdf$/i,
    word: /(doc|docx)$/i,
    excel: /(xls|xlsx)$/i,
    ppt: /(ppt|pptx)$/i,
    zip: /(rar|zip|7z|gz)$/i,
    video: /(mp4|mpg|mpeg|avi|rm|rmvb|mov|wmv|asf|dat)$/i,
    audio: /(mp3|wav|wma|rm|mid|ape|flac)$/i,
    img: /(png|jpg|jpeg|svg)$/i,
    txt: /(txt|log)$/i,
  };
  return (
    Object.keys(regMap).find((key) => regMap[key].test(extname)) || "unknown"
  );
};

export const isLt = (size: number, target: number) => {
  const res = size / 1024 / 1024 < target;
  return res;
};

export const debounce = (fn: any, delay: number, immediate = false) => {
  let timer: any;
  return function (...args: any[]) {
    const callNow = immediate && !timer;
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (!immediate) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        fn.apply(this, args);
      }
    }, delay);
    if (callNow) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      fn.apply(this, args);
    }
  };
};

export const promiseDebounce = (func: any, wait: number) => {
  const queue: any[] = [];
  let timer: any = null;
  return function (...args: any) {
    return new Promise((resolve, reject) => {
      queue.push([resolve, reject]);
      clearTimeout(timer);
      timer = setTimeout(() => {
        func
          // @ts-ignore
          .apply(this, args)
          .then((res: any) => {
            queue.map((item) => item[0]).forEach((item) => item(res));
          })
          .catch((err: any) => {
            queue.map((item) => item[1]).forEach((item) => item(err));
          })
          .finally(() => {
            queue.length = 0;
            timer = null;
          });
      }, wait);
    });
  };
};
