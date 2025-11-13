// pages/chat/index/index.ts
Page({
  /**
   * 页面的初始数据
   */
  data: {
    theme: 'light',
    conversationId: '',
    teamMsgReceiptVisible: true,
    p2pMsgReceiptVisible: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options: any) {    
    // 从页面参数获取会话ID
    if (options.conversationId) {
      this.setData({
        conversationId: options.conversationId
      });
    }
    
    // 从页面参数获取其他配置
    if (options.teamMsgReceiptVisible !== undefined) {
      this.setData({
        teamMsgReceiptVisible: options.teamMsgReceiptVisible === 'true'
      });
    }
    
    if (options.p2pMsgReceiptVisible !== undefined) {
      this.setData({
        p2pMsgReceiptVisible: options.p2pMsgReceiptVisible === 'true'
      });
    }
    
    // 获取系统主题
    this.getSystemTheme();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    // 停止下拉刷新
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '聊天',
      path: `/pages/chat/index/index?conversationId=${this.data.conversationId}`
    };
  },

  /**
   * 获取系统主题
   */
  getSystemTheme() {
    try {
      const systemInfo = wx.getSystemInfoSync();
      if (systemInfo.theme) {
        this.setData({
          theme: systemInfo.theme
        });
      }
    } catch (error) {
      console.error('获取系统主题失败:', error);
    }
  },

  /**
   * 处理设置按钮点击
   */
  onSetting(event: any) {
    const { conversationType, to } = event.detail;
    
    if (conversationType === 'p2p') {
      // 跳转到点对点设置页面
      wx.navigateTo({
        url: `/pages/chat/p2p-setting/index?to=${to}`
      });
    } else if (conversationType === 'team') {
      // 跳转到群组设置页面
      wx.navigateTo({
        url: `/pages/chat/team-setting/index?teamId=${to}`
      });
    }
  },

  /**
   * 处理消息点击
   */
  onMessageClick(event: any) {
    const { message } = event.detail;
    
    // 可以在这里处理消息点击事件，比如显示消息详情
    // 或者跳转到消息已读详情页面
    if (message.type === 'text' && message.readReceiptInfo) {
      wx.navigateTo({
        url: `/pages/chat/message-read-info/index?messageId=${message.idServer}`
      });
    }
  },

  /**
   * 处理头像点击
   */
  onAvatarClick(event: any) {
    // const { from } = event.detail;
  }
});