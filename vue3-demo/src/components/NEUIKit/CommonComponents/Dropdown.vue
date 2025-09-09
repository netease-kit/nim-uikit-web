<template>
  <div class="nim-dropdown" ref="dropdownRef">
    <div
      class="nim-dropdown-trigger"
      @contextmenu.prevent="handleContextMenu"
      @click="handleClick"
    >
      <slot></slot>
    </div>
    <Teleport to="body" v-if="visible">
      <Transition name="dropdown">
        <div
          v-show="visible"
          class="nim-dropdown-content"
          :style="contentStyle"
          @click="handleContentClick"
        >
          <slot name="overlay"></slot>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import type { CSSProperties } from "vue";

// 定义props
const props = withDefaults(
  defineProps<{
    trigger?: "click" | "contextmenu" | "both";
    lazy?: boolean; // 是否懒加载
    dropdownStyle?: CSSProperties;
    placement?: "top" | "bottom"; // 显示位置
  }>(),
  {
    trigger: "contextmenu",
    lazy: true,
    dropdownStyle: () => ({}),
    placement: "bottom",
  }
);

const visible = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);
const position = ref({ x: 0, y: 0 });
const hasBeenShown = ref(false); // 记录是否曾经显示过

const contentStyle = computed<CSSProperties>(() => ({
  position: "fixed",
  left: `${position.value.x}px`,
  top: `${position.value.y}px`,
  zIndex: 2000,
  transformOrigin: props.placement === "top" ? "bottom" : "top",
  ...props.dropdownStyle,
}));

// 是否应该渲染内容
const shouldRenderContent = computed(() => {
  if (!props.lazy) return true;
  return hasBeenShown.value;
});

const showDropdown = () => {
  visible.value = true;
  hasBeenShown.value = true;
};

const hideDropdown = () => {
  visible.value = false;
};

// 处理点击事件
const handleClick = async (event: MouseEvent) => {
  if (props.trigger === "click" || props.trigger === "both") {
    event.preventDefault();
    event.stopPropagation();

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();

    if (visible.value) {
      hideDropdown();
    } else {
      // 先显示菜单以获取其高度
      showDropdown();

      // 等待下一帧以确保DOM已更新
      await new Promise((resolve) => requestAnimationFrame(resolve));

      // 获取下拉菜单元素的高度
      const dropdownContent = document.querySelector(
        ".nim-dropdown-content"
      ) as HTMLElement;
      const dropdownHeight = dropdownContent ? dropdownContent.offsetHeight : 0;

      position.value = {
        x: rect.left,
        y:
          props.placement === "top"
            ? rect.top - dropdownHeight - 4
            : rect.bottom + 4,
      };
    }
  }
};

// 处理右键菜单事件
const handleContextMenu = async (event: MouseEvent) => {
  if (props.trigger === "contextmenu" || props.trigger === "both") {
    event.preventDefault();

    // 先显示菜单以获取其高度
    showDropdown();

    // 等待下一帧以确保DOM已更新
    await new Promise((resolve) => requestAnimationFrame(resolve));

    // 获取下拉菜单元素的高度
    const dropdownContent = document.querySelector(
      ".nim-dropdown-content"
    ) as HTMLElement;
    const dropdownHeight = dropdownContent ? dropdownContent.offsetHeight : 0;

    position.value = {
      x: event.clientX,
      y:
        props.placement === "top"
          ? event.clientY - dropdownHeight - 4
          : event.clientY + 4,
    };
  }
};

// 处理下拉菜单内容点击
const handleContentClick = () => {
  hideDropdown();
};

// 处理全局右键点击
const handleGlobalContextMenu = (event: MouseEvent) => {
  const target = event.target as Node;
  if (dropdownRef.value && !dropdownRef.value.contains(target)) {
    hideDropdown();
  }
};

// 处理点击外部关闭
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;
  if (dropdownRef.value && !dropdownRef.value.contains(target)) {
    hideDropdown();
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  document.addEventListener("contextmenu", handleGlobalContextMenu);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("contextmenu", handleGlobalContextMenu);
});
</script>

<style scoped>
.nim-dropdown {
  display: block;
  width: 100%;
}

.nim-dropdown-trigger {
  display: block;
  width: 100%;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scaleY(0);
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: scaleY(1);
}

.nim-dropdown-content {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 4px 0px;
}
</style>
