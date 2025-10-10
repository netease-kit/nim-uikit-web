Component({
  properties: {
    // 输入框的值
    value: {
      type: String,
      value: ''
    },
    // 输入框类型
    type: {
      type: String,
      value: 'text'
    },
    // 占位符
    placeholder: {
      type: String,
      value: '请输入'
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      value: false
    },
    // 最大长度
    maxlength: {
      type: Number,
      value: -1
    },
    // 是否显示清除按钮
    showClear: {
      type: Boolean,
      value: false
    },
    // 自定义样式
    inputStyle: {
      type: String,
      value: ''
    },
    // 输入框ID
    id: {
      type: String,
      value: ''
    }
  },

  data: {
    // 内部状态
  },

  observers: {
    'value': function(_value: string) {
      // 当外部传入的value变化时，可以在这里处理
      // 微信小程序的input组件会自动同步value
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
     * 处理输入事件
     */
    handleInput(e: any) {
      const { value } = e.detail;
      
      // 触发父组件的input事件
      this.triggerEvent('input', {
        value: value
      });
      
      // 触发双向绑定更新
      this.triggerEvent('change', {
        value: value
      });
    },

    /**
     * 处理获得焦点事件
     */
    handleFocus(e: any) {
      this.triggerEvent('focus', {
        value: e.detail.value,
        height: e.detail.height
      });
    },

    /**
     * 处理失去焦点事件
     */
    handleBlur(e: any) {
      this.triggerEvent('blur', {
        value: e.detail.value
      });
    },

    /**
     * 处理确认输入事件（回车键）
     */
    handleConfirm(e: any) {
      const { value } = e.detail;
      
      this.triggerEvent('confirm', {
        value: value
      });
    },

    /**
     * 清除输入内容
     */
    clearInput() {
      // 触发清除事件
      this.triggerEvent('clear');
      
      // 触发双向绑定更新
      this.triggerEvent('change', {
        value: ''
      });
      
      // 触发输入事件
      this.triggerEvent('input', {
        value: ''
      });
    }
  }
});