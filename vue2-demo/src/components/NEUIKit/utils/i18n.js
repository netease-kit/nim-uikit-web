import en from "../locale/en";
import zh from "../locale/zh-Hans";
const i18nData = {
  en,
  zh,
};

let currentLanguage = "zh";

export function setLanguage(language) {
  currentLanguage = language;
}

export const t = (key) => {
  return i18nData[currentLanguage][key] || key;
};
