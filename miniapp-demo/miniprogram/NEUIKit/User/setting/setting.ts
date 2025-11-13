import { t } from "../../utils/i18n";

Component({
  properties: {
    extClass: {
      type: String,
      value: ''
    }
  },

  data: {
    enableV2CloudConversation: false,
    switchToEnglishFlag: false,
    showLogoutModal: false,
    statusBarHeight: 0, // 状态栏高度
    
    // 国际化文本
    setText: t('setText'),
    enableV2CloudConversationText: t('enableV2CloudConversationText'),
    switchToEnglishText: t('SwitchToEnglishText'),
    logoutText: t('logoutText'),
    confirmText: t('okText'),
    cancelText: t('cancelText'),
    logoutConfirmText: '确定要退出登录吗？'
  },

  lifetimes: {
    attached() {
      // 获取系统信息，设置状态栏高度
      this.setStatusBarHeight();
      this.loadSettings();
    }
  },

  methods: {
    // 设置状态栏高度（包含导航栏高度）
    setStatusBarHeight() {
      try {
        const systemInfo = wx.getSystemInfoSync();
        const statusBarHeight = systemInfo.statusBarHeight || 44; // 默认44px
        // const navBarHeight = 48; // 导航栏高度48px
        const navBarHeight = 0; // 导航栏高度48px
        const totalHeight = statusBarHeight + navBarHeight;
        
        this.setData({
          statusBarHeight: totalHeight
        });
      } catch (error) {
        // console.error('获取系统信息失败:', error);
        // 设置默认值（状态栏44px + 导航栏48px）
        this.setData({
          statusBarHeight: 92
        });
      }
    },

    // 加载设置
    loadSettings() {
      try {
        const storedCloudConv = wx.getStorageSync('enableV2CloudConversation');
        const storedLanguage = wx.getStorageSync('switchToEnglishFlag');
        
        this.setData({
          enableV2CloudConversation: storedCloudConv === 'on',
          switchToEnglishFlag: storedLanguage === 'en'
        });
      } catch (error) {
        console.error('加载设置失败:', error);
      }
    },

    // 云端会话开关变化
    onChangeEnableV2CloudConversation(event: any) {      
      // 使用原生switch组件事件结构
      const checked = event.detail.value;
      
      try {
        wx.setStorageSync('enableV2CloudConversation', checked ? 'on' : 'off');
        this.setData({
          enableV2CloudConversation: checked
        });
        
        wx.showModal({
          title: '提示',
          content: '切换后杀进程重启应用后生效',
          showCancel: false,
          confirmText: '知道了'
        });
        
        // 通知父组件设置变化
        this.triggerEvent('settingChange', {
          type: 'enableV2CloudConversation',
          value: checked
        });
      } catch (error) {
        console.error('保存云端会话设置失败:', error);
        wx.showToast({
          title: '设置保存失败',
          icon: 'none'
        });
      }
    },

    // 英文开关变化
    onChangeSwitchToEnglishFlag(event: any) {      
      // 使用原生switch组件事件结构
      const checked = event.detail.value;
      
      try {
        wx.setStorageSync('switchToEnglishFlag', checked ? 'en' : 'zh');
        this.setData({
          switchToEnglishFlag: checked
        });
        
        wx.showModal({
          title: '提示',
          content: '切换后杀进程重启应用后生效',
          showCancel: false,
          confirmText: '知道了'
        });
        
        // 通知父组件语言变化
        this.triggerEvent('settingChange', {
          type: 'language',
          value: checked ? 'en' : 'zh'
        });
        
        // 延迟刷新页面以应用语言变化
        setTimeout(() => {
          this.triggerEvent('languageChanged', { language: checked ? 'en' : 'zh' });
        }, 1000);
      } catch (error) {
        console.error('保存语言设置失败:', error);
        wx.showToast({
          title: '设置保存失败',
          icon: 'none'
        });
      }
    },

    // 显示退出登录确认
    showLogoutConfirm() {
      this.setData({
        showLogoutModal: true
      });
    },

    // 确认退出登录
    handleLogout() {
      try {
        // 隐藏模态框
        this.setData({
          showLogoutModal: false
        });
        
        // 通知父组件退出登录
        this.triggerEvent('logout', {});
        
      } catch (error) {
        console.error('退出登录失败:', error);
        wx.showToast({
          title: '退出失败',
          icon: 'none'
        });
      }
    },

    // 取消退出登录
    cancelLogout() {
      this.setData({
        showLogoutModal: false
      });
    },

    // 返回上一页
    onBack() {
      this.triggerEvent('back', {});
    }
  }
});