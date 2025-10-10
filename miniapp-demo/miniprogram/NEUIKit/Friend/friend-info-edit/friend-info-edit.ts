import { t } from '../../utils/i18n'

Component({
  properties: {
    accountId: {
      type: String,
      value: ''
    }
  },

  data: {
    alias: '',
    inputLengthTips: '0/15',
    statusBarHeight: 0,
    // 国际化文本
    remarkText: t('remarkText'),
    friendEditPlaceholder: t('friendEditPlaceholder'),
    saveText: t('saveText')
  },

  lifetimes: {
    attached() {
      this.setStatusBarHeight()
      this.initData()
      
      // 初始化 nim 和 store 实例
      const app = getApp()
      ;(this as any).nimInstance = app.globalData.nim
      ;(this as any).storeInstance = app.globalData.store
    }
  },

  observers: {
    'accountId': function(accountId: string) {
      if (accountId) {
        this.loadFriendInfo(accountId)
      }
    }
  },

  methods: {
    setStatusBarHeight() {
      const systemInfo = wx.getSystemInfoSync()
      this.setData({
        statusBarHeight: systemInfo.statusBarHeight || 0
      })
    },

    initData() {
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      const accountId = (currentPage.options && currentPage.options.accountId) ? currentPage.options.accountId : this.data.accountId
      
      if (accountId) {
        this.loadFriendInfo(accountId)
      }
    },

    loadFriendInfo(accountId: string) {
      const store = (this as any).storeInstance
      
      if (!store) {
        console.error('Store实例未初始化')
        return
      }
      
      const friend = store.friendStore.friends.get(accountId)
      
      const alias = friend ? friend.alias || '' : ''
      this.setData({
        alias,
        inputLengthTips: `${alias ? alias.length : 0}/15`
      })
    },

    // 保存备注名称
    async handleSave() {
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      const accountId = (currentPage.options && currentPage.options.accountId) ? currentPage.options.accountId : null
      
      if (!accountId) {
        wx.showToast({
          title: '参数错误',
          icon: 'none'
        })
        return
      }
      
      let alias = this.data.alias
      
      // alias 为 null 和空字符串表示删除备注，在此对 alias 为 null 的转换成空字符串，否则 sdk 会报错
      if (alias === null) {
        alias = ''
      }
      
      // 不允许全是空格
      if (alias && !alias.trim()) {
        wx.showToast({
          title: t('aliasConfirmText'),
          icon: 'none'
        })
        return
      }
      
      try {
        const store = (this as any).storeInstance
        
        if (!store) {
          console.error('Store实例未初始化')
          wx.showToast({
            title: t('updateTeamFailedText'),
            icon: 'none'
          })
          return
        }
        
        await store.friendStore.setFriendInfoActive(accountId, {
          alias: alias
        })
        
        wx.showToast({
          title: t('updateTeamSuccessText'),
          icon: 'success'
        })
        
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
        
      } catch (error) {
        wx.showToast({
          title: t('updateTeamFailedText'),
          icon: 'none'
        })
      }
    },

    handleInput(e: any) {
      const value = e.detail.value
      this.setData({
        alias: value,
        inputLengthTips: `${value ? value.length : 0}/15`
      })
    }
  }
})