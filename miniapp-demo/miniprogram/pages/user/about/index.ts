Page({
  data: {
    statusBarHeight: 0 // 状态栏高度
  },

  onLoad() {
    console.log('关于页面加载');
    
    // 获取系统信息，设置状态栏高度
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight || 0
    });
  },

  onShow() {
    console.log('关于页面显示');
  },

  // 处理返回事件
  onBack() {
    wx.navigateBack();
  },

  // 处理关于信息项点击事件
  onAboutItemClick(event: any) {
    const { type, value } = event.detail;
    console.log('关于信息项点击:', type, value);
    
    switch (type) {
      case 'version':
        console.log('版本信息:', value);
        break;
      case 'website':
        console.log('官网链接:', value);
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
        console.log('联系方式:', value);
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
        console.log('未知关于信息类型:', type);
    }
  }
});