<template>
  <Transition name="modal" appear>
    <div class="modal" v-if="visible" :style="modalStyle">
      <Transition name="mask" appear>
        <div
          class="mask"
          :style="maskStyle"
          @click="handleMaskClick"
          v-if="visible && showMask"
        ></div>
      </Transition>
      <Transition name="modal-content" appear>
        <div class="content" :style="contentStyle" v-if="visible">
          <div class="header" v-if="title || $slots.header">
            <slot name="header">
              <div class="title">{{ title }}</div>
            </slot>
            <div class="close-btn" v-if="showClose" @click="handleClose">×</div>
          </div>
          <div
            class="standalone-close-btn"
            v-if="showClose && !title && !$slots.header"
            @click="handleClose"
          >
            ×
          </div>
          <div class="body" :style="bodyStyle">
            <slot name="default"></slot>
          </div>
          <div class="footer" v-if="$slots.footer || showDefaultFooter">
            <slot name="footer">
              <div class="buttons" v-if="showDefaultFooter">
                <div class="button cancel" @click="handleCancelClick">
                  {{ cancelText }}
                </div>
                <div
                  class="button confirm"
                  :class="{ disabled: confirmDisabled }"
                  @click="handleConfirmClick"
                  :style="{ pointerEvents: confirmDisabled ? 'none' : 'auto' }"
                >
                  {{ confirmText }}
                </div>
              </div>
            </slot>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script>
export default {
  name: "NEUIModal",
  props: {
    title: { type: String, default: "" },
    confirmText: { type: String, default: "确定" },
    cancelText: { type: String, default: "取消" },
    visible: { type: Boolean, default: false },
    width: { type: [String, Number], default: "auto" },
    height: { type: [String, Number], default: "auto" },
    maxWidth: { type: [String, Number], default: "90vw" },
    maxHeight: { type: [String, Number], default: "90vh" },
    showClose: { type: Boolean, default: true },
    showDefaultFooter: { type: Boolean, default: true },
    maskClosable: { type: Boolean, default: true },
    teleportTo: { type: String, default: "body" },
    appendToBody: { type: Boolean, default: true },
    confirmDisabled: { type: Boolean, default: false },
    top: { type: [String, Number], default: undefined },
    centered: { type: Boolean, default: true },
    showMask: { type: Boolean, default: true },
    maskOpacity: { type: Number, default: 0.5 },
    bodyStyle: { type: [Object, Array], default: () => ({}) },
  },
  computed: {
    contentStyle() {
      const style = {};
      if (this.width)
        style.width =
          typeof this.width === "number" ? `${this.width}px` : this.width;
      if (this.height)
        style.height =
          typeof this.height === "number" ? `${this.height}px` : this.height;
      if (this.maxWidth)
        style.maxWidth =
          typeof this.maxWidth === "number"
            ? `${this.maxWidth}px`
            : this.maxWidth;
      if (this.maxHeight)
        style.maxHeight =
          typeof this.maxHeight === "number"
            ? `${this.maxHeight}px`
            : this.maxHeight;
      if (this.top !== undefined) {
        style.marginTop =
          typeof this.top === "number" ? `${this.top}px` : this.top;
        style.alignSelf = "flex-start";
      }
      return style;
    },
    modalStyle() {
      const style = {};
      if (this.top !== undefined) {
        style.alignItems = "flex-start";
        style.paddingTop = "0";
      } else if (!this.centered) {
        style.alignItems = "flex-start";
        style.paddingTop = "10vh";
      }
      return style;
    },
    maskStyle() {
      return { backgroundColor: `rgba(0, 0, 0, ${this.maskOpacity})` };
    },
  },
  methods: {
    handleMaskClick() {
      if (this.maskClosable) this.handleClose();
    },
    handleConfirmClick() {
      if (!this.confirmDisabled) this.$emit("confirm");
    },
    handleCancelClick() {
      this.$emit("cancel");
    },
    handleClose() {
      this.$emit("close");
      this.$emit("cancel");
      this.$emit("update:visible", false);
    },
  },
  mounted() {
    if (this.appendToBody) {
      try {
        const target = document.querySelector(this.teleportTo) || document.body;
        if (this.$el && target && this.$el.parentNode !== target) {
          target.appendChild(this.$el);
        }
      } catch (e) {
        console.error(e);
      }
    }
  },
  beforeDestroy() {
    if (this.appendToBody) {
      try {
        if (this.$el && this.$el.parentNode) {
          this.$el.parentNode.removeChild(this.$el);
        }
      } catch (e) {
        console.error(e);
      }
    }
  },
};
</script>

<style scoped>
/* 弹窗容器动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* 遮罩层动画 */
.mask-enter-active,
.mask-leave-active {
  transition: opacity 0.3s ease;
}

.mask-enter-from,
.mask-leave-to {
  opacity: 0;
}

/* 内容区域动画 */
.modal-content-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-content-leave-active {
  transition: all 0.2s ease-in;
}

.modal-content-enter-from {
  opacity: 0;
  transform: scale(0.7) translateY(-20px);
}

.modal-content-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.modal {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.mask {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  touch-action: none;
}

.content {
  position: relative;
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-width: 320px;
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 6px;
}

.header {
  position: relative;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  font-size: 16px;
  font-weight: 500;
  color: #000;
  margin: 0;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 22px;
  color: #999;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: #f5f5f5;
  color: #666;
}

/* 独立关闭按钮样式 */
.standalone-close-btn {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 24px;
  color: #999;
  border-radius: 50%;
  transition: all 0.2s;
  z-index: 10;
}

.standalone-close-btn:hover {
  color: #666;
}

.body {
  flex: 1;
  padding: 0px 20px;
  color: #000;
}

.footer {
  padding: 12px 20px 20px;
}

.buttons {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
}

.button {
  padding: 4px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  border: 1px solid #d9d9d9;
  background: #fff;
}

.button:hover {
  opacity: 0.8;
}

.cancel {
  color: #666;
}

.confirm {
  background-color: #1890ff;
  border-color: #1890ff;
  color: #fff;
}

.confirm:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.confirm.disabled {
  background-color: #f5f5f5;
  border-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.confirm.disabled:hover {
  background-color: #f5f5f5;
  border-color: #d9d9d9;
  color: #bfbfbf;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content {
    margin: 20px;
    max-width: calc(100vw - 40px);
    max-height: calc(100vh - 40px);
  }

  .body {
    padding: 16px;
  }

  .header {
    padding: 12px 16px;
  }

  .footer {
    padding: 8px 16px 16px;
  }

  .standalone-close-btn {
    top: 8px;
    right: 8px;
    width: 28px;
    height: 28px;
    font-size: 20px;
  }
}
</style>
