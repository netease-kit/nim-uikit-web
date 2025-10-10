Component({
  properties: {
    // 主标题
    title: {
      type: String,
      value: ''
    },
    // 副标题
    subTitle: {
      type: String,
      value: ''
    },
    // 背景颜色
    backgroundColor: {
      type: String,
      value: '#ffffff'
    },
    // 背景图片
    backgroundImage: {
      type: String,
      value: ''
    },
    // 是否显示左侧插槽
    showLeft: {
      type: Boolean,
      value: false
    },
    // 是否显示返回按钮
    showBack: {
      type: Boolean,
      value: true
    },
    // 是否透明
    transparent: {
      type: Boolean,
      value: false
    },
    // 是否显示阴影
    showShadow: {
      type: Boolean,
      value: false
    },
    // 是否使用渐变背景
    gradient: {
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
    // 返回层级数
    delta: {
      type: Number,
      value: 1
    },
    // Logo图片地址
    logoSrc: {
      type: String,
      value: ''
    },
    // 应用名称文本
    appText: {
      type: String,
      value: ''
    },
    // 是否显示设置按钮
    showSetting: {
      type: Boolean,
      value: false
    }
  },

  data: {
    statusBarHeight: 0,
    navBarClass: ''
  },

  lifetimes: {
    attached() {
      this.initNavBar();
    }
  },

  observers: {
    'transparent, showShadow, gradient': function(transparent, showShadow, gradient) {
      this.updateNavBarClass(transparent, showShadow, gradient);
    }
  },

  methods: {
    // 初始化导航栏
    initNavBar() {
      // 获取系统信息
      const systemInfo = wx.getSystemInfoSync();
      const statusBarHeight = systemInfo.statusBarHeight || 0;
      
      this.setData({
        statusBarHeight
      });
      
      // 设置CSS变量
      if (statusBarHeight > 0) {
        const query = this.createSelectorQuery();
        query.select('.nav-bar-wrapper').node().exec((res) => {
          if (res[0] && res[0].node) {
            res[0].node.style.setProperty('--status-bar-height', `${statusBarHeight}px`);
          }
        });
      }
      
      this.updateNavBarClass(this.data.transparent, this.data.showShadow, this.data.gradient);
    },

    // 更新导航栏样式类
    updateNavBarClass(transparent, showShadow, gradient) {
      let navBarClass = '';
      
      if (this.data.statusBarHeight > 0) {
        navBarClass += ' with-status-bar';
      }
      
      if (transparent) {
        navBarClass += ' transparent';
      }
      
      if (showShadow) {
        navBarClass += ' with-shadow';
      }
      
      if (gradient) {
        navBarClass += ' gradient';
      }
      
      this.setData({
        navBarClass: navBarClass.trim()
      });
    },

    // 返回上一页
    back() {
      if (!this.data.showBack) {
        return;
      }
      
      // 触发返回事件
      this.triggerEvent('back', {
        delta: this.data.delta
      });
      
      // 默认返回行为
      const pages = getCurrentPages();
      if (pages.length > this.data.delta) {
        wx.navigateBack({
          delta: this.data.delta,
          fail: (err) => {
            console.warn('NavBar: 返回失败', err);
            this.triggerEvent('backFail', { error: err });
          }
        });
      } else {
        // 如果没有足够的页面可以返回，触发事件让父组件处理
        this.triggerEvent('backToHome', {});
      }
    },

    // 标题点击事件
    onTitleTap() {
      this.triggerEvent('titleTap', {
        title: this.data.title,
        subTitle: this.data.subTitle
      });
    },

    // 设置按钮点击事件
    onSettingTap() {
      this.triggerEvent('settingTap', {});
    },

    // 设置标题
    setTitle(title, subTitle) {
      this.setData({
        title: title || '',
        subTitle: subTitle || ''
      });
    },

    // 设置背景
    setBackground(backgroundColor, backgroundImage) {
      this.setData({
        backgroundColor: backgroundColor || '#ffffff',
        backgroundImage: backgroundImage || ''
      });
    },

    // 显示/隐藏导航栏
    show() {
      this.setData({
        hidden: false
      });
    },

    hide() {
      this.setData({
        hidden: true
      });
    }
  }
});