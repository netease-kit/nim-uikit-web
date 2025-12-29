<template>
  <div>
    <div :class="inputClass">
      <slot name="addonBefore" />
      <input
        class="input"
        :type="type"
        :value="inputValue"
        @input="handleInput"
        :focus="inputFocus"
        @focus="handleFocus"
        @blur="handleBlur"
        :placeholder="placeholder"
        :maxlength="maxlength"
      />
      <div class="clear-icon" @click="clearInput()">
        <icon v-show="modelValue && allowClear" type="clear" size="16" />
      </div>
      <slot name="addonAfter" />
    </div>

    <div v-if="inputError && rule" class="error-tips">{{ rule.message }}</div>
  </div>
</template>

<script>
import Icon from "./Icon.vue";

export default {
  name: "FormInput",
  components: { Icon },
  model: { prop: "modelValue", event: "update:modelValue" },
  props: {
    className: { type: String, default: "" },
    type: { type: String, default: "text" },
    modelValue: { type: String, default: "" },
    placeholder: { type: String, default: "" },
    allowClear: { type: Boolean, default: false },
    rule: { type: Object, default: null },
    maxlength: { type: Number, default: 140 },
  },
  data() {
    return {
      inputFocus: false,
      inputError: false,
    };
  },
  computed: {
    inputClass() {
      return [
        this.className,
        "form-input-item",
        { focus: this.inputFocus, error: this.inputError },
      ];
    },
    inputValue() {
      return this.modelValue || "";
    },
  },
  methods: {
    handleBlur(event) {
      this.inputFocus = false;
      if (this.rule && this.rule.trigger === "blur") {
        this.inputError = !this.rule.reg.test(this.modelValue || "");
      }
      this.$emit("blur", event);
    },
    handleFocus(event) {
      this.inputFocus = true;
      this.$emit("blur", event);
    },
    handleInput(event) {
      const val = event && event.target ? event.target.value : "";
      if (!(this.maxlength && val.length > this.maxlength)) {
        this.$emit("update:modelValue", val);
        this.$emit("input", val);
      }
    },
    clearInput() {
      this.$emit("update:modelValue", null);
      this.$emit("input", null);
      this.inputFocus = true;
    },
  },
};
</script>

<style scoped>
/* 表单输入项基础样式 */
.form-input-item {
  border-bottom: 1px solid #dcdfe5;
  padding: 10px 10px 5px 0;
  display: flex;
  height: 44px;
  align-items: center;
}

/* 表单输入项聚焦状态 */
.form-input-item.focus {
  border-color: #337eff;
}

/* 表单输入项错误状态 */
.form-input-item.error {
  border-color: #f56c6c;
}

/* 输入框 */
.input {
  flex: 1;
  height: 30px;
  border: none;
  outline: none;
}

/* 清除图标 */
.clear-icon {
  width: 40px;
  text-align: right;
}

/* 错误提示 */
.error-tips {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 5px;
}
</style>
