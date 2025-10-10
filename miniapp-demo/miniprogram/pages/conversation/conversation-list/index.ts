Page({
  data: {},

  onLoad() {
    console.log('会话列表页面加载');
  },

  onShow() {
    console.log('会话列表页面显示');
  },

  onHide() {
    console.log('会话列表页面隐藏');
  },

  onUnload() {
    console.log('会话列表页面卸载');
  },

  // 处理会话点击事件
  onSessionClick(e: any) {
    const { conversation } = e.detail;
    
    if (!conversation || !conversation.conversationId) {
      console.warn('会话信息不完整');
      return;
    }
    
    // 跳转到聊天详情页面
    wx.navigateTo({
      url: `/pages/chat/index/index?conversationId=${conversation.conversationId}&to=${conversation.to || ''}`
    }).catch((error) => {
      console.error('跳转聊天页面失败:', error);
      wx.showToast({
        title: '跳转失败',
        icon: 'none'
      });
    });
  }
});