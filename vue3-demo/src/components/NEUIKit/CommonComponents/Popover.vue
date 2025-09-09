<template>
  <div
    class="popover-wrapper"
    :style="{
      '--popover-bg-color': backgroundColor,
      ...wrapperStyle,
    }"
  >
    <div
      class="popover-trigger"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @click="handleClick"
      ref="triggerRef"
    >
      <slot></slot>
    </div>

    <!-- 遮罩层 -->
    <div
      class="popover-mask"
      v-show="visible && trigger === 'click'"
      @click="handleMaskClick"
    ></div>

    <!-- 气泡内容 -->
    <transition name="popover-fade">
      <div
        v-if="visible"
        class="popover-content"
        :class="[showArrow ? `popover-${currentPlacement}` : '']"
        :style="popoverStyle"
        @mouseenter="handlePopoverMouseEnter"
        @mouseleave="handlePopoverMouseLeave"
        ref="popoverRef"
      >
        <!-- 标题 -->
        <div v-if="title || $slots.title" class="popover-title">
          <slot name="title">{{ title }}</slot>
        </div>

        <!-- 内容 -->
        <div class="popover-body" :style="bodyStyle">
          <slot name="content">{{ content }}</slot>
        </div>

        <!-- 底部操作区 -->
        <div v-if="$slots.footer" class="popover-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: "Popover",
  props: {
    // 触发方式: 'hover' | 'click' | 'focus'｜'manual'
    trigger: {
      type: String,
      default: "hover",
    },
    // 显示位置: 'top' | 'bottom' | 'left' | 'right' | 'auto'
    placement: {
      type: String,
      default: "auto",
      validator: (value) =>
        ["top", "bottom", "left", "right", "auto"].includes(value),
    },
    // 标题
    title: {
      type: String,
      default: "",
    },
    // 内容
    content: {
      type: String,
      default: "",
    },
    // 背景颜色
    backgroundColor: {
      type: String,
      default: "#fff",
    },
    // 鼠标进入延迟时间（秒）
    mouseEnterDelay: {
      type: Number,
      default: 0.1,
    },
    // 鼠标离开延迟时间（秒）
    mouseLeaveDelay: {
      type: Number,
      default: 0.1,
    },
    // 宽度
    width: {
      type: [String, Number],
      default: "auto",
    },
    // 最大宽度
    maxWidth: {
      type: [String, Number],
      default: "1000px",
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false,
    },
    // 是否显示箭头
    showArrow: {
      type: Boolean,
      default: false,
    },
    // popover body 的自定义样式
    bodyStyle: {
      type: [Object, String],
      default: () => ({}),
    },
    // 手动控制显示隐藏
    modelValue: {
      type: Boolean,
      default: undefined,
    },
    // Popover 与触发器之间的距离（像素）
    offset: {
      type: Number,
      default: 8,
    },
    // popover-wrapper 的自定义样式
    wrapperStyle: {
      type: [Object, String],
      default: () => ({}),
    },
    // 对齐方式: 'left' | 'center' | 'right'
    align: {
      type: String,
      default: "center",
      validator: (value) => ["left", "center", "right"].includes(value),
    },
  },

  emits: ["update:modelValue", "show", "hide"],

  data() {
    return {
      visible: false,
      currentPlacement: "auto",
      popoverStyle: {},
      showTimer: null,
      hideTimer: null,
      _isUpdatingPosition: false,
      _resizeTimer: null,
    };
  },

  computed: {
    isControlled() {
      return this.modelValue !== undefined;
    },
  },

  watch: {
    modelValue: {
      handler(val) {
        if (this.isControlled) {
          this.visible = val;
          if (val) {
            this.$nextTick(() => {
              this.updatePosition();
            });
          }
        }
      },
      immediate: true,
    },

    visible(val) {
      if (this.isControlled) {
        this.$emit("update:modelValue", val);
      }
      this.$emit(val ? "show" : "hide");

      // 动态添加/移除 popover 到 body
      this.$nextTick(() => {
        if (val && this.$refs.popoverRef) {
          // 显示时添加到 body
          document.body.appendChild(this.$refs.popoverRef);
        } else if (
          !val &&
          this.$refs.popoverRef &&
          this.$refs.popoverRef.parentNode === document.body
        ) {
          // 隐藏时从 body 移除
          document.body.removeChild(this.$refs.popoverRef);
        }
      });
    },
  },

  mounted() {
    // 监听全局点击事件
    document.addEventListener("click", this.handleDocumentClick);

    // 监听窗口大小变化
    window.addEventListener("resize", this.handleResize);
  },

  beforeUnmount() {
    this.clearTimers();

    // 移除事件监听器
    document.removeEventListener("click", this.handleDocumentClick);
    window.removeEventListener("resize", this.handleResize);

    // 清除resize定时器
    if (this._resizeTimer) {
      clearTimeout(this._resizeTimer);
      this._resizeTimer = null;
    }

    // 从body中移除popover元素
    if (
      this.$refs.popoverRef &&
      this.$refs.popoverRef.parentNode === document.body
    ) {
      document.body.removeChild(this.$refs.popoverRef);
    }
  },

  methods: {
    // 鼠标进入触发器
    handleMouseEnter(event) {
      if (this.disabled || this.trigger !== "hover") return;

      this.clearHideTimer();

      // 如果已经显示，不需要重新设置定时器
      if (this.visible) {
        return;
      }

      const delay = this.mouseEnterDelay * 1000; // 转换为毫秒

      if (delay === 0) {
        this.show();
      } else {
        this.clearShowTimer();
        this.showTimer = setTimeout(() => {
          this.show();
        }, delay);
      }
    },

    // 鼠标离开触发器
    handleMouseLeave() {
      if (this.disabled || this.trigger !== "hover") return;

      this.clearShowTimer();

      const delay = this.mouseLeaveDelay * 1000; // 转换为毫秒

      if (delay === 0) {
        this.hide();
      } else {
        this.clearHideTimer();
        this.hideTimer = setTimeout(() => {
          this.hide();
        }, delay);
      }
    },

    // 鼠标进入气泡
    handlePopoverMouseEnter(event) {
      if (this.trigger !== "hover") return;

      this.clearHideTimer();
    },

    // 鼠标离开气泡
    handlePopoverMouseLeave() {
      if (this.trigger !== "hover") return;

      this.clearShowTimer();

      const delay = this.mouseLeaveDelay * 1000; // 转换为毫秒

      if (delay === 0) {
        this.hide();
      } else {
        this.clearHideTimer();
        this.hideTimer = setTimeout(() => {
          this.hide();
        }, delay);
      }
    },

    // 点击触发器
    handleClick() {
      if (this.disabled || this.trigger !== "click") return;

      if (this.isControlled) {
        this.$emit("update:modelValue", !this.modelValue);
      } else {
        this.visible ? this.hide() : this.show();
      }
    },

    // 点击遮罩
    handleMaskClick() {
      if (this.trigger === "click") {
        if (this.isControlled) {
          this.$emit("update:modelValue", false);
        } else {
          this.hide();
        }
      }
    },

    // 显示气泡
    show() {
      if (this.disabled || this.visible) {
        return;
      }

      this.clearTimers();
      this.visible = true;

      // 只在首次显示时更新位置
      this.$nextTick(() => {
        this.updatePosition();
      });
    },

    // 隐藏气泡
    hide() {
      if (!this.visible) {
        return;
      }

      this.clearTimers();
      this.visible = false;
    },

    // 计算左侧位置
    calculateLeftPosition(triggerRect, popoverRect) {
      switch (this.align) {
        case "left":
          return triggerRect.left;
        case "right":
          return triggerRect.right - popoverRect.width;
        case "center":
        default:
          return triggerRect.left + (triggerRect.width - popoverRect.width) / 2;
      }
    },

    // 更新位置
    updatePosition() {
      // 如果Popover不可见，不需要更新位置
      if (!this.visible) {
        return;
      }

      this.$nextTick(() => {
        if (!this.$refs.triggerRef || !this.$refs.popoverRef) return;

        // 防止重复计算
        if (this._isUpdatingPosition) return;
        this._isUpdatingPosition = true;

        const trigger = this.$refs.triggerRef;
        const popover = this.$refs.popoverRef;

        // 使用visibility hidden而不是移除transform来避免闪烁
        const originalVisibility = popover.style.visibility;
        popover.style.visibility = "hidden";
        popover.style.display = "block";

        const triggerRect = trigger.getBoundingClientRect();
        const popoverRect = popover.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let placement = this.placement;

        // 自动计算最佳位置
        if (placement === "auto") {
          const spaceTop = triggerRect.top;
          const spaceBottom = viewportHeight - triggerRect.bottom;
          const spaceLeft = triggerRect.left;
          const spaceRight = viewportWidth - triggerRect.right;

          // 选择空间最大的方向
          const maxSpace = Math.max(
            spaceTop,
            spaceBottom,
            spaceLeft,
            spaceRight
          );
          if (maxSpace === spaceBottom) {
            placement = "bottom";
          } else if (maxSpace === spaceTop) {
            placement = "top";
          } else if (maxSpace === spaceRight) {
            placement = "right";
          } else {
            placement = "left";
          }
        }

        this.currentPlacement = placement;

        let top, left;

        // 根据位置计算坐标
        switch (placement) {
          case "top":
            // 根据触发方式调整间距，click时需要更大间距避免遮挡
            const topOffset =
              this.trigger === "click" ? this.offset + 4 : this.offset;
            top = triggerRect.top - popoverRect.height - topOffset;
            left = this.calculateLeftPosition(triggerRect, popoverRect);
            break;
          case "bottom":
            top = triggerRect.bottom + this.offset;
            left = this.calculateLeftPosition(triggerRect, popoverRect);
            break;
          case "left":
            top =
              triggerRect.top + (triggerRect.height - popoverRect.height) / 2;
            left = triggerRect.left - popoverRect.width - this.offset;
            break;
          case "right":
            top =
              triggerRect.top + (triggerRect.height - popoverRect.height) / 2;
            left = triggerRect.right + this.offset;
            break;
          default:
            top = triggerRect.bottom + this.offset;
            left = this.calculateLeftPosition(triggerRect, popoverRect);
        }

        // 边界检测和调整
        if (left < 10) {
          left = 10;
        } else if (left + popoverRect.width > viewportWidth - 10) {
          left = viewportWidth - popoverRect.width - 10;
        }

        // 对于top placement，如果计算出的位置会导致popover超出顶部边界，
        // 则改为bottom placement
        if (placement === "top" && top < 10) {
          top = triggerRect.bottom + this.offset;
          this.currentPlacement = "bottom";
        } else if (placement !== "top" && top < 10) {
          top = 10;
        } else if (top + popoverRect.height > viewportHeight - 10) {
          top = viewportHeight - popoverRect.height - 10;
        }

        const newStyle = {
          position: "fixed",
          top: `${top}px`,
          left: `${left}px`,
          width:
            typeof this.width === "number" ? `${this.width}px` : this.width,
          maxWidth:
            typeof this.maxWidth === "number"
              ? `${this.maxWidth}px`
              : this.maxWidth,
        };

        // 只有当样式真正发生变化时才更新
        const currentStyle = this.popoverStyle;
        if (
          currentStyle.top !== newStyle.top ||
          currentStyle.left !== newStyle.left ||
          this.currentPlacement !== placement
        ) {
          this.popoverStyle = newStyle;
        }

        // 恢复原来的visibility
        popover.style.visibility = originalVisibility;
        popover.style.display = "";

        // 重置更新标志
        this._isUpdatingPosition = false;
      });
    },

    // 清除显示定时器
    clearShowTimer() {
      if (this.showTimer) {
        clearTimeout(this.showTimer);
        this.showTimer = null;
      }
    },

    // 清除隐藏定时器
    clearHideTimer() {
      if (this.hideTimer) {
        clearTimeout(this.hideTimer);
        this.hideTimer = null;
      }
    },

    // 清除所有定时器
    clearTimers() {
      this.clearShowTimer();
      this.clearHideTimer();
    },

    // 处理窗口大小变化（防抖处理）
    handleResize() {
      if (this._resizeTimer) {
        clearTimeout(this._resizeTimer);
      }
      this._resizeTimer = setTimeout(() => {
        this.updatePosition();
      }, 100);
    },

    // 处理全局点击事件
    handleDocumentClick(event) {
      if (this.trigger !== "click" || !this.visible) return;

      const trigger = this.$refs.triggerRef;
      const popover = this.$refs.popoverRef;

      if (!trigger || !popover) return;

      // 如果点击的是触发器或气泡内容，不关闭
      if (trigger.contains(event.target) || popover.contains(event.target)) {
        return;
      }

      // 否则关闭气泡
      this.hide();
    },
  },
};
</script>

<style scoped>
.popover-wrapper {
  display: inline-block;
  position: relative;
}

.popover-trigger {
  display: inline-block;
  width: 100%;
}

.popover-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: transparent;
}

.popover-content {
  position: fixed;
  z-index: 1000;
  background: var(--popover-bg-color, #fff);
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 0;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
  width: fit-content;
}

.popover-title {
  padding: 8px 16px;
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  border-bottom: 1px solid #e4e7ed;
  background: #f5f7fa;
}

.popover-body {
  padding: 12px 16px;
  color: #606266;
}

.popover-footer {
  padding: 8px 16px;
  border-top: 1px solid #e4e7ed;
  background: #f5f7fa;
  text-align: right;
}

/* 箭头样式 */
.popover-content::before,
.popover-content::after {
  content: "";
  position: absolute;
  width: 0;
  height: 0;
  border: solid transparent;
}

.popover-content::before {
  border-width: 7px;
}

.popover-content::after {
  border-width: 6px;
}

/* 顶部箭头 */
.popover-top::before {
  top: 100%;
  left: 50%;
  margin-left: -7px;
  border-top-color: #e4e7ed;
}

.popover-top::after {
  top: 100%;
  left: 50%;
  margin-left: -6px;
  border-top-color: var(--popover-bg-color, #fff);
}

/* 底部箭头 */
.popover-bottom::before {
  bottom: 100%;
  left: 50%;
  margin-left: -7px;
  border-bottom-color: #e4e7ed;
}

.popover-bottom::after {
  bottom: 100%;
  left: 50%;
  margin-left: -6px;
  border-bottom-color: var(--popover-bg-color, #fff);
}

/* 左侧箭头 */
.popover-left::before {
  left: 100%;
  top: 50%;
  margin-top: -7px;
  border-left-color: #e4e7ed;
}

.popover-left::after {
  left: 100%;
  top: 50%;
  margin-top: -6px;
  border-left-color: var(--popover-bg-color, #fff);
}

/* 右侧箭头 */
.popover-right::before {
  right: 100%;
  top: 50%;
  margin-top: -7px;
  border-right-color: #e4e7ed;
}

.popover-right::after {
  right: 100%;
  top: 50%;
  margin-top: -6px;
  border-right-color: var(--popover-bg-color, #fff);
}

/* 过渡动画 */
.popover-fade-enter-active,
.popover-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.popover-fade-enter-from,
.popover-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.popover-fade-enter-to,
.popover-fade-leave-from {
  opacity: 1;
  transform: scale(1);
}

/* 不同主题色 */
.popover-content.theme-dark {
  background: #303133;
  border-color: #4c4d4f;
  color: #fff;
}

.popover-content.theme-dark .popover-title {
  color: #fff;
  border-bottom-color: #4c4d4f;
}

.popover-content.theme-dark .popover-body {
  color: #e4e7ed;
}

.popover-content.theme-dark .popover-footer {
  border-top-color: #4c4d4f;
}
</style>
