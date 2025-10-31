import { emojiRegExp } from "./emoji";

export interface Match {
  type: "link" | "emoji" | "text" | "Ait";
  value: string;
  key: string;
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
      "First argument to react-string-replace#replaceString must be a string"
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
        "reactStringReplace: Encountered undefined value during string replacement. Your RegExp may not be working the way you expect."
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
function stringReplace(source: string | any[], match: RegExp, fn: Function) {
  if (!Array.isArray(source)) source = [source];

  return flatten(
    source.map(function (x) {
      return isString(x) ? replaceString(x, match, fn) : x;
    })
  );
}

export function parseText(text: string, ext?: string): Match[] {
  if (!text) return [];
  try {
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
          }
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
