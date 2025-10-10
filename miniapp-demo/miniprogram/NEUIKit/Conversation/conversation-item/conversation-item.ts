Component({
  properties: {
    conversation: {
      type: Object,
      value: {}
    },
    showMoreActions: {
      type: Boolean,
      value: false
    }
  },

  data: {
    to: '',
    teamAvatar: '',
    sessionName: '',
    date: '',
    unread: 0,
    isMute: false,
    beMentioned: false,
    showSessionUnread: false,
    moreActions: [
      {
        type: 'stickyToTop',
        name: '置顶',
        class: 'stick-top'
      },
      {
        type: 'delete',
        name: '删除',
        class: 'delete'
      }
    ],
    touchStartX: 0,
    touchStartY: 0
  },

  observers: {
    'conversation': function(conversation) {
      this.processConversation(conversation)
    },
  },

  lifetimes: {
    attached() {
      this.processConversation(this.data.conversation)
    }
  },

  methods: {
    processConversation(conversation: any) {
      if (!conversation) return
      
      const to = this.parseConversationTargetId(conversation.conversationId)
      const sessionName = this.getSessionName(conversation)
      const date = this.formatDate((conversation.lastMessage && conversation.lastMessage.messageRefer && conversation.lastMessage.messageRefer.createTime) ? conversation.lastMessage.messageRefer.createTime : 0)
      const unread = conversation.unreadCount || 0
      const isMute = conversation.mute || false
      const beMentioned = conversation.beMentioned || false
            
      // 更新置顶按钮文本
      const moreActions = this.data.moreActions.map(action => {
        if (action.type === 'stickyToTop') {
          return {
            ...action,
            name: conversation.stickTop ? '取消\n置顶' : '置顶'
          }
        }
        return action
      })
      
      this.setData({
        to,
        teamAvatar: conversation.avatar || '',
        sessionName,
        date,
        unread,
        isMute,
        beMentioned,
        moreActions,
        showSessionUnread: this.shouldShowSessionUnread(conversation)
      })
    },

    parseConversationTargetId(conversationId: string) {
      // 解析会话目标ID
      return conversationId.split('|')[2] || ''
    },

    getSessionName(conversation: any) {
      if (conversation.type === 'P2P') {
        return conversation.name || conversation.conversationId
      } else {
        return conversation.name || '群聊'
      }
    },

    formatDate(timestamp: number) {
      // 使用统一的时间格式化函数，避免toLocaleTimeString等可能导致英文显示的API
      const { formatConversationTime } = require('../../utils/date');
      return formatConversationTime(timestamp);
    },

    formatTime(date: Date) {
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    },

    formatDateShort(date: Date) {
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      return `${month}-${day}`
    },

    shouldShowSessionUnread(conversation: any) {
      // 判断是否显示已读未读状态
      return conversation.type === 'TEAM' && (conversation.lastMessage && conversation.lastMessage.isSelf)
    },

    handleTouchStart(e: any) {
      const touch = e.touches[0]
      this.setData({
        touchStartX: touch.clientX,
        touchStartY: touch.clientY
      })
    },

    handleTouchMove(e: any) {
      const touch = e.touches[0]
      const deltaX = touch.clientX - this.data.touchStartX
      const deltaY = touch.clientY - this.data.touchStartY
      
      // 判断是否为水平滑动手势（左滑或右滑）
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX < -50) {
          // 左滑手势
          this.triggerEvent('leftSlide', {
            conversationId: this.data.conversation.conversationId
          })
        } else if (deltaX > 50) {
          // 右滑手势
          this.triggerEvent('leftSlide', {
            conversationId: ''
          })
        }
      }
    },

    handleConversationItemClick() {
      if (this.data.showMoreActions) {
        // 如果显示操作菜单，点击隐藏
        this.triggerEvent('leftSlide', {
          conversationId: ''
        })
      } else {
        // 正常点击进入聊天
        this.triggerEvent('click', {
          conversation: this.data.conversation
        })
      }
    },

    handleActionClick(e: any) {
      const { type } = e.currentTarget.dataset
      
      switch (type) {
        case 'stickyToTop':
          this.triggerEvent('stickyToTop', {
            conversation: this.data.conversation,
            stickTop: !this.data.conversation.stickTop
          })
          break
        case 'delete':
          this.triggerEvent('delete', {
            conversation: this.data.conversation
          })
          break
      }
    }
  }
})