import { emojiMap, EMOJI_ICON_MAP_CONFIG } from '../../../utils/emoji'
import { culculateMatrix } from '../../../utils/matrix'

Component({
  data: {
    emojiMatrix: [] as string[][],
    emojiIconMap: EMOJI_ICON_MAP_CONFIG
  },

  lifetimes: {
    attached() {
      this.initEmojiMatrix()
    }
  },

  methods: {
    initEmojiMatrix() {
      const emojiList = Object.keys(emojiMap)
      const matrix = culculateMatrix(emojiList, 7)
      this.setData({
        emojiMatrix: matrix
      })
    },

    onEmojiClick(e: any) {
      const emoji = e.currentTarget.dataset.emoji
      if (emoji) {
        this.triggerEvent('emojiClick', { emoji })
      }
    },

    onDeleteClick() {
      this.triggerEvent('deleteClick')
    },

    onSendClick() {
      this.triggerEvent('sendClick')
    }
  }
})