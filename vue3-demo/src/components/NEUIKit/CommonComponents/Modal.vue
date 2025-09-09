<template>
  <Teleport to="body">
    <Transition name="modal" appear>
      <div class="modal" v-if="visible" :style="modalStyle">
        <Transition name="mask" appear>
          <div class="mask" :style="maskStyle" @click="handleMaskClick" v-if="visible && showMask"></div>
        </Transition>
        <Transition name="modal-content" appear>
          <div class="content" :style="contentStyle" v-if="visible">
            <!-- 头部标题 -->
            <div class="header" v-if="title || $slots.header">
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
              v-if="showClose && !title && !$slots.header"
              @click="handleClose"
            >
              ×
            </div>

            <!-- 中间内容插槽 -->
            <div class="body" :style="bodyStyle">
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

interface Props {
  title?: string;
  confirmText?: string;
  cancelText?: string;
  visible: boolean;
  width?: string | number;
  height?: string | number;
  maxWidth?: string | number;
  maxHeight?: string | number;
  showClose?: boolean;
  showDefaultFooter?: boolean;
  maskClosable?: boolean;
  teleportTo?: string;
  confirmDisabled?: boolean;
  // 新增：控制距离顶部的位置
  top?: string | number;
  // 新增：是否垂直居中（当设置了top时，此选项无效）
  centered?: boolean;
  // 新增：是否显示遮罩层
  showMask?: boolean;
  // 新增：遮罩层透明度 (0-1)
  maskOpacity?: number;
  // 新增：body区域的自定义样式
  bodyStyle?: CSSProperties;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  confirmText: "确定",
  cancelText: "取消",
  visible: false,
  width: "auto",
  height: "auto",
  maxWidth: "90vw",
  maxHeight: "90vh",
  showClose: true,
  showDefaultFooter: true,
  maskClosable: true,
  teleportTo: "body",
  confirmDisabled: false,
  top: undefined,
  centered: true,
  showMask: true,
  maskOpacity: 0.5,
});

const emit = defineEmits<{
  confirm: [];
  cancel: [];
  close: [];
  "update:visible": [value: boolean];
}>();

// 计算内容样式
const contentStyle = computed((): CSSProperties => {
  const style: CSSProperties = {};

  if (props.width) {
    style.width =
      typeof props.width === "number" ? `${props.width}px` : props.width;
  }

  if (props.height) {
    style.height =
      typeof props.height === "number" ? `${props.height}px` : props.height;
  }

  if (props.maxWidth) {
    style.maxWidth =
      typeof props.maxWidth === "number"
        ? `${props.maxWidth}px`
        : props.maxWidth;
  }

  if (props.maxHeight) {
    style.maxHeight =
      typeof props.maxHeight === "number"
        ? `${props.maxHeight}px`
        : props.maxHeight;
  }

  // 新增：处理顶部位置
  if (props.top !== undefined) {
    style.marginTop =
      typeof props.top === "number" ? `${props.top}px` : props.top;
    style.alignSelf = "flex-start";
  }

  return style;
});

// 计算modal容器样式
const modalStyle = computed((): CSSProperties => {
  const style: CSSProperties = {};

  // 如果设置了top，则不使用居中对齐
  if (props.top !== undefined) {
    style.alignItems = "flex-start";
    style.paddingTop = "0";
  } else if (!props.centered) {
    style.alignItems = "flex-start";
    style.paddingTop = "10vh";
  }

  return style;
});

// 计算mask样式
const maskStyle = computed((): CSSProperties => {
  return {
    backgroundColor: `rgba(0, 0, 0, ${props.maskOpacity})`,
  };
});

const handleMaskClick = () => {
  if (props.maskClosable) {
    handleClose();
  }
};

const handleConfirmClick = () => {
  if (!props.confirmDisabled) {
    emit("confirm");
  }
};

const handleCancelClick = () => {
  emit("cancel");
};

const handleClose = () => {
  emit("close");
  emit("cancel");
  emit("update:visible", false);
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
