import { emojiRegExp } from "./emoji";

export interface Match {
  type: "link" | "emoji" | "text" | "Ait" | "markdown";
  value: string;
  key: string;
  html?: string; // 用于 markdown 类型存储渲染后的 HTML
}



/**
 * 检测文本是否包含 markdown 语法
 * @param text 要检测的文本
 * @returns 是否包含 markdown 语法
 */
function hasMarkdownSyntax(text: string): boolean {
  // 检测常见的 markdown 语法，使用更严格的匹配规则
  const markdownPatterns = [
    /\*\*\S.*?\S\*\*/, // 粗体 **text** (至少包含非空白字符)
    /\*\S.*?\S\*/, // 斜体 *text* (至少包含非空白字符)
    /__\S.*?\S__/, // 粗体 __text__ (至少包含非空白字符)
    /_\S.*?\S_/, // 斜体 _text_ (至少包含非空白字符)
    /`[^`\n]+`/, // 行内代码 `code` (不包含换行)
    /```[\s\S]*?```/, // 代码块 ```code```
    /^#{1,6}\s+.+/m, // 标题 # ## ### 等 (必须有内容)
    /^\s*[-*+]\s+.+/m, // 无序列表 - * + (必须有内容)
    /^\s*\d+\.\s+.+/m, // 有序列表 1. 2. (必须有内容)
    /^\s*>\s+.+/m, // 引用 > (必须有内容)
    /\[.+?\]\(.+?\)/, // 链接 [text](url) (必须有内容)
    /!\[.*?\]\(.+?\)/, // 图片 ![alt](url) (URL不能为空)
    /^\s*\|.+\|.+\|/m, // 表格 (至少两列)
    /~~.+?~~/, // 删除线 ~~text~~ (必须有内容)
  ];

  return markdownPatterns.some((pattern) => pattern.test(text));
}

/* eslint-disable vars-on-top, no-var, prefer-template */
// @ts-nocheck
var isRegExp = function (re: any) {
  return re instanceof RegExp;
};
var escapeRegExp = function escapeRegExp(string: string) {
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g,
    reHasRegExpChar = RegExp(reRegExpChar.source);

  return string && reHasRegExpChar.test(string)
    ? string.replace(reRegExpChar, "\\$&")
    : string;
};
var isString = function (value: string | any[]) {
  return typeof value === "string";
};
var flatten = function (array: any[]) {
  var newArray: any[] = [];

  array.forEach(function (item) {
    if (Array.isArray(item)) {
      newArray = newArray.concat(item);
    } else {
      newArray.push(item);
    }
  });

  return newArray;
};

/**
 * Given a string, replace every substring that is matched by the `match` regex
 * with the result of calling `fn` on matched substring. The result will be an
 * array with all odd indexed elements containing the replacements. The primary
 * use case is similar to using String.prototype.replace except for React.
 *
 * React will happily render an array as children of a react element, which
 * makes this approach very useful for tasks like surrounding certain text
 * within a string with react elements.
 *
 * Example:
 * matchReplace(
 *   'Emphasize all phone numbers like 884-555-4443.',
 *   /([\d|-]+)/g,
 *   (number, i) => <strong key={i}>{number}</strong>
 * );
 * // => ['Emphasize all phone numbers like ', <strong>884-555-4443</strong>, '.'
 *
 * @param {string} str
 * @param {RegExp|str} match Must contain a matching group
 * @param {function} fn
 * @return {array}
 */

function replaceString(str: string | any[], match: RegExp, fn: Function) {
  var curCharStart = 0;
  var curCharLen = 0;

  if (str === "") {
    return str;
  } else if (!str || !isString(str)) {
    throw new TypeError(
      "First argument to react-string-replace#replaceString must be a string",
    );
  }

  var re = match;

  if (!isRegExp(re)) {
    // @ts-ignore
    re = new RegExp("(" + escapeRegExp(re) + ")", "gi");
  }
  // @ts-ignore
  var result = str.split(re);

  // Apply fn to all odd elements
  for (var i = 1, length = result.length; i < length; i += 2) {
    /** @see {@link https://github.com/iansinnott/react-string-replace/issues/74} */
    if (result[i] === undefined || result[i - 1] === undefined) {
      console.warn(
        "reactStringReplace: Encountered undefined value during string replacement. Your RegExp may not be working the way you expect.",
      );
      continue;
    }

    curCharLen = result[i].length;
    curCharStart += result[i - 1].length;
    result[i] = fn(result[i], i, curCharStart);
    curCharStart += curCharLen;
  }

  return result;
}

// 字符串替换
export function stringReplace(
  source: string | any[],
  match: RegExp,
  fn: Function,
) {
  if (!Array.isArray(source)) source = [source];

  return flatten(
    source.map(function (x) {
      return isString(x) ? replaceString(x, match, fn) : x;
    }),
  );
}

/**
 * 解析文本内容，提取其中的表情符号、链接和@提及信息
 * @param {string} text - 需要解析的原始文本
 * @param {string} [ext] - 扩展信息，可能包含@提及的元数据
 * @returns {Match[]} 解析后的结果数组，包含文本、表情、链接和@提及的标记信息
 * @throws 当JSON解析失败时会捕获错误并返回空数组
 */
/**
 * 解析文本内容，提取其中的表情符号、链接和@提及信息
 * @param {string} text - 需要解析的原始文本
 * @param {string} [ext] - 扩展信息(JSON字符串)，包含yxAitMsg用于解析@提及
 * @returns {Match[]} 解析后的结果数组，包含文本片段及其类型信息
 * @throws 当ext参数不是有效的JSON字符串时会抛出错误
 */
export function parseText(text: string, ext?: string): Match[] {
  if (!text) return [];
  try {
    // // 检测是否包含 markdown 语法
    // if (hasMarkdownSyntax(text)) {
    //   // 如果包含 markdown 语法，作为整体处理
    //   const htmlContent = marked.parse(text) as string;
    //   return [
    //     {
    //       type: "markdown",
    //       value: text,
    //       html: htmlContent,
    //       key: "markdown-0",
    //     },
    //   ];
    // }

    // 原有的解析逻辑
    const regexLink = /(https?:\/\/\S+)/gi;
    const yxAitMsg = ext ? JSON.parse(ext).yxAitMsg : null;
    const emojiArr = stringReplace(text, emojiRegExp, (item: any) => {
      return {
        type: "emoji",
        value: item,
      };
    });

    const emojiAndLinkArr = stringReplace(emojiArr, regexLink, (item: any) => {
      return {
        type: "link",
        value: item,
      };
    });

    let emojiAndLinkAndAitArr = emojiAndLinkArr;
    if (yxAitMsg) {
      Object.keys(yxAitMsg)?.forEach((key) => {
        const item = yxAitMsg[key];
        emojiAndLinkAndAitArr = stringReplace(
          emojiAndLinkAndAitArr,
          item.text,
          (item: any) => {
            return {
              type: "Ait",
              value: item,
            };
          },
        );
      });
    }

    const result = emojiAndLinkAndAitArr.map((item) => {
      if (typeof item == "string") {
        return {
          type: "text",
          value: item,
        };
      } else {
        return item;
      }
    });
    return result.map((item, index) => {
      return {
        ...item,
        key: index + item.type,
      };
    });
  } catch (error) {
    console.error("parseText error", error);
    return [];
  }
}
