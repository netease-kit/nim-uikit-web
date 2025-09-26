<template>
  <div>
    <div :class="inputClass">
      <slot name="addonBefore" />
      <Input
        class="input"
        :type="type"
        :modelValue="value"
        @input="handleInput"
        @blur="handleBlur"
        @clear="clearInput"
        :maxlength="maxlength"
        :showClear="value?.length > 0"
        :inputStyle="{
          fontSize: '16px',
        }"
        :inputWrapperStyle="{
          backgroundColor: '#fff',
        }"
        :placeholder="placeholder"
      />
      <slot name="addonAfter" />
    </div>
    <div v-if="inputError && rule" class="error-tips">{{ rule.message }}</div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import Input from "../../CommonComponents/Input.vue";
const emit = defineEmits(["updateModelValue"]);
const props = defineProps({
  className: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "text",
  },
  value: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "",
  },
  allowClear: {
    type: Boolean,
    default: false,
  },
  rule: {
    type: Object,
    default: null,
  },
  maxlength: {
    type: Number,
    default: 11,
  },
});

const inputFocus = ref(false);
const inputError = ref(false);
// use key to force refresh input
// const inputKey = ref(0);

const inputClass = computed(() => {
  return [
    props.className,
    "form-input-item",
    { focus: inputFocus.value, error: inputError.value },
  ];
});

const handleInput = (event) => {
  let inputValue = event.target.value;

  if (props.type === "tel") {
    inputValue = inputValue.replace(/\D/g, "");
  }
  emit("updateModelValue", inputValue);
  // inputKey.value++;
};

const handleBlur = () => {
  inputFocus.value = false;
  if (props.rule && props.rule.trigger === "blur") {
    inputError.value = !props.rule.reg.test(props.value || "");
  }
};

const clearInput = () => {
  emit("updateModelValue", null);
  inputFocus.value = true;
};
</script>

<style scoped>
.form-input-item {
  border-bottom: 1px solid #dcdfe5;
  padding: 10px 10px 5px 0px;
  display: flex;
  height: 44px;
  align-items: center;
}

.form-input-item.focus {
  border-color: #337eff;
}

.form-input-item.error {
  border-color: #f56c6c;
}

.input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  color: #333;
}

.error-tips {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 5px;
}
</style>
