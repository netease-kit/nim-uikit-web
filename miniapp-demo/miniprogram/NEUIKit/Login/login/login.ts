// NEUIKit/Login/login/login.ts
import { t } from '../../utils/i18n'

Component({
  data: {
    // 页面状态：'welcome' | 'login'
    currentView: 'welcome',
    
    // 国际化文本
    appName: t('appName'),
    welcomeText: t('welcomeText')
  },

  methods: {
    /**
     * 显示登录表单
     */
    showLoginForm() {
      this.setData({
        currentView: 'login'
      })
    },

    /**
     * 登录成功回调
     */
    onLoginSuccess(event: any) {
      console.log('登录成功:', event.detail)
      // 触发父组件的登录成功事件
      this.triggerEvent('loginSuccess', event.detail)
    }
  }
})