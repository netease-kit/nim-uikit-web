Page({
  data: {
    
  },

  onLoad() {},

  onShow() {},

  // 处理返回事件
  onBack() {
    wx.navigateBack();
  },

  // 处理设置变化事件
  onSettingChange(event: any) {
    const { type, value } = event.detail;
    
    switch (type) {
      case 'enableV2CloudConversation':
        break;
      case 'language':
        // 可以在这里处理语言切换的全局逻辑
        break;
      default:
        break;
    }
  },

  // 处理退出登录事件
  onLogout() {
    // 清除用户数据并跳转到登录页面
    try {
      // 清除本地存储的用户信息
      wx.removeStorageSync('token');
      wx.removeStorageSync('userInfo');
      
      wx.showToast({
        title: '已退出登录',
        icon: 'success',
        duration: 1500
      });
      
      // 延迟跳转到登录页面
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/login/index'
        });
      }, 1500);
    } catch (error) {
      console.error('退出登录失败:', error);
      wx.showToast({
        title: '退出失败',
        icon: 'none'
      });
    }
  }
});