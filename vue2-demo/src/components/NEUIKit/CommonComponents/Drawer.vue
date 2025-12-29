<template>
  <div v-if="!teleportTo">
    <Transition name="drawer" appear>
      <div class="drawer" v-if="visible" :style="drawerStyle">
        <Transition name="mask" appear>
          <div
            class="mask"
            @click="handleMaskClick"
            v-if="visible && showMask"
          ></div>
        </Transition>
        <Transition :name="`drawer-content-${placement}`" appear>
          <div
            class="content"
            :class="[`placement-${placement}`]"
            :style="[contentStyle, contentAnimationStyle]"
            v-if="visible"
          >
            <!-- 头部标题 -->
            <div
              class="header"
              v-if="showHeader && (title || $slots.header)"
              @click="handleHeaderClick"
            >
              <slot name="header">
                <div class="title">{{ title }}</div>
              </slot>
              <div class="close-btn" v-if="showClose" @click.stop="handleClose">
                ×
              </div>
            </div>

            <!-- 独立的关闭按钮（当没有header时显示） -->
            <div
              class="standalone-close-btn"
              v-if="showClose && !showHeader"
              @click="handleClose"
            >
              ×
            </div>

            <!-- 中间内容插槽 -->
            <div class="body">
              <slot name="default"></slot>
            </div>

            <!-- 底部内容插槽 -->
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
                    :style="{
                      pointerEvents: confirmDisabled ? 'none' : 'auto',
                    }"
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
  </div>
  <Teleport :to="teleportTo" v-else>
    <Transition name="drawer" appear>
      <div class="drawer" v-if="visible" :style="drawerStyle">
        <Transition name="mask" appear>
          <div class="mask" @click="handleMaskClick" v-if="visible"></div>
        </Transition>
        <Transition :name="`drawer-content-${placement}`" appear>
          <div
            class="content"
            :class="[`placement-${placement}`]"
            :style="contentStyle"
            v-if="visible"
          >
            <!-- 头部标题 -->
            <div class="header" v-if="showHeader && (title || $slots.header)">
              <slot name="header">
                <div class="title">{{ title }}</div>
              </slot>
              <div class="close-btn" v-if="showClose" @click="handleClose">
                ×
              </div>
            </div>

            <!-- 独立的关闭按钮（当没有header时显示） -->
            <div
              class="standalone-close-btn"
              v-if="showClose && !showHeader"
              @click="handleClose"
            >
              ×
            </div>

            <!-- 中间内容插槽 -->
            <div class="body">
              <slot name="default"></slot>
            </div>

            <!-- 底部内容插槽 -->
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
                    :style="{
                      pointerEvents: confirmDisabled ? 'none' : 'auto',
                    }"
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
  </Teleport>
</template>

<script>
export default {
  name: "NEUIDrawer",
  props: {
    title: { type: String, default: "" },
    confirmText: { type: String, default: "确定" },
    cancelText: { type: String, default: "取消" },
    visible: { type: Boolean, default: false },
    width: { type: [String, Number], default: 300 },
    height: { type: [String, Number], default: "100%" },
    showClose: { type: Boolean, default: true },
    showDefaultFooter: { type: Boolean, default: false },
    showHeader: { type: Boolean, default: false },
    showMask: { type: Boolean, default: true },
    maskClosable: { type: Boolean, default: true },
    teleportTo: { type: String, default: "" },
    confirmDisabled: { type: Boolean, default: false },
    placement: { type: String, default: "right" },
    destroyOnClose: { type: Boolean, default: false },
    offsetRight: { type: [String, Number], default: 0 },
    offsetLeft: { type: [String, Number], default: 0 },
    offsetTop: { type: [String, Number], default: 0 },
  },
  computed: {
    contentStyle() {
      const style = {};
      if (this.placement === "left" || this.placement === "right") {
        style.width =
          typeof this.width === "number" ? `${this.width}px` : this.width;
        style.height =
          typeof this.height === "number" ? `${this.height}px` : this.height;
      } else {
        style.height =
          typeof this.height === "number" ? `${this.height}px` : this.height;
        style.width = "100%";
      }
      return style;
    },
    drawerStyle() {
      if (this.teleportTo) {
        const style = {
          position: "fixed",
          top:
            typeof this.offsetTop === "number"
              ? `${this.offsetTop}px`
              : this.offsetTop,
          bottom: 0,
          zIndex: 9999,
        };
        if (this.placement === "left") {
          style.left =
            typeof this.offsetLeft === "number"
              ? `${this.offsetLeft}px`
              : this.offsetLeft;
          style.right = 0;
        } else {
          style.right =
            typeof this.offsetRight === "number"
              ? `${this.offsetRight}px`
              : this.offsetRight;
          style.left = 0;
        }
        return style;
      }
      const style = {
        zIndex: 9999,
        top:
          typeof this.offsetTop === "number"
            ? `${this.offsetTop}px`
            : this.offsetTop,
      };
      if (this.placement === "left") {
        style.left =
          typeof this.offsetLeft === "number"
            ? `${this.offsetLeft}px`
            : this.offsetLeft;
      } else {
        style.right =
          typeof this.offsetRight === "number"
            ? `${this.offsetRight}px`
            : this.offsetRight;
      }
      return style;
    },
    contentAnimationStyle() {
      const style = {};
      if (this.placement === "right" && this.offsetRight) {
        const offsetValue =
          typeof this.offsetRight === "number"
            ? this.offsetRight
            : parseInt(String(this.offsetRight));
        style["--drawer-offset-right"] = `${offsetValue}px`;
      }
      if (this.placement === "left" && this.offsetLeft) {
        const offsetValue =
          typeof this.offsetLeft === "number"
            ? this.offsetLeft
            : parseInt(String(this.offsetLeft));
        style["--drawer-offset-left"] = `${offsetValue}px`;
      }
      return style;
    },
  },
  methods: {
    handleClose() {
      this.$emit("close");
      this.$emit("update:visible", false);
    },
    handleConfirmClick() {
      if (!this.confirmDisabled) {
        this.$emit("confirm");
      }
    },
    handleCancelClick() {
      this.$emit("cancel");
      this.handleClose();
    },
    handleMaskClick() {
      if (this.maskClosable) {
        this.handleClose();
      }
    },
    handleHeaderClick() {
      this.$emit("headerClick");
    },
  },
};
</script>

<style scoped>
/* 整体动画 */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
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

/* 内容区域动画 - 右侧 */
.drawer-content-right-enter-active,
.drawer-content-right-leave-active {
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.drawer-content-right-enter-from {
  transform: translateX(calc(0% + var(--drawer-offset-right, 0px)));
}

.drawer-content-right-leave-to {
  transform: translateX(calc(0% + var(--drawer-offset-right, 0px)));
}

/* 内容区域动画 - 左侧 */
.drawer-content-left-enter-active,
.drawer-content-left-leave-active {
  transition: transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.drawer-content-left-enter-from {
  transform: translateX(calc(-100% - var(--drawer-offset-left, 0px)));
}

.drawer-content-left-leave-to {
  transform: translateX(calc(-100% - var(--drawer-offset-left, 0px)));
}

/* 内容区域动画 - 顶部 */
.drawer-content-top-enter-active,
.drawer-content-top-leave-active {
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.drawer-content-top-enter-from {
  transform: translateY(-100%);
}

.drawer-content-top-leave-to {
  transform: translateY(-100%);
}

/* 内容区域动画 - 底部 */
.drawer-content-bottom-enter-active,
.drawer-content-bottom-leave-active {
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.drawer-content-bottom-enter-from {
  transform: translateY(100%);
}

.drawer-content-bottom-leave-to {
  transform: translateY(100%);
}

.drawer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 260px; /* 设置左侧边界，避免覆盖会话列表 */
  display: flex;
  z-index: 9999;
}

.mask {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0; /* 改为从 drawer 容器的左边界开始 */
  background-color: transparent;
  touch-action: none;
}

/* 不同位置的内容定位 */
.placement-right {
  margin-left: auto;
  /* 保持原有的右对齐逻辑 */
}

.content {
  position: relative;
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 不同位置的内容定位 */
.placement-right {
  margin-left: auto;
}

.placement-left {
  margin-right: auto;
}

.placement-top {
  margin-bottom: auto;
}

.placement-bottom {
  margin-top: auto;
}

.header {
  position: relative;
  padding: 16px 10px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
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

.standalone-close-btn {
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
  z-index: 1;
}

.standalone-close-btn:hover {
  background-color: #f5f5f5;
  color: #666;
}

.body {
  flex: 1;
  overflow-y: auto;
}

.footer {
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.button {
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  border: 1px solid #d9d9d9;
  background-color: #fff;
  color: #333;
}

.button:hover {
  border-color: #40a9ff;
  color: #40a9ff;
}

.button.confirm {
  background-color: #1890ff;
  border-color: #1890ff;
  color: #fff;
}

.button.confirm:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.button.confirm.disabled {
  background-color: #f5f5f5;
  border-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.button.confirm.disabled:hover {
  background-color: #f5f5f5;
  border-color: #d9d9d9;
  color: #bfbfbf;
}
</style>
