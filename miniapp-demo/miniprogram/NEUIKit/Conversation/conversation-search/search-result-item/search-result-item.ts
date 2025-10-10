Component({
  properties: {
    item: {
      type: Object,
      value: {}
    }
  },

  data: {
    isTeam: false,
    to: '',
    teamAvatar: '',
    teamName: ''
  },

  observers: {
    'item': function(item) {
      if (!item) return
      
      // 是否是群
      const isTeam = !!item.teamId
      
      // 对话方
      const to = item.teamId || item.accountId || ''
      
      // 群头像
      const teamAvatar = item.teamId ? item.avatar : ''
      
      // 群名
      const teamName = item.teamId ? item.name : ''
      
      this.setData({
        isTeam,
        to,
        teamAvatar,
        teamName
      })
    }
  },

  methods: {
    handleItemClick() {
      const { item, isTeam, to } = this.data

      console.log('item', item)
      
      if (!isTeam) {
        // 跳转到好友聊天
        const conversationId = `p2p|${to}`
        wx.navigateTo({
          url: `/pages/chat/index?conversationId=${conversationId}`
        })
      } else {
        // 跳转到群聊
        const conversationId = `team|${to}`
        wx.navigateTo({
          url: `/pages/chat/index?conversationId=${conversationId}`
        })
      }
    }
  }
})