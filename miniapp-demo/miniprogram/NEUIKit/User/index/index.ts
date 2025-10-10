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
    myUserInfo: null as any,
    disposer: null as (() => void) | null,
    statusBarHeight: 0, // 状态栏高度
    
    // 国际化文本
    setText: t('setText'),
    commsEaseText: t('commsEaseText')
  },

  lifetimes: {
    attached() {
      // 获取系统信息，设置状态栏高度
      this.setStatusBarHeight();
      this._setupAutorun();
    },

    detached() {
      this._cleanupAutorun();
    }
  },

  methods: {
    // 设置状态栏高度（包含导航栏高度）
    setStatusBarHeight() {
      try {
        const systemInfo = wx.getSystemInfoSync();
        const statusBarHeight = systemInfo.statusBarHeight || 44; // 默认44px
        const navBarHeight = 48; // 导航栏高度48px
        const totalHeight = statusBarHeight + navBarHeight;
        
        this.setData({
          statusBarHeight: totalHeight
        });
        
        console.log('状态栏高度:', statusBarHeight, 'px, 导航栏高度:', navBarHeight, 'px, 总高度:', totalHeight, 'px');
      } catch (error) {
        console.error('获取系统信息失败:', error);
        // 设置默认值（状态栏44px + 导航栏48px）
        this.setData({
          statusBarHeight: 92
        });
      }
    },

    _setupAutorun() {
      const app = getApp<IAppOption>();
      const { store } = app.globalData;

      const disposer = autorun(() => {
        const myUserInfo = (store && store.userStore && store.userStore.myUserInfo) || null;
        this.setData({
          myUserInfo
        });
      });

      this.setData({ disposer });
    },

    _cleanupAutorun() {
      const { disposer } = this.data;
      if (disposer) {
        disposer();
        this.setData({ disposer: null });
      }
    },

    gotoMyDetail() {
      // 触发事件让父组件处理导航
      this.triggerEvent('navigateToDetail', {});
    },

    gotoSetting() {
      console.log('Navigate to setting');
      // 触发事件让父组件处理导航
      this.triggerEvent('navigateToSetting', {});
    },

    gotoAbout() {
      console.log('Navigate to about');
      // 触发事件让父组件处理导航
      this.triggerEvent('navigateToAbout', {});
    }
  }
});