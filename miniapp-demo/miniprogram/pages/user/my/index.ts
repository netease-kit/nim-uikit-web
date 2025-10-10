Page({
  data: {
    
  },

  onLoad() {
    console.log('用户主页面加载');
  },

  onShow() {
    console.log('用户主页面显示');
  },

  // 处理导航到详情页面
  onUserNavigation(event: any) {
    console.log('导航到用户详情页面');
    wx.navigateTo({
      url: '/pages/user/my-detail/index'
    });
  },

  // 处理导航到设置页面
  onSettingNavigation(event: any) {
    console.log('导航到设置页面');
    wx.navigateTo({
      url: '/pages/user/setting/index'
    });
  },

  // 处理导航到关于页面
  onAboutNavigation(event: any) {
    console.log('导航到关于页面');
    wx.navigateTo({
      url: '/pages/user/about/index'
    });
  }
});