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
    statusBarHeight: 0, // 状态栏高度
    unreadSysMsgCount: 0, // 系统消息未读数
    disposer: null as any,
    
    // 国际化文本
    contactText: t('contactText'),
    validMsgText: t('validMsgText'),
    blacklistText: t('blacklistText'),
    teamMenuText: t('teamMenuText')
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
        // 监听系统消息未读数
        const disposer = autorun(() => {
          const unreadSysMsgCount = (store.sysMsgStore && store.sysMsgStore.getTotalUnreadMsgsCount && store.sysMsgStore.getTotalUnreadMsgsCount()) || 0;
          this.setData({ unreadSysMsgCount });
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





    handleValidMsgClick() {
      wx.navigateTo({
      url: '/pages/contacts/valid-list/index'
    });
    },

    handleBlacklistClick() {
      wx.navigateTo({
      url: '/pages/contacts/black-list/index'
    });
    },

    handleGroupContactClick() {
      wx.navigateTo({
      url: '/pages/contacts/team-list/index'
    });
    }
  }
});