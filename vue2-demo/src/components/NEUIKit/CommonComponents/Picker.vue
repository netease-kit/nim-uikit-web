<template>
  <div class="picker" ref="triggerRef">
    <div class="picker-input" :class="{ disabled }" @click="toggle">
      <span class="picker-input-text">{{ selectedLabel }}</span>
      <span class="picker-arrow" :class="{ open: visible }"></span>
    </div>
    <transition name="picker-menu">
      <ul v-show="visible" class="picker-menu" @click.stop>
        <li
          v-for="(opt, i) in options"
          :key="`picker-opt-${i}`"
          class="picker-option"
          :class="{ active: i === selectedIndex }"
          @click="select(i)"
        >
          {{ opt.label }}
        </li>
      </ul>
    </transition>
  </div>
</template>

<script>
import { t } from "../utils/i18n";

export default {
  name: "NEUIPicker",
  props: {
    value: { type: [Number, String], default: 0 },
    range: { type: Array, default: () => [] },
    disabled: { type: Boolean, default: false },
  },
  data() {
    return {
      visible: false,
    };
  },
  computed: {
    defaultText() {
      return t("chooseText");
    },
    options() {
      return (this.range || []).map((item) =>
        item && typeof item === "object" && "label" in item && "value" in item
          ? item
          : { label: String(item), value: item }
      );
    },
    selectedIndex() {
      const v = this.value;
      if (typeof v === "number") {
        const max = Math.max(this.options.length - 1, 0);
        return Math.min(Math.max(v, 0), max);
      }
      const idx = this.options.findIndex((opt) => opt.value === v);
      return idx >= 0 ? idx : 0;
    },
    selectedLabel() {
      const opt = this.options[this.selectedIndex];
      return (opt && opt.label) || this.defaultText;
    },
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeDestroy() {
    document.removeEventListener("click", this.handleClickOutside);
  },
  methods: {
    toggle() {
      if (this.disabled) return;
      this.visible = !this.visible;
      this.$emit(this.visible ? "open" : "close");
    },
    select(idx) {
      const picked = this.options[idx] && this.options[idx].value;
      this.$emit("change", { detail: { value: picked } });
      this.visible = false;
    },
    handleClickOutside(e) {
      const el = this.$refs.triggerRef;
      if (!el) return;
      if (!el.contains(e.target)) {
        this.visible = false;
      }
    },
    t,
  },
};
</script>

<style scoped>
.picker {
  position: relative;
  width: 100%;
}

/* 输入框样式 */
.picker-input {
  width: 100%;
  height: 36px;
  border-radius: 3px;
  background-color: #f1f5f8;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  cursor: pointer;
}
.picker-input:hover {
  border-color: #bfc7d3;
}
.picker-input.disabled {
  background: #f5f6f8;
  color: #bfbfbf;
  cursor: not-allowed;
}
.picker-input-text {
  color: #000;
  font-size: 14px;
}

/* 箭头 */
.picker-arrow {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid #999;
  transition: transform 0.12s ease;
}
.picker-arrow.open {
  transform: rotate(180deg);
}

/* 下拉菜单：相对容器定位 */
.picker-menu {
  position: absolute;
  left: 0;
  top: calc(100% + 4px);
  min-width: 100%;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  padding: 6px 0;
  margin: 0;
  list-style: none;
  z-index: 2000;
}
.picker-option {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}
.picker-option:hover {
  background-color: #f5f5f5;
}
.picker-option.active {
  color: #1976d2;
  background-color: #e3f2fd;
}

/* 动画 */
.picker-menu-enter-active,
.picker-menu-leave-active {
  transition: all 0.12s ease;
}
.picker-menu-enter-from,
.picker-menu-leave-to {
  opacity: 0;
  transform: translateY(-2px);
}
</style>
