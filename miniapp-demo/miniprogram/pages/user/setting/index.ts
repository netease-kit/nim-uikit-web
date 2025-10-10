Page({
  data: {
    
  },

  onLoad() {
    console.log('设置页面加载');
  },

  onShow() {
    console.log('设置页面显示');
  },

  // 处理返回事件
  onBack() {
    wx.navigateBack();
  },

  // 处理设置变化事件
  onSettingChange(event: any) {
    const { type, value } = event.detail;
    console.log('设置变化:', type, value);
    
    switch (type) {
      case 'enableV2CloudConversation':
        console.log('云端会话设置:', value);
        break;
      case 'language':
        console.log('语言设置:', value);
        // 可以在这里处理语言切换的全局逻辑
        break;
      default:
        console.log('未知设置类型:', type);
    }
  },

  // 处理退出登录事件
  onLogout() {
    console.log('用户退出登录');
    
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