<template>
  <div v-if="visible" class="ne-loading-mask">
    <div class="ne-loading-spinner">
      <svg class="ne-loading-circular" viewBox="25 25 50 50">
        <circle class="ne-loading-path" cx="50" cy="50" r="20" fill="none" />
      </svg>
      <p v-if="text" class="ne-loading-text">{{ text }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const visible = ref(false);
const text = ref('');

const show = (loadingText = '') => {
  text.value = loadingText;
  visible.value = true;
};

const hide = () => {
  visible.value = false;
  text.value = '';
};

defineExpose({
  show,
  hide
});
</script>

<style scoped>
.ne-loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.ne-loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ne-loading-circular {
  width: 42px;
  height: 42px;
  animation: loading-rotate 2s linear infinite;
}

.ne-loading-path {
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  stroke-width: 2;
  stroke: #409eff;
  stroke-linecap: round;
  animation: loading-dash 1.5s ease-in-out infinite;
}

.ne-loading-text {
  margin-top: 10px;
  color: #409eff;
  font-size: 14px;
}

@keyframes loading-rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes loading-dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -40px;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -120px;
  }
}
</style>