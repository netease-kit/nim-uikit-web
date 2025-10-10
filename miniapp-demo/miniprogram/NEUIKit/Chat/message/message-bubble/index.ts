Component({
  properties: {
    msg: {
      type: Object,
      value: {}
    },
    bgVisible: {
      type: Boolean,
      value: true
    }
  },

  data: {
    showActionMenu: false,
    canRecall: false,
    menuPosition: {
      top: 0,
      left: 0
    }
  },

  observers: {
    'msg': function(msg: any) {
      if (msg && msg.isSelf !== undefined) {
        // 检查是否可以撤回（2分钟内）
        const now = Date.now()
        const msgTime = msg.time || 0
        const canRecall = msg.isSelf && (now - msgTime) < 2 * 60 * 1000
        
        this.setData({
          canRecall
        })
      }
    }
  },

  methods: {
    onLongPress(e: any) {
      const query = this.createSelectorQuery()
      query.select('.message-bubble-wrapper').boundingClientRect((rect: any) => {
        if (rect) {
          // 计算菜单位置：消息上方，水平居中
          const menuTop = rect.top - 80 // 菜单高度约70px，留10px间距
          const menuLeft = rect.left + rect.width / 2
          
          this.setData({
            showActionMenu: true,
            menuPosition: {
              top: Math.max(menuTop, 20), // 确保不超出屏幕顶部
              left: menuLeft
            }
          })
        }
      }).exec()
    },

    hideActionMenu() {
      this.setData({
        showActionMenu: false
      })
    },

    stopPropagation() {
      // 阻止事件冒泡
    },

    onResendMsg() {
      this.triggerEvent('resendMsg', { msg: this.properties.msg })
    },

    handleCopy() {
      const msg = this.properties.msg
      if (msg.messageType === 'text' && msg.text) {
        wx.setClipboardData({
          data: msg.text,
          success: () => {
            wx.showToast({
              title: '复制成功',
              icon: 'success'
            })
          }
        })
      }
      this.hideActionMenu()
    },

    handleReply() {
      this.triggerEvent('replyMsg', { msg: this.properties.msg })
      this.hideActionMenu()
    },

    handleForward() {
      this.triggerEvent('forwardMsg', { msg: this.properties.msg })
      this.hideActionMenu()
    },

    handleRecall() {
      wx.showModal({
        title: '撤回消息',
        content: '确定要撤回这条消息吗？',
        success: (res) => {
          if (res.confirm) {
            this.triggerEvent('recallMsg', { msg: this.properties.msg })
          }
        }
      })
      this.hideActionMenu()
    },

    handleDelete() {
      this.triggerEvent('deleteMsg', { msg: this.properties.msg })
      this.hideActionMenu()
    }
  }
})