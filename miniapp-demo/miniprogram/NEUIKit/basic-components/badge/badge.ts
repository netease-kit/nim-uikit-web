Component({
  /**
   * 组件的属性列表
   */
  properties: {
    num: {
      type: Number,
      value: 0,
      observer: '_updateText'
    },
    max: {
      type: Number,
      value: 99,
      observer: '_updateText'
    },
    dot: {
      type: Boolean,
      value: false
    },
    customStyle: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    text: ''
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached() {
      this._updateText();
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 更新显示文本
     */
    _updateText() {
      const { num, max } = this.data;
      const maxValue = max || 99;
      
      let text = '';
      if (num > 0) {
        if (num > maxValue) {
          text = `${maxValue}+`;
        } else {
          text = num.toString();
        }
      }
      
      this.setData({ text });
    }
  }
});