import { t } from "../../utils/i18n";
import { autorun } from "../../../libs/store";

Component({
  properties: {
    extClass: {
      type: String,
      value: ''
    }
  },

  data: {
    blacklist: [] as any[],
    statusBarHeight: 0, // 状态栏高度
    disposer: null as any,
    
    // 国际化文本
    blacklistText: t('blacklistText'),
    blacklistSubTitle: t('blacklistSubTitle'),
    noBlacklistText: t('blacklistEmptyText'),
    removeFromBlacklistText: t('removeBlacklist'),
    confirmText: t('confirmText'),
    cancelText: t('cancelText')
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
      
      if (store) {
        // 监听黑名单变化
        const disposer = autorun(() => {
          const blacklist = (store.relationStore && store.relationStore.blacklist) ? store.relationStore.blacklist : [];
          // 获取黑名单用户详细信息
          const blacklistWithDetails = blacklist.map((accountId: string) => {
            const user = (store.userStore && store.userStore.users && store.userStore.users.get) ? store.userStore.users.get(accountId) : null;
            const userInfo = user || { accountId };
            return {
              accountId,
              nick: userInfo.name || userInfo.nick,
              avatar: userInfo.avatar
            };
          });
          // 按昵称或账号排序
          const sortedBlacklist = blacklistWithDetails.sort((a: any, b: any) => {
            const nameA = (a.nick || a.accountId || '').toLowerCase();
            const nameB = (b.nick || b.accountId || '').toLowerCase();
            return nameA.localeCompare(nameB);
          });
          
          this.setData({ blacklist: sortedBlacklist });
        });
        
        this.setData({ disposer });
      }
    },

    detached() {
      // 清理监听器
      if (this.data.disposer) {
        this.data.disposer();
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



    goBack() {
      wx.navigateBack();
    },

    handleBlacklistItemClick(event: any) {
      const { item } = event.currentTarget.dataset;
      if (!item) return;
    },

    async handleRemoveFromBlacklist(event: any) {
      const { account } = event.currentTarget.dataset;
      if (!account) return;
      
      try {
        const store = (this as any).storeInstance;
        if (!store) {
          console.error('store实例不存在');
          return;
        }

        // 显示确认对话框
        const result = await new Promise((resolve) => {
          wx.showModal({
            title: '确认操作',
            content: '确定要将此用户移出黑名单吗？',
            success: (res) => resolve(res.confirm),
            fail: () => resolve(false)
          });
        });
        
        if (!result) return;
        
        // 调用移出黑名单API
        await store && store.relationStore && store.relationStore.removeUserFromBlockListActive(account);
        
        wx.showToast({
          title: '已移出黑名单',
          icon: 'success'
        });
        
      } catch (error) {
        console.error('移出黑名单失败:', error);
        wx.showToast({
          title: '操作失败',
          icon: 'error'
        });
      }
    }
  }
});