Page({
  data: {
    
  },

  onLoad() {},

  onShow() {},

  // 处理导航到详情页面
  onUserNavigation(event: any) {
    wx.navigateTo({
      url: '/pages/user/my-detail/index'
    });
  },

  // 处理导航到设置页面
  onSettingNavigation(event: any) {
    wx.navigateTo({
      url: '/pages/user/setting/index'
    });
  },

  // 处理导航到关于页面
  onAboutNavigation(event: any) {
    wx.navigateTo({
      url: '/pages/user/about/index'
    });
  }
});