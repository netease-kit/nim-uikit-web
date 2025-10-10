import { EMOJI_ICON_MAP_CONFIG } from '../../../utils/emoji'

interface Match {
  type: 'link' | 'emoji' | 'text' | 'Ait'
  value: string
  key: string
}

Component({
  properties: {
    msg: {
      type: Object,
      value: {}
    },
    fontSize: {
      type: Number,
      value: 16
    }
  },

  data: {
    textArr: [] as Match[],
    emojiIconMap: EMOJI_ICON_MAP_CONFIG
  },

  observers: {
    'msg, fontSize': function(msg: any) {
      if (msg) {
        const textArr = this.parseText(msg.text || '', msg.serverExtension)
        this.setData({
          textArr
        })
      }
    }
  },

  methods: {
    parseText(text: string, ext?: string): Match[] {
      if (!text) return []
      
      const regexLink = /(https?:\/\/\S+)/gi
      const emojiRegExp = this.createEmojiRegExp()
      const yxAitMsg = ext ? JSON.parse(ext).yxAitMsg : null
      
      // 处理表情符号 - 使用更精确的替换逻辑
      let result = this.stringReplace([text], emojiRegExp, (item: string) => {
        return {
          type: 'emoji',
          value: item
        }
      })
      
      // 处理链接
      result = this.stringReplace(result, regexLink, (item: string) => {
        return {
          type: 'link',
          value: item
        }
      })
      
      // 处理@消息
      if (yxAitMsg) {
        Object.keys(yxAitMsg) && Object.keys(yxAitMsg).forEach((key) => {
          const item = yxAitMsg[key]
          result = this.stringReplace(result, item.text, (item: string) => {
            return {
              type: 'Ait',
              value: item
            }
          })
        })
      }
      
      // 处理普通文本
      const finalResult = result.map((item: any) => {
        if (typeof item === 'string') {
          return {
            type: 'text',
            value: item
          }
        } else {
          return item
        }
      })
      
      // 过滤空字符串
      const filteredResult = finalResult.filter((item: any) => {
        return item.value && item.value.trim() !== ''
      })
      
      return filteredResult.map((item: any, index: number) => {
        return {
          ...item,
          key: index + item.type
        }
      })
    },

    createEmojiRegExp() {
      const emojiKeys = Object.keys(EMOJI_ICON_MAP_CONFIG)
      const escapedKeys = emojiKeys.map(key => 
        key.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
      )
      return new RegExp('(' + escapedKeys.join('|') + ')', 'g')
    },

    stringReplace(source: any, match: RegExp | string, fn: Function) {
      if (Array.isArray(source)) {
        return source.reduce((result, item) => {
          if (typeof item === 'string') {
            return result.concat(this.replaceString(item, match, fn))
          } else {
            return result.concat(item)
          }
        }, [])
      } else {
        return this.replaceString(source, match, fn)
      }
    },

    replaceString(str: string, match: RegExp | string, fn: Function) {
      if (typeof match === 'string') {
        const parts = str.split(match)
        const result = []
        for (let i = 0; i < parts.length; i++) {
          if (parts[i] && parts[i].trim() !== '') {
            result.push(parts[i])
          }
          if (i < parts.length - 1) {
            result.push(fn(match))
          }
        }
        return result
      } else {
        // 使用正则表达式进行更精确的匹配和替换
        const result = []
        let lastIndex = 0
        let match_result
        
        // 重置正则表达式的lastIndex
        match.lastIndex = 0
        
        while ((match_result = match.exec(str)) !== null) {
          // 添加匹配前的文本
          if (match_result.index > lastIndex) {
            const beforeText = str.substring(lastIndex, match_result.index)
            if (beforeText.trim() !== '') {
              result.push(beforeText)
            }
          }
          
          // 添加匹配的内容（转换为对象）
          result.push(fn(match_result[0]))
          
          lastIndex = match_result.index + match_result[0].length
          
          // 防止无限循环
          if (match_result.index === match.lastIndex) {
            match.lastIndex++
          }
        }
        
        // 添加最后剩余的文本
        if (lastIndex < str.length) {
          const remainingText = str.substring(lastIndex)
          if (remainingText.trim() !== '') {
            result.push(remainingText)
          }
        }
        
        return result
      }
    },

    onLinkTap(e: any) {
      const url = e.currentTarget.dataset.url
      if (url) {
        wx.setClipboardData({
          data: url,
          success: () => {
            wx.showToast({
              title: '链接已复制',
              icon: 'success'
            })
          }
        })
      }
    }
  }
})