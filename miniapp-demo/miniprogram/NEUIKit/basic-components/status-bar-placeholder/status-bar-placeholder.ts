// NEUIKit/basic-components/status-bar-placeholder/status-bar-placeholder.ts
Component({
  properties: {
    backgroundColor: {
      type: String,
      value: '#ffffff'
    }
  },

  data: {
    statusBarHeight: 0
  },

  lifetimes: {
    attached() {
      this.setStatusBarHeight()
    }
  },

  methods: {
    setStatusBarHeight() {
      try {
        const systemInfo = wx.getSystemInfoSync()
        this.setData({
          statusBarHeight: systemInfo.statusBarHeight || 0
        })
      } catch (error) {
        console.error('获取系统信息失败:', error)
        this.setData({
          statusBarHeight: 0
        })
      }
    }
  }
})