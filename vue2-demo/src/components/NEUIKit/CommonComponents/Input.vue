<template>
  <div
    class="input-wrapper"
    :style="inputWrapperStyle"
    :class="{ 'is-disabled': disabled }"
  >
    <input
      ref="inputRef"
      :id="id"
      :value="value"
      :placeholder="placeholder"
      :disabled="disabled"
      :maxlength="maxlength"
      :style="inputStyle"
      class="input"
      autocomplete="off"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @keypress="handleKeypress"
    />
    <span
      class="input-clear"
      v-if="value && showClear"
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
  name: "NEUIInput",
  model: { prop: "value", event: "input" },
  props: {
    value: { type: [String, Number], default: "" },
    placeholder: { type: String, default: "请输入" },
    disabled: { type: Boolean, default: false },
    maxlength: { type: Number, default: undefined },
    showClear: { type: Boolean, default: false },
    inputStyle: { type: Object, default: () => ({}) },
    inputWrapperStyle: { type: Object, default: () => ({}) },
    id: { type: String, default: "" },
    autofocus: { type: Boolean, default: false },
  },
  methods: {
    handleInput(event) {
      const target = event.target;
      this.$emit("input", target.value);
      this.$emit("inputEvent", event);
    },
    handleFocus(event) {
      this.$emit("focus", event);
    },
    handleBlur(event) {
      this.$emit("blur", event);
    },
    clearInput() {
      this.$emit("input", "");
      this.$emit("clear");
    },
    handleKeypress(event) {
      if (event.key === "Enter" || event.keyCode === 13) {
        event.preventDefault();
        this.$emit("confirm", this.value);
      }
    },
    focus() {
      if (this.$refs.inputRef && this.$refs.inputRef.focus) {
        this.$refs.inputRef.focus();
      }
    },
    blur() {
      if (this.$refs.inputRef && this.$refs.inputRef.blur) {
        this.$refs.inputRef.blur();
      }
    },
  },
  watch: {
    autofocus: {
      immediate: true,
      handler(newAutofocus) {
        if (newAutofocus) {
          this.$nextTick(() => {
            if (this.$refs.inputRef) {
              this.$refs.inputRef.focus();
            }
          });
        }
      },
    },
  },
};
</script>

<style scoped>
.input-wrapper {
  position: relative;
  display: inline-flex;
  width: 100%;
  align-items: center;
  font-size: 16px;
  background-color: #f1f5f8;
}

.input {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 4px;
  transition: border-color 0.2s;
  outline: none;
  box-sizing: border-box;
  color: #000;
  font-size: 14px;
  padding-left: 5px;
  white-space: nowrap;
}

.input:focus {
  border-color: #409eff;
}

.input:hover {
  border-color: #c0c4cc;
}

.input::placeholder {
  color: #c0c4cc;
}

.is-disabled .input {
  background-color: #fff;
  border-color: #e4e7ed;
  color: #c0c4cc;
  cursor: not-allowed;
}

.input-clear {
  margin-right: 10px;
  cursor: pointer;
  color: #c0c4cc;
  font-size: 15px;
  border-radius: 50%;
  text-align: center;
}
</style>
