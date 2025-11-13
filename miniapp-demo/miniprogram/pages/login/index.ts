// pages/login/index.ts
Page({
  data: {},

  onLoad() {},

  onShow() {},

  /**
   * 登录成功回调
   */
  onLoginSuccess(event: any) {
    const { detail } = event
    
    // 存储登录信息
    if (detail.token) {
      wx.setStorageSync('token', detail.token)
    }
    if (detail.userInfo) {
      wx.setStorageSync('userInfo', detail.userInfo)
    }
    
    // 跳转到主页面
    wx.reLaunch({
      url: '/pages/conversation/conversation-list/index'
    })
  }
})