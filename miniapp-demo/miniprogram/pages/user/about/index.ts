Page({
  data: {
    statusBarHeight: 0 // 状态栏高度
  },

  onLoad() {
    // 获取系统信息，设置状态栏高度
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight || 0
    });
  },

  onShow() {},

  // 处理返回事件
  onBack() {
    wx.navigateBack();
  },

  // 处理关于信息项点击事件
  onAboutItemClick(event: any) {
    const { type, value } = event.detail;
    
    switch (type) {
      case 'version':
        break;
      case 'website':
        // 可以在这里处理网站链接的跳转
        if (value) {
          wx.setClipboardData({
            data: value,
            success: () => {
              wx.showToast({
                title: '链接已复制',
                icon: 'success'
              });
            }
          });
        }
        break;
      case 'contact':
        // 可以在这里处理联系方式的复制或跳转
        if (value) {
          wx.setClipboardData({
            data: value,
            success: () => {
              wx.showToast({
                title: '联系方式已复制',
                icon: 'success'
              });
            }
          });
        }
        break;
      default:
        break;
    }
  }
});