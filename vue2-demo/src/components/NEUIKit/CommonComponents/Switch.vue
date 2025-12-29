<template>
  <label class="switch-wrapper" :class="{ disabled }">
    <input
      type="checkbox"
      class="switch-input"
      :checked="checked"
      :disabled="disabled"
      @change="handleChange"
    />
    <div class="switch-core"></div>
  </label>
</template>

<script>
export default {
  name: "NEUISwitch",
  props: {
    checked: { type: Boolean, required: true },
    disabled: { type: Boolean, default: false },
  },
  methods: {
    handleChange(event) {
      const value = event.target && event.target.checked;
      this.$emit("change", !!value);
    },
  },
};
</script>

<style scoped>
.switch-wrapper {
  display: inline-block;
  position: relative;
  cursor: pointer;
}

.switch-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
}

.switch-core {
  display: inline-block;
  position: relative;
  width: 44px;
  height: 22px;
  border: 1px solid #dcdfe6;
  outline: none;
  border-radius: 11px;
  box-sizing: border-box;
  background: #dcdfe6;
  cursor: pointer;
  transition: border-color 0.3s, background-color 0.3s;
}

.switch-core::after {
  content: "";
  position: absolute;
  top: 1px;
  left: 1px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: #fff;
  transition: all 0.3s;
}

.switch-input:checked + .switch-core {
  background-color: #337eff;
  border-color: #337eff;
}

.switch-input:checked + .switch-core::after {
  left: 100%;
  transform: translateX(-19px);
}

.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.disabled .switch-core {
  cursor: not-allowed;
}
</style>
