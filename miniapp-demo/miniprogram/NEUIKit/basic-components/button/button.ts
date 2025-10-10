Component({
  properties: {
    // 外部样式类
    extClass: {
      type: String,
      value: ''
    },
    // 按钮类型
    type: {
      type: String,
      value: 'default'
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      value: false
    },
    // 是否块级按钮
    block: {
      type: Boolean,
      value: false
    },
    // 是否圆角按钮
    round: {
      type: Boolean,
      value: false
    },
    // 是否朴素按钮
    plain: {
      type: Boolean,
      value: false
    },
    // 自定义样式
    customStyle: {
      type: Object,
      value: {}
    },
    // 自定义类名
    customClass: {
      type: String,
      value: ''
    }
  },

  data: {
    typeClass: '',
    disabledClass: '',
    blockClass: '',
    roundClass: '',
    plainClass: '',
    customStyleStr: ''
  },

  observers: {
    'type': function(type: string) {
      this.setData({
        typeClass: `ne-button--${type}`
      });
    },
    'disabled': function(disabled: boolean) {
      this.setData({
        disabledClass: disabled ? 'ne-button--disabled' : ''
      });
    },
    'block': function(block: boolean) {
      this.setData({
        blockClass: block ? 'ne-button--block' : ''
      });
    },
    'round': function(round: boolean) {
      this.setData({
        roundClass: round ? 'ne-button--round' : ''
      });
    },
    'plain': function(plain: boolean) {
      this.setData({
        plainClass: plain ? 'ne-button--plain' : ''
      });
    },
    'customStyle': function(customStyle: Record<string, string | number>) {
      this._updateCustomStyle(customStyle);
    }
  },

  attached() {
    this._updateClasses();
    this._updateCustomStyle(this.data.customStyle);
  },

  methods: {
    /**
     * 更新所有样式类
     */
    _updateClasses() {
      const { type, disabled, block, round, plain } = this.properties;
      
      this.setData({
        typeClass: `ne-button--${type}`,
        disabledClass: disabled ? 'ne-button--disabled' : '',
        blockClass: block ? 'ne-button--block' : '',
        roundClass: round ? 'ne-button--round' : '',
        plainClass: plain ? 'ne-button--plain' : ''
      });
    },

    /**
     * 更新自定义样式
     */
    _updateCustomStyle(customStyle: Record<string, string | number>) {
      if (!customStyle || typeof customStyle !== 'object') {
        this.setData({ customStyleStr: '' });
        return;
      }

      const styleStr = Object.keys(customStyle)
        .map(key => {
          const value = customStyle[key];
          const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
          return `${cssKey}: ${value}`;
        })
        .join('; ');
      
      this.setData({ customStyleStr: styleStr });
    },

    /**
     * 处理按钮点击
     */
    handleClick(event: any) {
      if (!this.properties.disabled) {
        this.triggerEvent('click', event);
      }
    }
  }
});