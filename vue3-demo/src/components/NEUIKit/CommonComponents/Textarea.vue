<template>
  <div
    class="textarea-wrapper"
    :style="textareaWrapperStyle"
    :class="{ 'is-disabled': disabled }"
  >
    <textarea
      ref="textareaRef"
      :id="id"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :maxlength="maxlength"
      :style="computedTextareaStyle"
      :rows="currentRows"
      class="textarea"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
      @compositionstart="handleCompositionStart"
      @compositionend="handleCompositionEnd"
    ></textarea>
    <span
      class="textarea-clear"
      v-if="modelValue && showClear"
      @mousedown.prevent
      @click="clearInput()"
    >
      <svg
        fill-rule="evenodd"
        viewBox="64 64 896 896"
        focusable="false"
        data-icon="close-circle"
        width="1em"
        height="1em"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          d="M512 64c247.4 0 448 200.6 448 448S759.4 960 512 960 64 759.4 64 512 264.6 64 512 64zm127.98 274.82h-.04l-.08.06L512 466.75 384.14 338.88c-.04-.05-.06-.06-.08-.06a.12.12 0 00-.07 0c-.03 0-.05.01-.09.05l-45.02 45.02a.2.2 0 00-.05.09.12.12 0 000 .07v.02a.27.27 0 00.06.06L466.75 512 338.88 639.86c-.05.04-.06.06-.06.08a.12.12 0 000 .07c0 .03.01.05.05.09l45.02 45.02a.2.2 0 00.09.05.12.12 0 00.07 0c.02 0 .04-.01.08-.05L512 557.25l127.86 127.87c.04.04.06.05.08.05a.12.12 0 00.07 0c.03 0 .05-.01.09-.05l45.02-45.02a.2.2 0 00.05-.09.12.12 0 000-.07v-.02a.27.27 0 00-.05-.06L557.25 512l127.87-127.86c.04-.04.05-.06.05-.08a.12.12 0 000-.07c0-.03-.01-.05-.05-.09l-45.02-45.02a.2.2 0 00-.09-.05.12.12 0 00-.07 0z"
        ></path>
      </svg>
    </span>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, nextTick, computed, StyleValue } from "vue";

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: "",
  },
  placeholder: {
    type: String,
    default: "请输入",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  maxlength: {
    type: Number,
    default: undefined,
  },
  showClear: {
    type: Boolean,
    default: false,
  },
  textareaStyle: {
    type: Object,
    default: () => ({}),
  },
  textareaWrapperStyle: {
    type: Object,
    default: () => ({}),
  },
  id: {
    type: String,
    default: "",
  },
  focus: {
    type: Boolean,
    default: false,
  },
  autoResize: {
    type: Boolean,
    default: true,
  },
  minRows: {
    type: Number,
    default: 1,
  },
  maxRows: {
    type: Number,
    default: 4,
  },
});

const emit = defineEmits([
  "update:modelValue",
  "focus",
  "blur",
  "clear",
  "confirm",
  "input",
]);

const textareaRef = ref<HTMLTextAreaElement>();
const currentRows = ref(props.minRows);
const isComposing = ref(false); // 添加组合输入状态跟踪

// 计算textarea样式
const computedTextareaStyle = computed(() => {
  const baseStyle = {
    resize: props.autoResize ? "none" : "vertical",
    ...props.textareaStyle,
  };

  if (props.autoResize) {
    // 当达到最大行数时，允许滚动
    if (currentRows.value >= props.maxRows) {
      //@ts-ignore
      baseStyle.overflowY = "auto";
    } else {
      //@ts-ignore
      baseStyle.overflow = "hidden";
    }
  }

  return baseStyle;
}) as unknown as StyleValue;

// 监听 focus prop 的变化
watch(
  () => props.focus,
  async (newFocus) => {
    if (newFocus && textareaRef.value) {
      await nextTick();
      textareaRef.value.focus();
    }
  },
  { immediate: true }
);

// 自动调整高度
const adjustHeight = () => {
  if (!props.autoResize || !textareaRef.value) return;

  const textarea = textareaRef.value;
  const value = textarea.value || "";

  // 获取样式信息
  const computedStyle = getComputedStyle(textarea);
  const lineHeight = parseInt(computedStyle.lineHeight) || 20;
  const paddingTop = parseInt(computedStyle.paddingTop) || 0;
  const paddingBottom = parseInt(computedStyle.paddingBottom) || 0;
  const borderTop = parseInt(computedStyle.borderTopWidth) || 0;
  const borderBottom = parseInt(computedStyle.borderBottomWidth) || 0;

  // 计算实际需要的行数（基于换行符）
  const lines = value.split("\n");
  let actualRows = Math.max(lines.length, props.minRows);

  // 只有当内容不为空时才检查是否需要额外的行
  if (value.trim()) {
    // 临时设置为单行高度来测量内容
    const singleLineHeight =
      lineHeight + paddingTop + paddingBottom + borderTop + borderBottom;
    textarea.style.height = `${singleLineHeight}px`;

    // 如果scrollHeight大于单行高度，说明需要更多行
    if (textarea.scrollHeight > singleLineHeight) {
      const contentHeight =
        textarea.scrollHeight -
        paddingTop -
        paddingBottom -
        borderTop -
        borderBottom;
      const calculatedRows = Math.ceil(contentHeight / lineHeight);
      actualRows = Math.max(actualRows, calculatedRows);
    }
  }

  // 限制在最小和最大行数之间
  const newRows = Math.max(props.minRows, Math.min(actualRows, props.maxRows));
  currentRows.value = newRows;

  // 设置最终高度
  const newHeight =
    newRows * lineHeight +
    paddingTop +
    paddingBottom +
    borderTop +
    borderBottom;
  textarea.style.height = `${newHeight}px`;
};

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  emit("update:modelValue", target.value);
  emit("input", event);

  // 自动调整高度
  nextTick(() => {
    adjustHeight();
  });
};

const handleFocus = (event: FocusEvent) => {
  emit("focus", event);
};

const handleBlur = (event: FocusEvent) => {
  emit("blur", event);
};

const clearInput = () => {
  emit("update:modelValue", "");
  emit("clear");

  // 清空后重置高度
  nextTick(() => {
    adjustHeight();
  });
};

const handleKeydown = (event: KeyboardEvent) => {
  // 如果正在组合输入（如中文输入法），不处理Enter键
  if (isComposing.value) {
    return;
  }

  // Enter 键发送消息
  if (
    event.key === "Enter" &&
    !event.shiftKey &&
    !event.ctrlKey &&
    !event.metaKey
  ) {
    event.preventDefault();
    emit("confirm", props.modelValue);
    return;
  }

  // Shift + Enter 换行（默认行为，不阻止）
  // Ctrl/Cmd + Enter 也可以发送消息（备用方式）
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    emit("confirm", props.modelValue);
  }
};

// 处理组合输入开始（中文输入法开始输入）
const handleCompositionStart = () => {
  isComposing.value = true;
};

// 处理组合输入结束（中文输入法输入完成）
const handleCompositionEnd = () => {
  isComposing.value = false;
};

// 监听内容变化，调整高度
watch(
  () => props.modelValue,
  () => {
    nextTick(() => {
      adjustHeight();
    });
  },
  { immediate: true }
);

defineExpose({
  focus: () => {
    textareaRef.value?.focus();
  },
  blur: () => {
    textareaRef.value?.blur();
  },
  textareaRef,
});
</script>

<style scoped>
.textarea-wrapper {
  position: relative;
  display: inline-flex;
  width: 100%;
  align-items: flex-start;
  font-size: 16px;
}

.textarea {
  width: 100%;
  border: none;
  border-radius: 4px;
  transition: border-color 0.2s;
  outline: none;
  box-sizing: border-box;
  color: #000;
  font-size: 14px;
  padding: 8px 12px;
  line-height: 20px;
  font-family: inherit;
  background: transparent;
  resize: none;
  min-height: 20px;
}

.textarea:focus {
  border-color: #409eff;
}

.textarea:hover {
  border-color: #c0c4cc;
}

.textarea::placeholder {
  color: #c0c4cc;
}

.is-disabled .textarea {
  background-color: #fff;
  border-color: #e4e7ed;
  color: #c0c4cc;
  cursor: not-allowed;
}

.textarea-clear {
  position: absolute;
  top: 8px;
  right: 10px;
  cursor: pointer;
  color: #c0c4cc;
  font-size: 15px;
  border-radius: 50%;
  text-align: center;
}
</style>
