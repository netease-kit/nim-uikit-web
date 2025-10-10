Component({
  properties: {
    // 标题
    title: {
      type: String,
      value: ''
    },
    // 确认按钮文本
    confirmText: {
      type: String,
      value: '确认'
    },
    // 取消按钮文本
    cancelText: {
      type: String,
      value: '取消'
    },
    // 是否显示
    visible: {
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
    }
  },

  data: {
    // 内部状态
  },

  lifetimes: {
    attached() {
      // 组件实例进入页面节点树时执行
    },
    
    detached() {
      // 组件实例被从页面节点树移除时执行
    }
  },

  observers: {
    'visible': function(visible) {
      if (visible) {
        this.triggerEvent('show', {});
      } else {
        this.triggerEvent('hide', {});
      }
    }
  },

  methods: {
    // 确认按钮点击事件
    handleConfirmClick(e) {
      this.triggerEvent('confirm', {
        title: this.data.title,
        confirmText: this.data.confirmText,
        cancelText: this.data.cancelText,
        detail: e.detail
      });
    },

    // 取消按钮点击事件
    handleCancelClick(e) {
      this.triggerEvent('cancel', {
        title: this.data.title,
        confirmText: this.data.confirmText,
        cancelText: this.data.cancelText,
        detail: e.detail
      });
    },

    // 显示模态框
    show() {
      this.setData({
        visible: true
      });
    },

    // 隐藏模态框
    hide() {
      this.setData({
        visible: false
      });
    },

    // 切换显示状态
    toggle() {
      this.setData({
        visible: !this.data.visible
      });
    }
  }
});