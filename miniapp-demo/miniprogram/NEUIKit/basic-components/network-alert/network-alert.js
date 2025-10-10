Component({
  properties: {
    // 连接状态
    connectStatus: {
      type: Number,
      value: 1, // 1: 已连接, 2: 连接中, 3: 已断开
      observer: 'onConnectStatusChange'
    },
    // 自定义文本
    customText: {
      type: String,
      value: ''
    },
    // 是否固定在顶部
    fixed: {
      type: Boolean,
      value: false
    },
    // 是否显示阴影
    showShadow: {
      type: Boolean,
      value: false
    },
    // 自定义样式类
    customClass: {
      type: String,
      value: ''
    },
    // 自定义样式
    customStyle: {
      type: String,
      value: ''
    },
    // 语言设置
    language: {
      type: String,
      value: 'zh-CN'
    }
  },

  data: {
    isConnected: true,
    text: '',
    alertClass: '',
    // 多语言文本
    i18nTexts: {
      'zh-CN': {
        connecting: '连接中...',
        offline: '网络连接已断开',
        error: '网络连接异常'
      },
      'en-US': {
        connecting: 'Connecting...',
        offline: 'Network disconnected',
        error: 'Network connection error'
      }
    }
  },

  lifetimes: {
    attached() {
      this.initNetworkMonitor();
      this.updateAlertClass();
    },
    
    detached() {
      this.destroyNetworkMonitor();
    }
  },

  observers: {
    'fixed, showShadow': function(fixed, showShadow) {
      this.updateAlertClass();
    }
  },

  methods: {
    // 初始化网络监听
    initNetworkMonitor() {
      // 监听网络状态变化
      wx.onNetworkStatusChange(this.onNetworkStatusChange.bind(this));
      
      // 获取当前网络状态
      wx.getNetworkType({
        success: (res) => {
          if (res.networkType === 'none') {
            this.updateConnectionStatus(3); // 断开连接
          } else {
            this.updateConnectionStatus(1); // 已连接
          }
        },
        fail: () => {
          this.updateConnectionStatus(3); // 获取失败，认为断开连接
        }
      });
    },

    // 销毁网络监听
    destroyNetworkMonitor() {
      wx.offNetworkStatusChange(this.onNetworkStatusChange);
    },

    // 网络状态变化回调
    onNetworkStatusChange(res) {
      if (res.isConnected) {
        this.updateConnectionStatus(1); // 已连接
      } else {
        this.updateConnectionStatus(3); // 断开连接
      }
    },

    // 连接状态变化观察器
    onConnectStatusChange(newStatus) {
      this.updateConnectionStatus(newStatus);
    },

    // 更新连接状态
    updateConnectionStatus(status) {
      const texts = this.data.i18nTexts[this.data.language] || this.data.i18nTexts['zh-CN'];
      let isConnected = true;
      let text = '';
      let alertClass = '';

      switch (status) {
        case 1: // 已连接
          isConnected = true;
          text = '';
          break;
        case 2: // 连接中
          isConnected = false;
          text = this.data.customText || texts.connecting;
          alertClass = 'connecting';
          break;
        case 3: // 已断开
          isConnected = false;
          text = this.data.customText || texts.offline;
          alertClass = 'offline';
          break;
        default: // 错误状态
          isConnected = false;
          text = this.data.customText || texts.error;
          alertClass = 'error';
          break;
      }

      this.setData({
        isConnected,
        text,
        alertClass
      });

      this.updateAlertClass();

      // 触发状态变化事件
      this.triggerEvent('statusChange', {
        status,
        isConnected,
        text
      });
    },

    // 更新样式类
    updateAlertClass() {
      let alertClass = this.data.alertClass;
      
      if (this.data.fixed) {
        alertClass += ' fixed';
      }
      
      if (this.data.showShadow) {
        alertClass += ' with-shadow';
      }
      
      this.setData({
        alertClass: alertClass.trim()
      });
    },

    // 获取本地化文本
    getLocalizedText(key) {
      const texts = this.data.i18nTexts[this.data.language] || this.data.i18nTexts['zh-CN'];
      return texts[key] || key;
    },

    // 手动设置连接状态
    setConnectStatus(status) {
      this.updateConnectionStatus(status);
    },

    // 设置自定义文本
    setCustomText(text) {
      this.setData({
        customText: text
      });
      // 如果当前处于断开状态，更新显示文本
      if (!this.data.isConnected) {
        this.setData({
          text: text
        });
      }
    },

    // 显示警告
    show() {
      this.setData({
        isConnected: false
      });
    },

    // 隐藏警告
    hide() {
      this.setData({
        isConnected: true
      });
    },

    // 点击事件
    onTap() {
      this.triggerEvent('tap', {
        status: this.data.connectStatus,
        isConnected: this.data.isConnected,
        text: this.data.text
      });
    }
  }
});