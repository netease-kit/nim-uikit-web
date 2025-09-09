<template>
  <div v-if="visible" class="new-msg-tip" @click="handleClick">
    <div class="new-msg-tip-content">
      <span>{{ t("receiveText") }}</span>
      <Icon type="icon-down-arrow" :size="16" />
    </div>
  </div>
</template>

<script lang="ts" setup>
/** 新消息提示组件 */
import { t } from "../../utils/i18n";
import Icon from "../../CommonComponents/Icon.vue";

withDefaults(
  defineProps<{
    visible: boolean;
  }>(),
  {
    visible: false,
  }
);

const emit = defineEmits<{
  click: [];
}>();

const handleClick = () => {
  emit("click");
};
</script>

<style scoped>
.new-msg-tip {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  cursor: pointer;
  animation: slideUp 0.3s ease-out;
}

.new-msg-tip-content {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  color: #000;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(51, 126, 255, 0.3);
  transition: all 0.2s ease;
  white-space: nowrap;
}

.new-msg-tip:hover .new-msg-tip-content {
  background: #ebeff1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(51, 126, 255, 0.4);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
