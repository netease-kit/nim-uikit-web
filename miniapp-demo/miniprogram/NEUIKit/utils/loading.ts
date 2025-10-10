let isLoading = false;

export const loading = {
  show(text = '加载中...') {
    // 微信小程序环境
    if (typeof wx !== 'undefined' && wx.showLoading) {
      if (!isLoading) {
        wx.showLoading({
          title: text,
          mask: true // 防止触摸穿透
        });
        isLoading = true;
      }
      return;
    }
  },
  
  hide() {
    // 微信小程序环境
    if (typeof wx !== 'undefined' && wx.hideLoading) {
      if (isLoading) {
        wx.hideLoading();
        isLoading = false;
      }
      return;
    }
  }
};
