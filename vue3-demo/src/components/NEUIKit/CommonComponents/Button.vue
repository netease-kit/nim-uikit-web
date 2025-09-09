<template>
  <button
    class="ne-button"
    :class="[
      `ne-button--${type}`,
      {
        'ne-button--disabled': disabled,
        'ne-button--block': block,
        'ne-button--round': round,
        'ne-button--plain': plain,
      },
      customClass,
    ]"
    :style="customStyle"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot></slot>
  </button>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    type?: "default" | "primary" | "success" | "warning" | "danger";
    disabled?: boolean;
    block?: boolean;
    round?: boolean;
    plain?: boolean;
    customStyle?: Record<string, string | number>;
    customClass?: string | string[];
  }>(),
  {
    type: "default",
    disabled: false,
    block: false,
    round: false,
    plain: false,
    customStyle: () => ({}),
    customClass: "",
  }
);

const emit = defineEmits<{
  (e: "click", event: MouseEvent): void;
}>();

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
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
</style>
