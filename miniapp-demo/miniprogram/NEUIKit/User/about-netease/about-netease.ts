import { t } from "../../utils/i18n";

Component({
  properties: {
    extClass: {
      type: String,
      value: ''
    },
    statusBarHeight: {
      type: Number,
      value: 0
    }
  },

  data: {
    statusBarHeight: 0, // 状态栏高度
    
    // 国际化文本
    aboutText: '关于',
    appText: t('appText'),
    uikitVersionText: t('uikitVersion'),
    imVersionText: t('IMVersion'),
    productIntroText: '产品介绍',
    
    // 版本信息
    uikitVersion: '10.0.0',
    imVersion: '10.9.30'
  },

  lifetimes: {
    attached() {
      this.setStatusBarHeight();
      this.loadVersionInfo();
    }
  },

  methods: {
    // 设置状态栏高度
    setStatusBarHeight() {
      try {
        const systemInfo = wx.getSystemInfoSync();
        this.setData({
          statusBarHeight: systemInfo.statusBarHeight || 0
        });
      } catch (error) {
        console.error('获取系统信息失败:', error);
        this.setData({
          statusBarHeight: 0
        });
      }
    },

    // 加载版本信息
    loadVersionInfo() {
      // 这里可以从配置或其他地方获取实际的版本信息
      try {
        // 模拟获取版本信息
        this.setData({
          uikitVersion: '10.0.0',
          imVersion: '10.9.30'
        });
      } catch (error) {
        console.error('加载版本信息失败:', error);
      }
    },

    // 产品介绍点击事件
    onProductIntroClick() {
      const productUrl = 'https://yunxin.163.com/im';
      
      try {
        // 复制网址到剪贴板
        wx.setClipboardData({
          data: productUrl,
          success: () => {
            // 显示提示信息
            wx.showModal({
              title: '提示',
              content: '已自动复制网址，请在手机浏览器里粘贴该网址进行访问',
              showCancel: false,
              confirmText: '知道了'
            });
          },
          fail: (error) => {
            console.error('复制网址失败:', error);
            wx.showToast({
              title: '复制失败',
              icon: 'none'
            });
          }
        });
      } catch (error) {
        console.error('产品介绍点击处理失败:', error);
        wx.showToast({
          title: '操作失败',
          icon: 'none'
        });
      }
    },

    // 返回上一页
    onBack() {
      this.triggerEvent('back', {});
    }
  }
});