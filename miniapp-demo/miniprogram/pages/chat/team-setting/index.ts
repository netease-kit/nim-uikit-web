Page({
  data: {
    theme: 'light',
    teamId: '',
    conversationId: ''
  },

  onLoad(options: any) {
    console.log('TeamSettingPage onLoad options:', options);
    
    // 从参数中获取teamId
    if (options.teamId) {
      const teamId = options.teamId;
      
      // 生成会话ID
      const app = getApp<IAppOption>();
      const { nim } = app.globalData;
      
      if (nim) {
        const conversationId = nim.V2NIMConversationIdUtil.teamConversationId(teamId);
        
        this.setData({
          teamId,
          conversationId
        });
      } else {
        console.error('NIM实例未初始化');
        wx.showToast({
          title: '初始化失败',
          icon: 'error'
        });
      }
    } else {
      console.error('缺少teamId参数');
      wx.showToast({
        title: '参数错误',
        icon: 'error'
      });
      
      // 返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  onReady() {
    // 页面初次渲染完成
  },

  onShow() {
    // 页面显示/切入前台时触发
  },

  onHide() {
    // 页面隐藏/切入后台时触发
  },

  onUnload() {
    // 页面卸载时触发
  },

  onPullDownRefresh() {
    // 用户下拉刷新时触发
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    // 页面上拉触底时触发
  },

  onShareAppMessage() {
    // 用户点击右上角分享时触发
    return {
      title: '群聊设置',
      path: '/pages/chat/team-setting/index'
    };
  },

  /**
   * 获取系统主题
   */
  getSystemTheme() {
    try {
      const systemInfo = wx.getSystemInfoSync();
      const theme = systemInfo.theme || 'light';
      this.setData({ theme });
    } catch (error) {
      console.error('获取系统主题失败:', error);
    }
  },

  handleInfoClick() {
    // 跳转到群信息编辑页面
    wx.navigateTo({
      url: `/pages/team-info-edit/index?teamId=${this.data.teamId}`
    })
  }
});