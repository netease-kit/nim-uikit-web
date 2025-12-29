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

<script>
export default {
  name: "NEUITextarea",
  model: { prop: "modelValue", event: "update:modelValue" },
  props: {
    modelValue: { type: [String, Number], default: "" },
    placeholder: { type: String, default: "请输入" },
    disabled: { type: Boolean, default: false },
    maxlength: { type: Number, default: undefined },
    showClear: { type: Boolean, default: false },
    textareaStyle: { type: Object, default: () => ({}) },
    textareaWrapperStyle: { type: Object, default: () => ({}) },
    id: { type: String, default: "" },
    autofocus: { type: Boolean, default: false },
    autoResize: { type: Boolean, default: true },
    minRows: { type: Number, default: 1 },
    maxRows: { type: Number, default: 4 },
  },
  data() {
    return {
      currentRows: this.minRows,
      isComposing: false,
    };
  },
  computed: {
    computedTextareaStyle() {
      const baseStyle = {
        resize: this.autoResize ? "none" : "vertical",
        ...(this.textareaStyle || {}),
      };
      if (this.autoResize) {
        if (this.currentRows >= this.maxRows) {
          baseStyle.overflowY = "auto";
        } else {
          baseStyle.overflow = "hidden";
        }
      }
      return baseStyle;
    },
    textareaRef() {
      return this.$refs.textareaRef;
    },
  },
  watch: {
    autofocus: {
      immediate: true,
      handler(newAutofocus) {
        if (newAutofocus) {
          this.$nextTick(() => {
            if (this.$refs.textareaRef) {
              this.$refs.textareaRef.focus();
            }
          });
        }
      },
    },
    modelValue: {
      immediate: true,
      handler() {
        this.$nextTick(() => {
          this.adjustHeight();
        });
      },
    },
  },
  methods: {
    adjustHeight() {
      if (!this.autoResize || !this.$refs.textareaRef) return;
      const textarea = this.$refs.textareaRef;
      const value = textarea.value || "";
      const computedStyle = getComputedStyle(textarea);
      const lineHeight = parseInt(computedStyle.lineHeight) || 20;
      const paddingTop = parseInt(computedStyle.paddingTop) || 0;
      const paddingBottom = parseInt(computedStyle.paddingBottom) || 0;
      const borderTop = parseInt(computedStyle.borderTopWidth) || 0;
      const borderBottom = parseInt(computedStyle.borderBottomWidth) || 0;
      const lines = value.split("\n");
      let actualRows = Math.max(lines.length, this.minRows);
      if (value.trim()) {
        const singleLineHeight =
          lineHeight + paddingTop + paddingBottom + borderTop + borderBottom;
        textarea.style.height = `${singleLineHeight}px`;
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
      const newRows = Math.max(
        this.minRows,
        Math.min(actualRows, this.maxRows)
      );
      this.currentRows = newRows;
      const newHeight =
        newRows * lineHeight +
        paddingTop +
        paddingBottom +
        borderTop +
        borderBottom;
      textarea.style.height = `${newHeight}px`;
    },
    handleInput(event) {
      const target = event.target;
      this.$emit("update:modelValue", target.value);
      this.$emit("input", event);
      this.$nextTick(() => {
        this.adjustHeight();
      });
    },
    handleFocus(event) {
      this.$emit("focus", event);
    },
    handleBlur(event) {
      this.$emit("blur", event);
    },
    clearInput() {
      this.$emit("update:modelValue", "");
      this.$emit("clear");
      this.$nextTick(() => {
        this.adjustHeight();
      });
    },
    handleKeydown(event) {
      if (this.isComposing) return;
      if (
        event.key === "Enter" &&
        !event.shiftKey &&
        !event.ctrlKey &&
        !event.metaKey
      ) {
        event.preventDefault();
        this.$emit("confirm", this.modelValue);
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        this.$emit("confirm", this.modelValue);
      }
    },
    handleCompositionStart() {
      this.isComposing = true;
    },
    handleCompositionEnd() {
      this.isComposing = false;
    },
    focus() {
      if (this.$refs.textareaRef && this.$refs.textareaRef.focus) {
        this.$refs.textareaRef.focus();
      }
    },
    blur() {
      if (this.$refs.textareaRef && this.$refs.textareaRef.blur) {
        this.$refs.textareaRef.blur();
      }
    },
  },
};
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
