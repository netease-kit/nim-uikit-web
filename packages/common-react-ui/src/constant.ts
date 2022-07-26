interface IKeyMap {
  [key: string]: string
}

export const EMOJI_ICON_MAP_CONFIG: IKeyMap = {
  '[大笑]': 'icon-a-1',
  '[开心]': 'icon-a-2',
  '[色]': 'icon-a-3',
  '[酷]': 'icon-a-4',
  '[奸笑]': 'icon-a-5',
  '[亲]': 'icon-a-6',
  '[伸舌头]': 'icon-a-7',
  '[眯眼]': 'icon-a-8',
  '[可爱]': 'icon-a-9',
  '[鬼脸]': 'icon-a-10',
  '[偷笑]': 'icon-a-11',
  '[喜悦]': 'icon-a-12',
  '[狂喜]': 'icon-a-13',
  '[惊讶]': 'icon-a-14',
  '[流泪]': 'icon-a-15',
  '[流汗]': 'icon-a-16',
  '[天使]': 'icon-a-17',
  '[笑哭]': 'icon-a-18',
  '[尴尬]': 'icon-a-19',
  '[惊恐]': 'icon-a-20',
  '[大哭]': 'icon-a-21',
  '[烦躁]': 'icon-a-22',
  '[恐怖]': 'icon-a-23',
  '[两眼冒星]': 'icon-a-24',
  '[害羞]': 'icon-a-25',
  '[睡着]': 'icon-a-26',
  '[冒星]': 'icon-a-27',
  '[口罩]': 'icon-a-28',
  '[OK]': 'icon-a-29',
  '[好吧]': 'icon-a-30',
  '[鄙视]': 'icon-a-31',
  '[难受]': 'icon-a-32',
  '[不屑]': 'icon-a-33',
  '[不舒服]': 'icon-a-34',
  '[愤怒]': 'icon-a-35',
  '[鬼怪]': 'icon-a-36',
  '[发怒]': 'icon-a-37',
  '[生气]': 'icon-a-38',
  '[不高兴]': 'icon-a-39',
  '[皱眉]': 'icon-a-40',
  '[心碎]': 'icon-a-41',
  '[心动]': 'icon-a-42',
  '[好的]': 'icon-a-43',
  '[低级]': 'icon-a-44',
  '[赞]': 'icon-a-45',
  '[鼓掌]': 'icon-a-46',
  '[给力]': 'icon-a-47',
  '[打你]': 'icon-a-48',
  '[阿弥陀佛]': 'icon-a-49',
  '[拜拜]': 'icon-a-50',
  '[第一]': 'icon-a-51',
  '[拳头]': 'icon-a-52',
  '[手掌]': 'icon-a-53',
  '[剪刀]': 'icon-a-54',
  '[招手]': 'icon-a-55',
  '[不要]': 'icon-a-56',
  '[举着]': 'icon-a-57',
  '[思考]': 'icon-a-58',
  '[猪头]': 'icon-a-59',
  '[不听]': 'icon-a-60',
  '[不看]': 'icon-a-61',
  '[不说]': 'icon-a-62',
  '[猴子]': 'icon-a-63',
  '[炸弹]': 'icon-a-64',
  '[睡觉]': 'icon-a-65',
  '[筋斗云]': 'icon-a-66',
  '[火箭]': 'icon-a-67',
  '[救护车]': 'icon-a-68',
  '[便便]': 'icon-a-70',
}

// TODO react-string-replace 的行为不是那么的好理解，比如像下面这个正则就一定要加 '()'，后面最好干掉自己实现
export const INPUT_EMOJI_SYMBOL_REG = new RegExp(
  '(' +
    Object.keys(EMOJI_ICON_MAP_CONFIG)
      .map((item) => {
        const left = `\\${item.slice(0, 1)}`
        const right = `\\${item.slice(-1)}`
        const mid = item.slice(1, -1)
        return `${left}${mid}${right}`
      })
      .join('|') +
    ')',
  'g'
)
