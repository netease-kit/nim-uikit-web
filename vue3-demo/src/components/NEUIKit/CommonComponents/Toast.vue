<template>
  <transition name="fade">
    <div v-if="visible" class="toast-container">
      <div class="toast-content" :class="type">
        <div class="toast-icon-container">
          <Icon
            v-if="type === 'success'"
            type="icon-success"
            :size="16"
            class="toast-icon"
          />
          <Icon
            v-else-if="type === 'error'"
            type="icon-error"
            :size="16"
            class="toast-icon"
          />
          <Icon
            v-else-if="type === 'warning' || type === 'info'"
            type="icon-warning"
            :size="16"
            class="toast-icon"
          />
        </div>
        <div class="toast-text">{{ message }}</div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import Icon from "./Icon.vue";

const props = defineProps({
  message: {
    type: String,
    default: "",
  },
  duration: {
    type: Number,
    default: 2000,
  },
  type: {
    type: String,
    default: "info",
    validator: (value: string) => {
      return ["info", "success", "warning", "error"].includes(value);
    },
  },
});

const visible = ref(false);
let timer: ReturnType<typeof setTimeout> | null = null;

const show = () => {
  visible.value = true;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    visible.value = false;
  }, props.duration);
};

onMounted(() => {
  show();
});

onUnmounted(() => {
  if (timer) clearTimeout(timer);
});
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 5%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999999999999;
  pointer-events: none;
  border-radius: 2px;
  box-shadow: 0px 4px 7px rgba(133, 136, 140, 0.25);
}

.toast-content {
  padding: 10px 20px;
  border-radius: 4px;
  background-color: #fff;
  color: #000;
  font-size: 14px;
  text-align: center;
  max-width: 400px;
  word-break: break-word;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.toast-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.toast-text {
  height: 20px;
  line-height: 20px;
}

/* 类型样式 */
.info {
  background-color: #fff;
}

.success {
  background-color: #fff;
}

.warning {
  background-color: #fff;
}

.error {
  background-color: #fff;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.toast-icon-container {
  height: 20px;
  padding: 2px 0;
  line-height: 20px;
}
</style>
