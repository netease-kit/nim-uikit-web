<template>
  <div class="bottom-popup" v-if="modelValue">
    <div class="popup-mask" @click="handleCancel"></div>
    <div class="popup-content">
      <div class="popup-header" v-if="showHeader">
        <div class="cancel-btn" v-if="showCancel" @click="handleCancel">
          {{ t("cancelText") }}
        </div>
        <div class="confirm-btn" v-if="showConfirm" @click="handleConfirm">
          {{ t("okText") }}
        </div>
      </div>
      <div class="popup-body">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { t } from "../utils/i18n";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    showHeader?: boolean; // 是否显示头部
    showCancel?: boolean; // 是否显示取消按钮
    showConfirm?: boolean; // 是否显示确定按钮
  }>(),
  {
    showHeader: true,
    showCancel: true,
    showConfirm: true,
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "confirm"): void;
  (e: "cancel"): void;
}>();

const handleConfirm = () => {
  emit("confirm");
  emit("update:modelValue", false);
};

const handleCancel = () => {
  emit("cancel");
  emit("update:modelValue", false);
};
</script>

<style scoped>
.bottom-popup {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 9999;
}

.popup-mask {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
}

.popup-content {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #fff;
  border-radius: 12px 12px 0 0;
  transform: translateY(0);
  transition: transform 0.3s;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.cancel-btn {
  color: #999;
  font-size: 16px;
}

.confirm-btn {
  color: #337eff;
  font-size: 16px;
}

.popup-body {
  padding: 16px;
}
</style>
