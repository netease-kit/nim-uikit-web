import { getLoginSmsCode, loginRegisterByCode, validateMobile, validateSmsCode } from '../utils/api'
import { t } from '../i18n/index'

Component({
  properties: {
    // 可以接收外部传入的属性
  },

  data: {
    mobile: '',
    smsCode: '',
    countdown: 0,
    isGettingCode: false,
    isLogging: false,
    mobileError: '',
    smsCodeError: '',
    loginError: ''
  },

  methods: {
    // 手机号输入
    onMobileInput(e: any) {
      const mobile = e.detail.value
      this.setData({
        mobile,
        mobileError: ''
      })
    },

    // 验证码输入
    onSmsCodeInput(e: any) {
      const smsCode = e.detail.value
      this.setData({
        smsCode,
        smsCodeError: ''
      })
    },

    // 获取验证码
    async getSmsCode() {
      const { mobile, isGettingCode, countdown } = this.data

      if (isGettingCode || countdown > 0) {
        return
      }

      if (!validateMobile(mobile)) {
        this.setData({
          mobileError: t('mobileErrorMsg')
        })
        return
      }

      this.setData({
        isGettingCode: true,
        mobileError: ''
      })

      try {
        await getLoginSmsCode({ mobile })
        
        // 开始倒计时
        this.startCountdown()
        
        wx.showToast({
          title: '验证码已发送',
          icon: 'success'
        })
      } catch (error: any) {
        console.error('获取验证码失败:', error)
        
        let errorMsg = t('smsCodeFailMsg')
        if (error.message && error.message.includes('网络')) {
          errorMsg = t('smsCodeNetworkErrorMsg')
        }
        
        wx.showToast({
          title: errorMsg,
          icon: 'none'
        })
      } finally {
        this.setData({
          isGettingCode: false
        })
      }
    },

    // 开始倒计时
    startCountdown() {
      let countdown = 60
      this.setData({ countdown })

      const timer = setInterval(() => {
        countdown--
        this.setData({ countdown })

        if (countdown <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    },

    // 登录
    async login() {
      const { mobile, smsCode, isLogging } = this.data

      if (isLogging) {
        return
      }

      const isMobileValid = mobile.trim() !== '' && validateMobile(mobile.trim())
      const isSmsValid = smsCode.trim() !== '' && validateSmsCode(smsCode.trim())

      // 验证手机号
      if (!isMobileValid || !isSmsValid) {
        this.setData({
          mobileError: isMobileValid ? '' : t('mobileErrorMsg'),
          smsCodeError: isSmsValid ? '' : t('smsErrorMsg')
        })
        return
      }

      this.setData({
        isLogging: true,
        mobileError: '',
        smsCodeError: '',
        loginError: ''
      })

      try {
        const result = await loginRegisterByCode({ mobile, smsCode })
        
        // 保存登录信息
        wx.setStorageSync('accessToken', result.accessToken)
        wx.setStorageSync('imAccid', result.imAccid)
        wx.setStorageSync('imToken', result.imToken)
        
        // 触发登录成功事件
        this.triggerEvent('loginSuccess', {
          accessToken: result.accessToken,
          imAccid: result.imAccid,
          imToken: result.imToken
        })

        // 调用IM登录
        this.performIMLogin(result.imAccid, result.imToken)

      } catch (error: any) {
        console.error('登录失败:', error)
        
        let errorMsg = t('loginFailMsg')
        if (error.message) {
          if (error.message.includes('网络')) {
            errorMsg = t('loginNetworkErrorMsg')
          } else if (error.message.includes('验证码') || error.message.includes('手机号')) {
            errorMsg = t('mobileOrSmsCodeErrorMsg')
          }
        }
        
        this.setData({
          loginError: errorMsg
        })

        wx.showToast({
          title: errorMsg,
          icon: 'none'
        })
      } finally {
        this.setData({
          isLogging: false
        })
      }
    },

    /**
     * 执行IM登录
     */
    performIMLogin(imAccid: string, imToken: string) {
      const app = getApp<IAppOption>();
      const nim = app.globalData.nim;
      
      if (!nim) {
        console.error('NIM实例未初始化');
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        });
        return;
      }

      wx.showLoading({
        title: '登录中...',
        mask: true
      });

      nim.V2NIMLoginService.login(imAccid, imToken).then(() => {
        wx.hideLoading();
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });
        
        console.log('IM登录成功');
        
        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          wx.reLaunch({
            url: '/pages/conversation/conversation-list/index'
          });
        }, 1500);
        
      }).catch((error: any) => {
        wx.hideLoading();
        console.error('IM登录失败:', error);
        
        // 清除本地存储
        wx.removeStorageSync('accessToken');
        wx.removeStorageSync('imAccid');
        wx.removeStorageSync('imToken');
        
        wx.showToast({
          title: 'IM登录失败，请重试',
          icon: 'none'
        });
      });
    }

  }
})