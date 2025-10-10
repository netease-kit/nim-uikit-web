export const friendGroupByPy = <
  T extends {
    [key: string]: any;
  }
>(
  arr: T[],
  keys: {
    firstKey: string;
    secondKey?: string;
    thirdKey?: string;
  },
  isLowerCase = true
): { key: string; data: T[] }[] => {
  const res: { [key: string]: T[] } = {};
  const OTHER_TAG = "#";

  const add = (k: string, v: T) => {
    const _k = isLowerCase ? k.toLowerCase() : k.toUpperCase();
    if (!res[_k]) {
      res[_k] = [v];
    } else {
      res[_k].push(v);
    }
  };

  arr.forEach((item) => {
    const v =
      item[keys.firstKey] ||
      item[keys.secondKey || ""] ||
      item[keys.thirdKey || ""];
    if (!!v && typeof v === "string") {
      const str = v[0];
      if (/^[a-zA-Z]$/.test(str)) {
        add(str.toLowerCase(), item);
      } else if (/^[\u4e00-\u9fa5]$/.test(str)) {
        const en = "*abcdefghjklmnopqrstwxyz".split("");

        const zh = "阿八嚓哒妸发旮哈讥咔垃痳拏噢妑七呥扨它穵夕丫帀".split("");
        // @ts-ignore
        let k = en.find(
          (_, ki) =>
            (!zh[ki - 1] || zh[ki - 1].localeCompare(str, "zh") <= 0) &&
            str.localeCompare(zh[ki], "zh") == -1
        );
        // #endif
        if (k && k !== "*") {
          add(k, item);
        } else {
          add(OTHER_TAG, item);
        }
      } else {
        add(OTHER_TAG, item);
      }
    } else {
      add(OTHER_TAG, item);
    }
  });

  const data = Object.keys(res).map((k) => ({ key: k, data: res[k] }));
  const sortData = data
    .filter((item) => item.key !== OTHER_TAG)
    .sort((a, b) => a.key.localeCompare(b.key, "en"));
  const otherData = data.filter((item) => item.key === OTHER_TAG);

  return sortData.concat(otherData);
};
