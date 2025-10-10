/**
 * 自定义 Switch 组件
 * 内部使用原生 switch 组件，提供统一的接口和扩展能力
 */
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 是否选中
    checked: {
      type: Boolean,
      value: false
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      value: false
    },
    // 样式类型，可选值：switch, checkbox
    type: {
      type: String,
      value: 'switch'
    },
    // switch 的颜色，同 css 的 color
    color: {
      type: String,
      value: ''
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

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 处理 switch 变化事件
     * 直接透传原生 switch 的事件
     */
    handleChange(event: any) {
      console.log('自定义 Switch 组件事件:', {
        type: event.type,
        detail: event.detail,
        value: event.detail.value,
        checked: this.properties.checked
      });

      // 直接透传原生事件给父组件
      this.triggerEvent('change', {
        value: event.detail.value,
        checked: event.detail.value
      }, {
        bubbles: true,
        composed: true
      });
    },

    /**
     * 手动切换开关状态
     * 提供编程式控制接口
     */
    toggle() {
      if (this.properties.disabled) {
        return;
      }
      
      const newValue = !this.properties.checked;
      this.setData({
        checked: newValue
      });
      
      // 触发 change 事件
      this.triggerEvent('change', {
        value: newValue,
        checked: newValue
      });
    },

    /**
     * 获取当前开关状态
     */
    getValue() {
      return this.properties.checked;
    }
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached() {
      console.log('自定义 Switch 组件已挂载', {
        checked: this.properties.checked,
        disabled: this.properties.disabled,
        type: this.properties.type,
        color: this.properties.color
      });
    }
  }
});