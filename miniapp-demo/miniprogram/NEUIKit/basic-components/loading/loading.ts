Component({
  properties: {
    // 是否显示加载动画
    visible: {
      type: Boolean,
      value: false
    },
    // 加载文本
    text: {
      type: String,
      value: ''
    }
  },

  data: {
    // 内部状态
  },

  observers: {
    'visible': function(newVisible: boolean) {
      // 当显示状态变化时的处理
      if (newVisible) {
        this.triggerEvent('show');
      } else {
        this.triggerEvent('hide');
      }
    }
  },

  lifetimes: {
    attached() {
      // 组件初始化
    },
    
    detached() {
      // 组件销毁
    }
  },

  methods: {
    /**
     * 显示加载动画
     * @param loadingText 加载文本
     */
    show(loadingText: string = '') {
      this.setData({
        text: loadingText,
        visible: true
      });
      
      this.triggerEvent('show', {
        text: loadingText
      });
    },

    /**
     * 隐藏加载动画
     */
    hide() {
      this.setData({
        visible: false,
        text: ''
      });
      
      this.triggerEvent('hide');
    },

    /**
     * 切换显示状态
     */
    toggle(loadingText: string = '') {
      if (this.data.visible) {
        this.hide();
      } else {
        this.show(loadingText);
      }
    },

    /**
     * 更新加载文本
     */
    updateText(newText: string) {
      this.setData({
        text: newText
      });
    }
  }
});