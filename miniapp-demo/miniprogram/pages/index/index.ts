// index.ts
// 获取应用实例
const app = getApp<IAppOption>()

Component({
  data: {
    username: '',
    password: '',
    canLogin: false,
    isLoading: false
  },
  
  methods: {
    // 用户名输入处理
    onUsernameInput(e: any) {
      const username = e.detail.value
      this.setData({
        username
      })
      this.checkCanLogin()
    },
    
    // 密码输入处理
    onPasswordInput(e: any) {
      const password = e.detail.value
      this.setData({
        password
      })
      this.checkCanLogin()
    },
    
    // 检查是否可以登录
    checkCanLogin() {
      const { username, password } = this.data
      const canLogin = username.trim().length > 0 && password.trim().length > 0
      this.setData({
        canLogin
      })
    },
    
    // 处理登录
    async handleLogin() {
      if (!this.data.canLogin || this.data.isLoading) {
        return
      }
      
      const { username, password } = this.data
      
      this.setData({
        isLoading: true
      })
      
      try {
        // 这里添加实际的登录逻辑
        // 例如调用登录API
        wx.showLoading({
          title: '登录中...'
        })
        
        // 模拟登录请求
        await this.loginRequest(username, password)
        
        wx.hideLoading()
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })
        
        // 登录成功后跳转到主页面
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/chat/chat' // 根据实际的主页面路径调整
          })
        }, 1500)
        
      } catch (error) {
        wx.hideLoading()
        wx.showToast({
          title: '登录失败',
          icon: 'error'
        })
        console.error('登录失败:', error)
      } finally {
        this.setData({
          isLoading: false
        })
      }
    },
    
    // 登录请求方法
    loginRequest(username: string, password: string): Promise<any> {
      return new Promise((resolve, reject) => {
        // 这里实现实际的登录逻辑
        // 例如调用后端API
        wx.request({
          url: 'https://your-api-domain.com/login', // 替换为实际的登录API
          method: 'POST',
          data: {
            username,
            password
          },
          success: (res: any) => {
            if (res.statusCode === 200 && res.data) {
              // 保存登录信息
              wx.setStorageSync('userToken', res.data.token)
              wx.setStorageSync('userInfo', res.data.userInfo)
              resolve(res.data)
            } else {
              reject(new Error(res.data.message || '登录失败'))
            }
          },
          fail: (error) => {
            reject(error)
          }
        })
      })
    },
    
    // 忘记密码
    handleForgotPassword() {
      wx.showToast({
        title: '功能开发中',
        icon: 'none'
      })
      // 可以跳转到忘记密码页面
      // wx.navigateTo({
      //   url: '/pages/forgot-password/forgot-password'
      // })
    },
    
    // 注册账号
    handleRegister() {
      wx.showToast({
        title: '功能开发中',
        icon: 'none'
      })
      // 可以跳转到注册页面
      // wx.navigateTo({
      //   url: '/pages/register/register'
      // })
    }
  }
})
