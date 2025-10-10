Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    imageUrl: {
      type: String,
      value: '',
      required: true
    }
  },

  data: {
    imageLoaded: false,
    imageError: false
  },

  observers: {
    'visible': function(visible: boolean) {
      if (visible) {
        this.setData({
          imageLoaded: false,
          imageError: false
        });
      }
    }
  },

  methods: {
    handleClose() {
      // 触发关闭事件，对应原 Vue 组件的 onClose 回调
      this.triggerEvent('close');
      // 触发 visible 更新事件
      this.triggerEvent('update:visible', { visible: false });
    },

    preventClose(e: any) {
      // 阻止事件冒泡，防止点击图片时关闭预览
      e.stopPropagation();
    },

    onImageLoad() {
      this.setData({
        imageLoaded: true,
        imageError: false
      });
      this.triggerEvent('imageLoad');
    },

    onImageError() {
      this.setData({
        imageError: true,
        imageLoaded: false
      });
      this.triggerEvent('imageError');
      
      // 显示错误提示
      wx.showToast({
        title: '图片加载失败',
        icon: 'none',
        duration: 2000
      });
    },

    // 公开方法：显示预览
    show() {
      this.setData({ visible: true });
    },

    // 公开方法：隐藏预览
    hide() {
      this.setData({ visible: false });
      this.handleClose();
    }
  },

  lifetimes: {
    attached() {
      // 组件实例进入页面节点树时执行
    },
    
    detached() {
      // 组件实例被从页面节点树移除时执行
    }
  }
});