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

<script lang="ts" setup>
import { computed, type CSSProperties } from "vue";

type PlacementType = "left" | "right" | "top" | "bottom";

interface Props {
  title?: string;
  confirmText?: string;
  cancelText?: string;
  visible: boolean;
  width?: string | number;
  height?: string | number;
  showClose?: boolean;
  showDefaultFooter?: boolean;
  showHeader?: boolean;
  showMask?: boolean;
  maskClosable?: boolean;
  teleportTo?: string;
  confirmDisabled?: boolean;
  placement?: PlacementType;
  destroyOnClose?: boolean;
  offsetRight?: string | number;
  offsetLeft?: string | number;
  offsetTop?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  confirmText: "确定",
  cancelText: "取消",
  visible: false,
  width: 300,
  height: "100%",
  showClose: true,
  showDefaultFooter: false,
  showHeader: false,
  showMask: true,
  maskClosable: true,
  teleportTo: "",
  confirmDisabled: false,
  placement: "right",
  destroyOnClose: false,
  offsetRight: 0,
  offsetLeft: 0,
  offsetTop: 0,
});

const emit = defineEmits<{
  confirm: [];
  cancel: [];
  close: [];
  "update:visible": [value: boolean];
  headerClick: [];
}>();

// 计算内容样式
const contentStyle = computed((): CSSProperties => {
  const style: CSSProperties = {};

  if (props.placement === "left" || props.placement === "right") {
    style.width =
      typeof props.width === "number" ? `${props.width}px` : props.width;
    style.height =
      typeof props.height === "number" ? `${props.height}px` : props.height;
  } else {
    style.height =
      typeof props.height === "number" ? `${props.height}px` : props.height;
    style.width = "100%";
  }

  return style;
});

// 计算drawer容器样式
const drawerStyle = computed((): CSSProperties => {
  if (props.teleportTo) {
    const style: CSSProperties = {
      position: "fixed",
      top:
        typeof props.offsetTop === "number"
          ? `${props.offsetTop}px`
          : props.offsetTop,
      bottom: 0,
      zIndex: 9999,
    };

    if (props.placement === "left") {
      style.left =
        typeof props.offsetLeft === "number"
          ? `${props.offsetLeft}px`
          : props.offsetLeft;
      style.right = 0;
    } else {
      style.right =
        typeof props.offsetRight === "number"
          ? `${props.offsetRight}px`
          : props.offsetRight;
      style.left = 0;
    }

    return style;
  }

  const style: CSSProperties = {
    zIndex: 9999,
    top:
      typeof props.offsetTop === "number"
        ? `${props.offsetTop}px`
        : props.offsetTop,
  };

  if (props.placement === "left") {
    style.left =
      typeof props.offsetLeft === "number"
        ? `${props.offsetLeft}px`
        : props.offsetLeft;
  } else {
    style.right =
      typeof props.offsetRight === "number"
        ? `${props.offsetRight}px`
        : props.offsetRight;
  }

  return style;
});

// 计算动画样式
const contentAnimationStyle = computed((): CSSProperties => {
  const style: CSSProperties = {};

  if (props.placement === "right" && props.offsetRight) {
    const offsetValue =
      typeof props.offsetRight === "number"
        ? props.offsetRight
        : parseInt(props.offsetRight.toString());
    style["--drawer-offset-right"] = `${offsetValue}px`;
  }

  if (props.placement === "left" && props.offsetLeft) {
    const offsetValue =
      typeof props.offsetLeft === "number"
        ? props.offsetLeft
        : parseInt(props.offsetLeft.toString());
    style["--drawer-offset-left"] = `${offsetValue}px`;
  }

  return style;
});

// 事件处理函数
const handleClose = () => {
  emit("close");
  emit("update:visible", false);
};

const handleConfirmClick = () => {
  if (!props.confirmDisabled) {
    emit("confirm");
  }
};

const handleCancelClick = () => {
  emit("cancel");
  handleClose();
};

const handleMaskClick = () => {
  if (props.maskClosable) {
    handleClose();
  }
};

const handleHeaderClick = () => {
  emit("headerClick");
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
