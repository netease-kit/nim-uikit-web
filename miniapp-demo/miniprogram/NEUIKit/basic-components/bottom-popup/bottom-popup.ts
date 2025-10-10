Component({
  properties: {
    // 外部样式类
    extClass: {
      type: String,
      value: ''
    },
    // 是否显示弹窗
    show: {
      type: Boolean,
      value: false
    },
    // 是否显示头部
    showHeader: {
      type: Boolean,
      value: true
    },
    // 是否显示取消按钮
    showCancel: {
      type: Boolean,
      value: true
    },
    // 是否显示确定按钮
    showConfirm: {
      type: Boolean,
      value: true
    },
    // 取消按钮文本
    cancelText: {
      type: String,
      value: '取消'
    },
    // 确定按钮文本
    confirmText: {
      type: String,
      value: '确定'
    }
  },

  data: {},

  methods: {
    /**
     * 处理确定按钮点击
     */
    handleConfirm() {
      this.triggerEvent('confirm');
      this.triggerEvent('update', { show: false });
    },

    /**
     * 处理取消按钮点击
     */
    handleCancel() {
      this.triggerEvent('cancel');
      this.triggerEvent('update', { show: false });
    }
  }
});