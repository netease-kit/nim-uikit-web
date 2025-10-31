<template>
  <div class="picker" ref="triggerRef">
    <div class="picker-input" :class="{ disabled }" @click="toggle">
      <span class="picker-input-text">
        {{ options[selectedIndex]?.label ?? defaultText }}
      </span>
      <span class="picker-arrow" :class="{ open: visible }"></span>
    </div>
    <Transition name="picker-menu">
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
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { t } from "../utils/i18n";

interface RangeItem {
  label: string;
  value: string | number;
}
interface Props {
  // 支持传索引或实际值
  value?: number | string;
  // 支持 ['所有人', '管理员'] 或 [{label, value}]
  range?: Array<string | number | RangeItem>;
  disabled?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  value: 0,
  range: () => [],
  disabled: false,
});

const emit = defineEmits<{
  change: [{ detail: { value: string | number } }];
  open: [];
  close: [];
}>();

const defaultText = t("chooseText");
const visible = ref(false);
const triggerRef = ref<HTMLElement | null>(null);

// 规范化选项：统一为 { label, value }
const options = computed<RangeItem[]>(() =>
  props.range.map((item) =>
    typeof item === "object" && "label" in item && "value" in item
      ? (item as RangeItem)
      : { label: String(item), value: item as string | number }
  )
);

// 当前选中索引：兼容传入 index 或实际值
const selectedIndex = computed(() => {
  const v = props.value as any;
  if (typeof v === "number") {
    return Math.min(Math.max(v, 0), options.value.length - 1);
  }
  const idx = options.value.findIndex((opt) => opt.value === v);
  return idx >= 0 ? idx : 0;
});

const toggle = () => {
  if (props.disabled) return;
  visible.value = !visible.value;
  if (visible.value) {
    emit("open");
  } else {
    emit("close");
  }
};

const select = (idx: number) => {
  const picked = options.value[idx]?.value;
  emit("change", { detail: { value: picked } }); // 返回实际值
  visible.value = false;
};

const handleClickOutside = (e: MouseEvent) => {
  const el = triggerRef.value;
  if (!el) return;
  if (!el.contains(e.target as Node)) {
    visible.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});
onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
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
