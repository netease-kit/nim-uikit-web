Component({
  properties: {
    conversation: {
      type: Object,
      value: {}
    }
  },

  data: {
    showReadStatus: false,
    readStatusText: ''
  },

  observers: {
    'conversation': function(conversation) {
      this.updateReadStatus(conversation)
    }
  },

  methods: {
    updateReadStatus(conversation: any) {
      if (!conversation || !conversation.lastMessage) {
        this.setData({
          showReadStatus: false
        })
        return
      }

      const { lastMessage } = conversation
      
      // 只有群聊且是自己发送的消息才显示已读状态
      if (conversation.type === 'TEAM' && lastMessage.isSelf) {
        const readCount = lastMessage.readCount || 0
        const totalCount = conversation.memberCount || 0
        
        this.setData({
          showReadStatus: true,
          readStatusText: `${readCount}/${totalCount}已读`
        })
      } else {
        this.setData({
          showReadStatus: false
        })
      }
    }
  }
})