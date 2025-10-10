Component({
  properties: {
    // 外部样式类
    extClass: {
      type: String,
      value: ''
    },
    // 自定义类名
    className: {
      type: String,
      value: ''
    },
    // 输入框类型
    type: {
      type: String,
      value: 'text'
    },
    // 输入值
    modelValue: {
      type: String,
      value: ''
    },
    // 占位符
    placeholder: {
      type: String,
      value: ''
    },
    // 是否允许清除
    allowClear: {
      type: Boolean,
      value: false
    },
    // 验证规则
    rule: {
      type: Object,
      value: undefined
    },
    // 最大长度
    maxlength: {
      type: Number,
      value: 140
    }
  },

  data: {
    inputFocus: false,
    inputError: false,
    inputClass: '',
    inputValue: ''
  },

  observers: {
    'modelValue': function(modelValue: string) {
      this.setData({
        inputValue: modelValue || ''
      });
    },
    'inputFocus, inputError, className': function() {
      this._updateInputClass();
    }
  },

  attached() {
    this._updateInputClass();
    this.setData({
      inputValue: this.properties.modelValue || ''
    });
  },

  methods: {
    /**
     * 更新输入框样式类
     */
    _updateInputClass() {
      const { className } = this.properties;
      const { inputFocus, inputError } = this.data;
      
      let classes = [className, 'form-input-item'];
      
      if (inputFocus) {
        classes.push('focus');
      }
      
      if (inputError) {
        classes.push('error');
      }
      
      this.setData({
        inputClass: classes.filter(Boolean).join(' ')
      });
    },

    /**
     * 处理失焦事件
     */
    handleBlur(event: any) {
      this.setData({ inputFocus: false });
      
      const { rule, modelValue } = this.properties;
      if (rule && rule.trigger === 'blur') {
        const isValid = rule.reg.test(modelValue || '');
        this.setData({ inputError: !isValid });
      }
      
      this.triggerEvent('blur', event.detail);
    },

    /**
     * 处理聚焦事件
     */
    handleFocus(event: any) {
      this.setData({ inputFocus: true });
      this.triggerEvent('focus', event.detail);
    },

    /**
     * 处理输入事件
     */
    handleInput(event: any) {
      const { maxlength } = this.properties;
      const value = event.detail.value;
      
      if (!(maxlength && value.length > maxlength)) {
        this.setData({ inputValue: value });
        this.triggerEvent('update', { value });
        this.triggerEvent('input', { value });
      }
    },

    /**
     * 清除输入内容
     */
    clearInput() {
      this.setData({ 
        inputValue: '',
        inputFocus: true 
      });
      this.triggerEvent('update', { value: '' });
      this.triggerEvent('input', { value: '' });
    },

    /**
     * 验证输入内容
     */
    validate() {
      const { rule, modelValue } = this.properties;
      if (rule) {
        const isValid = rule.reg.test(modelValue || '');
        this.setData({ inputError: !isValid });
        return isValid;
      }
      return true;
    },

    /**
     * 清除验证错误状态
     */
    clearError() {
      this.setData({ inputError: false });
    }
  }
});