import { Md5 } from "ts-md5";

export const uuid = () => {
  const key = "wyyx__education__uuid";
  let res = localStorage.getItem(key);
  if (!res) {
    res = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    localStorage.setItem(key, res);
  }
  return res;
};

export const encode = (s: string) => {
  return Md5.hashStr(s + "@163");
};

/**
 * 解析输入的文件大小
 * @param size 文件大小，单位b
 * @param level 递归等级，对应fileSizeMap
 */
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

export const addUrlSearch = (url: string, search: string): string => {
  const urlObj = new URL(url);
  urlObj.search += (urlObj.search.startsWith("?") ? "&" : "?") + search;
  return urlObj.href;
};

export const matchExt = (extname: string): string => {
  const regMap: { [key: string]: RegExp } = {
    pdf: /pdf$/i,
    word: /(doc|docx)$/i,
    excel: /(xls|xlsx)$/i,
    ppt: /(ppt|pptx)$/i,
    zip: /(rar|zip|7z|gz)$/i,
  };
  return Object.keys(regMap).find((key) => regMap[key].test(extname)) || "";
};

export const shallowEqual = (
  objA: { [key: string]: any },
  objB: { [key: string]: any }
) => {
  if (Object.is(objA, objB)) {
    return true;
  }

  if (
    typeof objA !== "object" ||
    objA === null ||
    typeof objB !== "object" ||
    objB === null
  ) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  for (let i = 0; i < keysA.length; i++) {
    if (
      !Object.hasOwnProperty.call(objB, keysA[i]) ||
      !Object.is(objA[keysA[i]], objB[keysA[i]])
    ) {
      return false;
    }
  }

  return true;
};

// 节流，猜测由于bind销毁，导致闭包内存储的数据也会丢失，暂时使用这种方式
let previous = 0;
export function throttle(func: any, wait = 1000) {
  return function () {
    const now = +new Date();
    if (now - previous > wait) {
      func();
      previous = now;
    }
  };
}

export const sleep = (timer: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timer);
  });
};
