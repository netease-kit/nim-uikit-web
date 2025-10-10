Component({
  properties: {
    // 外部样式类
    extClass: {
      type: String,
      value: ''
    },
    // 提示消息
    message: {
      type: String,
      value: ''
    },
    // 显示时长（毫秒）
    duration: {
      type: Number,
      value: 2000
    },
    // 提示类型
    type: {
      type: String,
      value: 'info'
    },
    // 自定义样式
    customStyle: {
      type: Object,
      value: {}
    },
    // 自定义样式类
    customClass: {
      type: String,
      value: ''
    }
  },

  data: {
    visible: false,
    typeClass: '',
    fadeClass: '',
    customStyleStr: ''
  },

  observers: {
    'type': function(type: string) {
      this._updateTypeClass(type);
    },
    'customStyle': function(customStyle: Record<string, string | number>) {
      this._updateCustomStyle(customStyle);
    }
  },

  lifetimes: {
    attached() {
      this._updateClasses();
    },
    detached() {
      this._clearTimer();
    }
  },

  methods: {
    /**
     * 更新样式类
     */
    _updateClasses() {
      this._updateTypeClass(this.data.type);
      this._updateCustomStyle(this.data.customStyle);
    },

    /**
     * 更新类型样式类
     */
    _updateTypeClass(type: string) {
      const validTypes = ['info', 'success', 'warning', 'error'];
      const typeClass = validTypes.includes(type) ? type : 'info';
      this.setData({ typeClass });
    },

    /**
     * 更新自定义样式
     */
    _updateCustomStyle(customStyle: Record<string, string | number>) {
      if (customStyle && typeof customStyle === 'object') {
        const styleStr = Object.keys(customStyle)
          .map(key => `${key}: ${customStyle[key]}`)
          .join('; ');
        this.setData({
          customStyleStr: styleStr
        });
      }
    },

    /**
     * 显示Toast
     */
    show() {
      this.setData({ 
        visible: true,
        fadeClass: 'fade-enter-active'
      });
      
      // 清除之前的定时器
      this._clearTimer();
      
      // 设置自动隐藏定时器
      if (this.data.duration > 0) {
        (this as any).timer = setTimeout(() => {
          this.hide();
        }, this.data.duration);
      }
    },

    /**
     * 隐藏Toast
     */
    hide() {
      this.setData({ 
        fadeClass: 'fade-leave-active'
      });
      
      // 等待动画完成后隐藏
      setTimeout(() => {
        this.setData({ 
          visible: false,
          fadeClass: ''
        });
        this.triggerEvent('hidden');
      }, 300); // 动画时长
      
      this._clearTimer();
    },

    /**
     * 清除定时器
     */
    _clearTimer() {
      if ((this as any).timer) {
        clearTimeout((this as any).timer);
        (this as any).timer = null;
      }
    }
  }
});