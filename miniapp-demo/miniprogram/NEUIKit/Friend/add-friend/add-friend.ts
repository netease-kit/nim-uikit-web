const { t } = require('../../utils/i18n');
const { autorun } = require('../../../libs/store');

interface V2NIMUser {
  accountId: string;
  name?: string;
  avatar?: string;
  [key: string]: any;
}

type Relation = 'stranger' | 'friend' | 'blacklist' | 'applying' | 'beApplied';

Component({
  properties: {
    statusBarHeight: {
      type: Number,
      value: 0
    }
  },

  data: {
    searchResState: 'beginSearch' as 'beginSearch' | 'searchEmpty' | 'searchResult',
    userInfo: null as V2NIMUser | null,
    relation: 'stranger' as Relation,
    searchText: '',
    statusBarHeight: 0,
    userInfoDisposer: null as any,
    relationDisposer: null as any,
    t,
    // 文本字段
    addFriendText: '',
    enterAccount: '',
    noExistUser: '',
    chatButtonText: '',
    addText: ''
  },

  lifetimes: {
    attached() {
      this.setStatusBarHeight()
      this.initData()
      
      // 初始化文本字段
      this.setData({
        addFriendText: t('addFriendText'),
        enterAccount: t('enterAccount'),
        noExistUser: t('noExistUser'),
        chatButtonText: t('chatButtonText'),
        addText: t('addText')
      })
      
      // 初始化 nim 和 store 实例
      const app = getApp()
      ;(this as any).nimInstance = app.globalData.nim
      ;(this as any).storeInstance = app.globalData.store
    },

    detached() {
      this.cleanup()
    }
  },

  methods: {
    setStatusBarHeight() {
      // 优先使用传入的statusBarHeight属性，如果没有则获取系统状态栏高度
      const statusBarHeight = this.properties.statusBarHeight || wx.getSystemInfoSync().statusBarHeight || 0
      this.setData({
        statusBarHeight
      })
    },

    initData() {
      // 初始化数据
    },

    cleanup() {
      // 清理资源
      if (this.data.userInfoDisposer) {
        this.data.userInfoDisposer()
      }
      if (this.data.relationDisposer) {
        this.data.relationDisposer()
      }
    },

    // 搜索好友
    async handleSearch(e: any) {
      const value = e.detail.value || this.data.searchText
      if (!value.trim()) return

      try {
        const store = (this as any).storeInstance
        
        if (!store) {
          console.error('Store实例未初始化')
          wx.showToast({
            title: t('searchFailText'),
            icon: 'none'
          })
          return
        }
        
        const user = await store.userStore.getUserActive(value)

        if (!user) {
          this.setData({
            searchResState: 'searchEmpty'
          })
        } else {
          const relation = store.uiStore.getRelation(user.accountId).relation
          this.setData({
            userInfo: user,
            relation,
            searchResState: 'searchResult'
          })
        }
      } catch (error) {
        this.setData({
          searchResState: 'searchEmpty'
        })
        wx.showToast({
          title: t('searchFailText'),
          icon: 'none'
        })
      }
    },

    // 添加好友
    async applyFriend() {
      const account = (this.data.userInfo && this.data.userInfo.accountId) ? this.data.userInfo.accountId : null
      if (!account) return

      try {
        // 从全局获取store实例
        const app = getApp()
        const store = app.globalData.store || (this as any).storeInstance
        
        if (!store) {
          console.error('Store实例未初始化')
          wx.showToast({
            title: t('applyFriendFailText'),
            icon: 'none'
          })
          return
        }

        if (!store.friendStore) {
          console.error('FriendStore未初始化')
          wx.showToast({
            title: t('applyFriendFailText'),
            icon: 'none'
          })
          return
        }
        
        // 获取V2NIMConst
        const { V2NIMConst } = require('../../../libs/NIM_MINIAPP_SDK.js')
        
        await store.friendStore.addFriendActive(account, {
          addMode: V2NIMConst.V2NIMFriendAddMode.V2NIM_FRIEND_MODE_TYPE_APPLY,
          postscript: ''
        })

        // 发送申请成功后解除黑名单
        if (store.relationStore && store.relationStore.removeUserFromBlockListActive) {
          await store.relationStore.removeUserFromBlockListActive(account)
        }

        wx.showToast({
          title: t('applyFriendSuccessText'),
          icon: 'success'
        })
      } catch (error) {
        console.error('添加好友失败:', error)
        wx.showToast({
          title: t('applyFriendFailText'),
          icon: 'none'
        })
      }
    },

    // 去聊天
    async gotoChat() {
      const to = (this.data.userInfo && this.data.userInfo.accountId) ? this.data.userInfo.accountId : null
      if (!to) return

      try {
        const store = (this as any).storeInstance
        const nim = (this as any).nimInstance
        
        if (!store) {
          console.error('Store实例未初始化')
          wx.showToast({
            title: t('gotoChatFailText'),
            icon: 'none'
          })
          return
        }
        
        if (!nim) {
          console.error('NIM实例未初始化')
          wx.showToast({
            title: t('gotoChatFailText'),
            icon: 'none'
          })
          return
        }
        
        const conversationId = nim.V2NIMConversationIdUtil.p2pConversationId(to)
        await store.uiStore.selectConversation(conversationId)

        wx.navigateTo({
          url: `/pages/chat/index/index?conversationId=${conversationId}`
        })
      } catch (error) {
        wx.showToast({
          title: t('gotoChatFailText'),
          icon: 'none'
        })
      }
    },

    // 输入框值变化
    onInputValueChange(e: any) {
      const value = e.detail.value
      this.setData({
        searchText: value
      })

      // 删除搜索内容,页面回到最原始状态，搜索结果都清空
      if (value === '') {
        this.setData({
          searchResState: 'beginSearch'
        })
      }
    }
  }
})