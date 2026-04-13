<template>
  <button
    class="ne-button"
    :class="[
      `ne-button--${type}`,
      {
        'ne-button--disabled': disabled || loading,
        'ne-button--block': block,
        'ne-button--round': round,
        'ne-button--plain': plain,
        'ne-button--loading': loading,
      },
      customClass,
    ]"
    :style="customStyle"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="ne-button-loading-icon"></span>
    <slot></slot>
  </button>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    type?: "default" | "primary" | "success" | "warning" | "danger";
    disabled?: boolean;
    loading?: boolean;
    block?: boolean;
    round?: boolean;
    plain?: boolean;
    customStyle?: Record<string, string | number>;
    customClass?: string | string[];
  }>(),
  {
    type: "default",
    disabled: false,
    loading: false,
    block: false,
    round: false,
    plain: false,
    customStyle: () => ({}),
    customClass: "",
  },
);

const emit = defineEmits<{
  (e: "click", event: MouseEvent): void;
}>();

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit("click", event);
  }
};
</script>

<style scoped>
.ne-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  line-height: 1;
  height: 32px;
  white-space: nowrap;
  cursor: pointer;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  color: #606266;
  text-align: center;
  box-sizing: border-box;
  outline: none;
  margin: 0;
  transition: 0.1s;
  font-weight: 500;
  padding: 8px 15px;
  font-size: 14px;
  border-radius: 4px;
}

.ne-button--primary {
  color: #fff;
  background-color: #409eff;
  border-color: #409eff;
}

.ne-button--primary:hover {
  background: #66b1ff;
  border-color: #66b1ff;
  color: #fff;
}

.ne-button--success {
  color: #fff;
  background-color: #67c23a;
  border-color: #67c23a;
}

.ne-button--success:hover {
  background: #85ce61;
  border-color: #85ce61;
  color: #fff;
}

.ne-button--warning {
  color: #fff;
  background-color: #e6a23c;
  border-color: #e6a23c;
}

.ne-button--warning:hover {
  background: #ebb563;
  border-color: #ebb563;
  color: #fff;
}

.ne-button--danger {
  color: #fff;
  background-color: #f56c6c;
  border-color: #f56c6c;
}

.ne-button--danger:hover {
  background: #f78989;
  border-color: #f78989;
  color: #fff;
}

.ne-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ne-button--disabled:hover {
  color: #606266;
  border-color: #dcdfe6;
  background-color: #fff;
}

.ne-button--block {
  display: block;
  width: 100%;
}

.ne-button--round {
  border-radius: 20px;
}

.ne-button--plain {
  background: transparent;
}

.ne-button--plain.ne-button--primary {
  color: #409eff;
}

.ne-button--plain.ne-button--success {
  color: #67c23a;
}

.ne-button--plain.ne-button--warning {
  color: #e6a23c;
}

.ne-button--plain.ne-button--danger {
  color: #f56c6c;
}

.ne-button--loading {
  cursor: not-allowed;
}

.ne-button-loading-icon {
  width: 12px;
  height: 12px;
  margin-right: 6px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  animation: button-spin 0.8s linear infinite;
  flex-shrink: 0;
}

.ne-button--default .ne-button-loading-icon {
  border-color: rgba(0, 0, 0, 0.15);
  border-top-color: #606266;
}

@keyframes button-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
