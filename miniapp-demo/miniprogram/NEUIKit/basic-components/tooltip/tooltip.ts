Component({
  properties: {
    // 外部样式类
    extClass: {
      type: String,
      value: ''
    },
    // 是否显示
    visible: {
      type: Boolean,
      value: false
    },
    // 是否对齐
    align: {
      type: Boolean,
      value: false
    },
    // 背景颜色
    color: {
      type: String,
      value: '#303133'
    },
    // 提示内容
    content: {
      type: String,
      value: ''
    },
    // 是否显示（备用属性）
    show: {
      type: Boolean,
      value: false
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
    isShow: false,
    title: 'Hello',
    arrowLeft: 0,
    style: {} as any,
    arrowStyle: {} as any,
    placement: 'top',
    touchTimer: null as any,
    touchStartTime: 0,
    touchStartPosition: null as any,
    popperStyle: '',
    colorClass: '',
    customStyleStr: ''
  },

  observers: {
    'visible': function(visible: boolean) {
      if (visible) {
        this.getPosition().then(() => {
          this.setData({ isShow: visible });
        });
      } else {
        this.setData({ isShow: visible });
      }
      this.triggerEvent('update:visible', visible);
    },
    'color': function(color: string) {
      this._updateColorClass(color);
    },
    'customStyle': function(customStyle: Record<string, string | number>) {
      this._updateCustomStyle(customStyle);
    }
  },

  lifetimes: {
    attached() {
      this.setData({ isShow: this.data.visible });
      this._updateColorClass(this.data.color);
      this._updateCustomStyle(this.data.customStyle);
      this.getPosition();
    },
    detached() {
      this._clearTimer();
    }
  },

  methods: {
    /**
     * 更新颜色样式类
     */
    _updateColorClass(color: string) {
      this.setData({
        colorClass: color === 'white' ? 'white-theme' : 'dark-theme'
      });
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
     * 关闭tooltip
     */
    close() {
      this.setData({ isShow: false });
      this.triggerEvent('update:visible', false);
    },

    /**
     * 阻止事件冒泡
     */
    stopPropagation() {
      // 阻止事件冒泡
    },

    /**
     * 处理点击事件
     */
    async handleClick() {
      if (this.data.isShow) {
        this.setData({ isShow: false });
        this.triggerEvent('update:visible', false);
        return;
      }
      await this.getPosition();
      this.setData({ isShow: true });
      this.triggerEvent('update:visible', true);
    },

    /**
     * 获取定位信息
     */
    getPosition() {
      return new Promise((resolve) => {
        const query = this.createSelectorQuery();
        const contentQuery = query.select('.chat_tooltip_content');
        const popperQuery = query.select('.chat_tooltip__popper');
        
        contentQuery.boundingClientRect();
        popperQuery.boundingClientRect();
        
        query.exec((res) => {
          const contentRect = res[0];
          const popperRect = res[1];
          
          if (contentRect && popperRect) {
            const { top, width, height, left } = contentRect;
            const systemInfo = wx.getSystemInfoSync();
            const windowWidth = systemInfo.windowWidth;
            let objStyle: any= {};
            let placement = 'top';

            // 判断是否显示在顶部还是底部
            if (top <= 300) {
              placement = 'bottom';
            } else {
              placement = 'top';
            }

            switch (placement) {
              case 'top':
                if (this.data.align) {
                  // 计算左侧位置，确保不超出屏幕
                  let leftPos = -100;
                  if (width < 90) {
                    leftPos = -200;
                  }
                  // 检查是否会超出屏幕左侧
                  if (left + leftPos < 0) {
                    leftPos = -left + 10; // 留10px边距
                  }
                  // 检查是否会超出屏幕右侧
                  if (left + leftPos + popperRect.width > windowWidth) {
                    leftPos = windowWidth - left - popperRect.width - 10;
                  }
                  objStyle.left = `${leftPos}px`;
                } else {
                  let leftPos = 50;
                  // 检查是否会超出屏幕右侧
                  if (left + leftPos + popperRect.width > windowWidth) {
                    leftPos = windowWidth - left - popperRect.width - 10;
                  }
                  objStyle.left = `${leftPos}px`;
                }
                objStyle.bottom = `${height + 8}px`;
                break;

              case 'bottom':
                if (this.data.align) {
                  let leftPos = -100;
                  if (width < 100) {
                    leftPos = -200;
                  }
                  // 检查是否会超出屏幕左侧
                  if (left + leftPos < 0) {
                    leftPos = -left + 10;
                  }
                  // 检查是否会超出屏幕右侧
                  if (left + leftPos + popperRect.width > windowWidth) {
                    leftPos = windowWidth - left - popperRect.width - 10;
                  }
                  objStyle.left = `${leftPos}px`;
                } else {
                  let leftPos = 50;
                  // 检查是否会超出屏幕右侧
                  if (left + leftPos + popperRect.width > windowWidth) {
                    leftPos = windowWidth - left - popperRect.width - 10;
                  }
                  objStyle.left = `${leftPos}px`;
                }
                objStyle.top = `${height + 8}px`;
                break;
            }

            // 构建样式字符串
            const styleStr = Object.keys(objStyle)
              .map(key => `${key}: ${objStyle[key]}`)
              .join('; ');
            
            // 添加可见性和颜色样式
            const visibility = this.data.isShow ? 'visible' : 'hidden';
            const color = this.data.color === 'white' ? '' : '#fff';
            const boxShadow = this.data.color === 'white' 
              ? '0 3px 6px -4px #0000001f, 0 6px 16px #00000014, 0 9px 28px 8px #0000000d' 
              : '';
            
            const finalStyle = `${styleStr}; visibility: ${visibility}; color: ${color}; box-shadow: ${boxShadow};`;
            
            this.setData({
              style: objStyle,
              placement: placement,
              popperStyle: finalStyle
            });
            
            resolve(null);
          }
        });
      });
    },

    /**
     * 处理触摸开始
     */
    handleTouchStart(e: any) {
      this.data.touchStartTime = Date.now();
      this.data.touchStartPosition = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };

      this.data.touchTimer = setTimeout(() => {
        // 检查是否移动了太多
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const moveDistance = Math.sqrt(
          Math.pow(currentX - this.data.touchStartPosition.x, 2) +
          Math.pow(currentY - this.data.touchStartPosition.y, 2)
        );

        if (moveDistance < 10) {
          // 允许少量移动
          this.handleClick();
        }
      }, 500); // 长按时间阈值：500ms
    },

    /**
     * 处理触摸结束
     */
    handleTouchEnd() {
      this._clearTimer();
    },

    /**
     * 处理触摸移动
     */
    handleTouchMove() {
      this._clearTimer();
    },

    /**
     * 清除定时器
     */
    _clearTimer() {
      if (this.data.touchTimer) {
        clearTimeout(this.data.touchTimer);
        this.setData({ touchTimer: null });
      }
    }
  }
});