Page({
  data: {
    accountId: ''
  },

  onLoad(options: any) {
    const { accountId } = options
    if (accountId) {
      this.setData({
        accountId
      })
    }
  },

  onShow() {
    // 页面显示时的逻辑
  },

  onHide() {
    // 页面隐藏时的逻辑
  },

  onUnload() {
    // 页面卸载时的逻辑
  }
})