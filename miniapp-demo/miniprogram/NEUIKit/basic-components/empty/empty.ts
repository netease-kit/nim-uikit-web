Component({
  properties: {
    // 外部样式类
    extClass: {
      type: String,
      value: ''
    },
    // 空状态文本
    text: {
      type: String,
      value: ''
    },
    // 图片地址
    imageSrc: {
      type: String,
      value: 'https://yx-web-nosdn.netease.im/common/e0f58096f06c18cdd101f2614e6afb09/empty.png'
    }
  },

  data: {},

  methods: {
    /**
     * 图片加载失败处理
     */
    onImageError(event: any) {
      console.warn('Empty component image load failed:', event.detail);
      this.triggerEvent('imageError', event.detail);
    },

    /**
     * 图片加载成功处理
     */
    onImageLoad(event: any) {
      this.triggerEvent('imageLoad', event.detail);
    }
  }
});