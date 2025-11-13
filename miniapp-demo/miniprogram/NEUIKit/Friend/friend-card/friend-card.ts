import { t } from '../../utils/i18n'
import { autorun } from '../../../libs/store'

Component({
  properties: {
    accountId: {
      type: String,
      value: ''
    }
  },

  data: {
    statusBarHeight: 0, // 状态栏高度
    userInfo: null as any ,
    relation: 'stranger' as any,
    isInBlacklist: false,
    alias: '',
    userInfoDisposer: null as any,
    relationDisposer: null as any,
    aliasDisposer: null as any,
    
    // 国际化文本
    friendCardText: t('friendCardText'),
    addBlacklistText: t('addBlacklist'),
    addFriendText: t('addFriendText'),
    remarkText: t('remarkText'),
    genderText: t('genderText'),
    unknowText: t('unknow'),
    manText: t('man'),
    womanText: t('woman'),
    birthText: t('birthText'),
    mobileText: t('mobile'),
    emailText: t('email'),
    signText: t('sign'),
    chatWithFriendText: t('chatWithFriendText'),
    deleteFriendText: t('deleteFriendText'),
    deleteFriendConfirmText: t('deleteFriendConfirmText'),
    deleteFriendSuccessText: t('deleteFriendSuccessText'),
    deleteFriendFailText: t('deleteFriendFailText'),
    setBlackFailText: t('setBlackFailText'),
    removeBlackFailText: t('removeBlackFailText'),
    applyFriendFailText: t('applyFriendFailText'),
    applyFriendSuccessText: t('applyFriendSuccessText'),
    gotoChatFailText: t('gotoChatFailText')
  },

  lifetimes: {
    attached() {
      this.setStatusBarHeight();
      
      // 初始化nim和store实例
      const app = getApp() as any;
      const { nim, store } = app.globalData;
      
      // 将nim、store对象存储为不需要监听变化的实例属性
      (this as any).nimInstance = nim;
      (this as any).storeInstance = store;
      
      this.initData()
    },

    detached() {
      this.cleanup()
    }
  },

  observers: {
    'accountId': function(accountId: string) {
      if (accountId) {
        this.loadUserInfo(accountId)
      }
    }
  },

  methods: {
    setStatusBarHeight() {
      const systemInfo = wx.getSystemInfoSync();
      this.setData({
        statusBarHeight: systemInfo.statusBarHeight || 0
      });
    },

    initData() {
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      const accountId = (currentPage.options && currentPage.options.accountId) ? currentPage.options.accountId : this.data.accountId
      
      if (accountId) {
        this.loadUserInfo(accountId)
      }
    },

    async loadUserInfo(accountId: string) {
      try {
        const store = (this as any).storeInstance
        
        if (!store) {
          console.error('Store实例未初始化')
          return
        }
        
        // 获取用户信息
        const userInfo = await store.userStore.getUserForceActive(accountId)
        
        // 获取关系信息
        const relationInfo = store.uiStore.getRelation(accountId)
        
        // 获取好友别名
        const friend = store.friendStore.friends.get(accountId)
        const alias = friend ? friend.alias : ''
        
        this.setData({
          userInfo,
          relation: relationInfo.relation,
          isInBlacklist: relationInfo.isInBlacklist,
          alias
        })
        
        // 监听数据变化
        this.setupWatchers(accountId)
        
      } catch (error) {
        console.error('加载用户信息失败:', error)
      }
    },

    setupWatchers(accountId: string) {
      const store = (this as any).storeInstance
      
      if (!store) {
        console.error('Store实例未初始化')
        return
      }
      
      // 监听用户信息变化
      const userInfoDisposer = autorun(() => {
        const userInfo = store.uiStore.getFriendWithUserNameCard(accountId)
        if (userInfo) {
          this.setData({ userInfo })
        }
      })
      
      // 监听关系变化
      const relationDisposer = autorun(() => {
        const relationInfo = store.uiStore.getRelation(accountId)
        this.setData({
          relation: relationInfo.relation,
          isInBlacklist: relationInfo.isInBlacklist
        })
      })
      
      // 监听备注名变化
      const aliasDisposer = autorun(() => {
        const friend = store.friendStore.friends.get(accountId)
        const alias = friend ? friend.alias : ''
        this.setData({ alias })
      })
      
      this.setData({
        userInfoDisposer,
        relationDisposer,
        aliasDisposer
      })
    },

    cleanup() {
      if (this.data.userInfoDisposer) {
        this.data.userInfoDisposer()
      }
      if (this.data.relationDisposer) {
        this.data.relationDisposer()
      }
      if (this.data.aliasDisposer) {
        this.data.aliasDisposer()
      }
    },

    // 点击别名编辑
    handleAliasClick() {
      const accountId = (this.data.userInfo && this.data.userInfo.accountId) ? this.data.userInfo.accountId : null
      if (accountId) {
        wx.navigateTo({
          url: `/pages/friend/friend-info-edit/index?accountId=${accountId}`
        })
      }
    },

    // 黑名单开关变化处理
    handleSwitchChange(event: any) {      
      // 微信小程序原生switch组件：event.detail.value 表示开关的当前状态
      // true = 开关打开，false = 开关关闭
      const switchValue = event.detail.value
      
      // 对于黑名单功能：开关打开 = 添加黑名单，开关关闭 = 移除黑名单
      const shouldAddToBlacklist = switchValue
      
      // 先更新UI状态
      this.setData({
        isInBlacklist: shouldAddToBlacklist
      })

      // 获取store实例
      const app = getApp() as any
      const store = app.globalData.store
      
      if (!store) {
        console.error('Store实例未找到')
        wx.showToast({
          title: '系统错误',
          icon: 'none'
        })
        // 恢复UI状态
        this.setData({
          isInBlacklist: !shouldAddToBlacklist
        })
        return
      }

      // 执行黑名单操作
      const accountId = this.data.accountId

      if (shouldAddToBlacklist) {
        // 添加到黑名单
        store.relationStore.addUserToBlockListActive(accountId)
          .then(() => {
            wx.showToast({
              title: '已添加到黑名单',
              icon: 'success'
            })
          })
          .catch((error: any) => {
            // console.error('添加黑名单失败:', error)
            wx.showToast({
              title: this.data.setBlackFailText || '添加黑名单失败',
              icon: 'none'
            })
            // 恢复UI状态
            this.setData({
              isInBlacklist: false
            })
          })
      } else {
        // 从黑名单移除
        store.relationStore.removeUserFromBlockListActive(accountId)
          .then(() => {
            wx.showToast({
              title: '已从黑名单移除',
              icon: 'success'
            })
          })
          .catch((error: any) => {
            // console.error('移除黑名单失败:', error)
            wx.showToast({
              title: this.data.removeBlackFailText || '移除黑名单失败',
              icon: 'none'
            })
            // 恢复UI状态
            this.setData({
              isInBlacklist: true
            })
          })
      }
    },

    // 删除好友
    deleteFriend() {
      const accountId = (this.data.userInfo && this.data.userInfo.accountId) ? this.data.userInfo.accountId : null
      const store = (this as any).storeInstance
      
      if (!store) {
        console.error('Store实例未初始化')
        wx.showToast({
          title: this.data.deleteFriendFailText,
          icon: 'none'
        })
        return
      }
      
      const appellation = store.uiStore.getAppellation({ account: accountId })
      
      wx.showModal({
        title: this.data.deleteFriendText,
        content: `${this.data.deleteFriendConfirmText}"${appellation}"?`,
        success: async (res) => {
          if (res.confirm && accountId) {
            try {
              await store.friendStore.deleteFriendActive(accountId)
              wx.showToast({
                title: this.data.deleteFriendSuccessText,
                icon: 'success'
              })
            } catch (error) {
              wx.showToast({
                title: this.data.deleteFriendFailText,
                icon: 'none'
              })
            }
          }
        }
      })
    },

    // 添加好友
    async addFriend() {
      const accountId = (this.data.userInfo && this.data.userInfo.accountId) ? this.data.userInfo.accountId : null
      if (!accountId) return
      
      try {
        const nim = (this as any).nimInstance
        const store = (this as any).storeInstance
        
        if (!nim) {
          console.error('NIM实例未初始化')
          wx.showToast({
            title: this.data.applyFriendFailText,
            icon: 'none'
          })
          return
        }
        
        if (!store) {
          console.error('Store实例未初始化')
          wx.showToast({
            title: this.data.applyFriendFailText,
            icon: 'none'
          })
          return
        }
        
        await store.friendStore.addFriendActive(accountId, {
          addMode: V2NIMConst.V2NIMFriendAddMode.V2NIM_FRIEND_MODE_TYPE_APPLY,
          postscript: ''
        })
        
        // 发送申请成功后解除黑名单
        await store.relationStore.removeUserFromBlockListActive(accountId)
        
        wx.showToast({
          title: this.data.applyFriendSuccessText,
          icon: 'success'
        })
        
      } catch (error) {
        wx.showToast({
          title: this.data.applyFriendFailText,
          icon: 'none'
        })
      }
    },

    // 去聊天
    async gotoChat() {
      const accountId = (this.data.userInfo && this.data.userInfo.accountId) ? this.data.userInfo.accountId : null
      if (!accountId) return
      
      try {
        const store = (this as any).storeInstance
        const nim = (this as any).nimInstance
        
        if (!store) {
          console.error('Store实例未初始化')
          wx.showToast({
            title: this.data.gotoChatFailText,
            icon: 'none'
          })
          return
        }
        
        if (!nim) {
          console.error('NIM实例未初始化')
          wx.showToast({
            title: this.data.gotoChatFailText,
            icon: 'none'
          })
          return
        }
        
        const conversationId = nim.V2NIMConversationIdUtil.p2pConversationId(accountId)
        await store.uiStore.selectConversation(conversationId)
        
        wx.navigateTo({
          url: `/pages/chat/index/index?conversationId=${conversationId}`
        })
        
      } catch (error) {
        console.error('跳转聊天页面失败:', error)
        wx.showToast({
          title: this.data.gotoChatFailText,
          icon: 'none'
        })
      }
    }
  }
})