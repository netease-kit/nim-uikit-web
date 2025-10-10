// pages/login/index.ts
Page({
  data: {},

  onLoad() {
    console.log('登录页面加载')
  },

  onShow() {
    console.log('登录页面显示')
  },

  /**
   * 登录成功回调
   */
  onLoginSuccess(event: any) {
    const { detail } = event
    console.log('登录成功:', detail)
    
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