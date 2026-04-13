<template>
  <div class="nim-dropdown" ref="dropdownRef">
    <div
      class="nim-dropdown-trigger"
      @contextmenu.prevent="handleContextMenu"
      @click="handleClick"
    >
      <slot></slot>
    </div>
    <Transition name="dropdown" v-if="visible">
      <div
        v-show="visible"
        class="nim-dropdown-content"
        :style="contentStyle"
        @click="handleContentClick"
      >
        <slot name="overlay"></slot>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
/** 消息下拉菜单 */
import { ref, computed, onMounted, onUnmounted } from "vue";
import type { CSSProperties } from "vue";

// 全局dropdown管理 - 使用模块级变量确保所有实例共享
let globalActiveDropdown: (() => void) | null = null;

// 定义props
const props = withDefaults(
  defineProps<{
    trigger?: "contextmenu" | "click" | "both";
    lazy?: boolean;
    dropdownStyle?: CSSProperties;
    placement?: "top" | "bottom";
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
const hasBeenShown = ref(false);

const contentStyle = computed<CSSProperties>(() => ({
  position: "absolute",
  left: `${position.value.x}px`,
  top: `${position.value.y}px`,
  zIndex: 99999, // 进一步提高 z-index
  transformOrigin: props.placement === "top" ? "bottom" : "top",
  ...props.dropdownStyle,
}));

const showDropdown = () => {
  // 如果有其他dropdown打开，先关闭它
  if (globalActiveDropdown && globalActiveDropdown !== hideDropdown) {
    globalActiveDropdown();
  }
  document.dispatchEvent(
    new CustomEvent("nim-dropdown-open", {
      detail: { source: dropdownRef.value },
    })
  );

  // 设置当前dropdown为活跃状态
  globalActiveDropdown = hideDropdown;

  visible.value = true;
  hasBeenShown.value = true;
};

const hideDropdown = () => {
  visible.value = false;

  // 清除全局活跃dropdown引用
  if (globalActiveDropdown === hideDropdown) {
    globalActiveDropdown = null;
  }
};

// 处理点击事件
const handleClick = (event: MouseEvent) => {
  if (props.trigger === "click" || props.trigger === "both") {
    // 复用右键菜单的逻辑
    handleContextMenu(event);
  }
};

// 处理右键菜单事件
const handleContextMenu = async (event: MouseEvent) => {
  if (
    props.trigger === "contextmenu" ||
    props.trigger === "click" ||
    props.trigger === "both"
  ) {
    event.preventDefault();
    event.stopPropagation();
    document.dispatchEvent(
      new CustomEvent("nim-dropdown-open", {
        detail: { source: dropdownRef.value },
      })
    );

    // 先显示菜单以获取其高度
    showDropdown();

    // 等待下一帧以确保DOM已更新
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const dropdownContainer = dropdownRef.value;

    if (dropdownContainer) {
      const containerRect = dropdownContainer.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // 计算相对于dropdown容器的位置
      const relativeX = event.clientX - containerRect.left;
      const relativeY = event.clientY - containerRect.top;

      // 获取下拉菜单元素的高度和宽度
      const dropdownContent = dropdownContainer.querySelector(
        ".nim-dropdown-content"
      ) as HTMLElement;
      const dropdownHeight = dropdownContent ? dropdownContent.offsetHeight : 0;
      const dropdownWidth = dropdownContent ? dropdownContent.offsetWidth : 0;

      // 智能空间检测
      const spaceBelow = viewportHeight - event.clientY;
      const spaceAbove = event.clientY;

      // 根据可用空间和用户偏好决定最终placement
      let finalPlacement = props.placement;

      if (props.placement === "bottom") {
        // 用户偏好bottom，但如果底部空间不足且上方空间充足，则切换到top
        if (
          spaceBelow < dropdownHeight + 200 &&
          spaceAbove > dropdownHeight + 10
        ) {
          finalPlacement = "top";
        }
      } else if (props.placement === "top") {
        // 用户偏好top，但如果上方空间不足且下方空间充足，则切换到bottom
        if (
          spaceAbove < dropdownHeight + 10 &&
          spaceBelow > dropdownHeight + 10
        ) {
          finalPlacement = "bottom";
        }
      }

      // 根据最终placement计算Y位置
      let finalY;
      if (finalPlacement === "top") {
        finalY = relativeY - dropdownHeight - 4;
      } else {
        finalY = relativeY + 4;
      }

      // X轴边界检测
      let finalX = relativeX;
      const absoluteX = containerRect.left + finalX;
      if (absoluteX + dropdownWidth > viewportWidth) {
        finalX = viewportWidth - containerRect.left - dropdownWidth - 4;
      }
      if (finalX < 0) {
        finalX = 4;
      }

      // Y轴边界检测
      const absoluteY = containerRect.top + finalY;
      if (absoluteY < 0) {
        finalY = -containerRect.top + 4;
      } else if (absoluteY + dropdownHeight > viewportHeight) {
        finalY = viewportHeight - containerRect.top - dropdownHeight - 4;
      }

      position.value = {
        x: finalX,
        y: finalY,
      };

      // 更新transformOrigin以匹配实际显示位置
      const contentElement = dropdownContent;
      if (contentElement) {
        contentElement.style.transformOrigin =
          finalPlacement === "top" ? "bottom" : "top";
      }
    }
  }
};

// 处理下拉菜单内容点击
const handleContentClick = () => {
  hideDropdown();
};

// 处理点击外部关闭
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;
  if (dropdownRef.value && !dropdownRef.value.contains(target)) {
    hideDropdown();
  }
};

const handleGlobalDropdownOpen = (event: any) => {
  const source = event?.detail?.source;
  if (source !== dropdownRef.value && visible.value) {
    hideDropdown();
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  document.addEventListener("contextmenu", handleClickOutside);
  document.addEventListener(
    "nim-dropdown-open",
    handleGlobalDropdownOpen as any
  );
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("contextmenu", handleClickOutside);
  document.removeEventListener(
    "nim-dropdown-open",
    handleGlobalDropdownOpen as any
  );
});
</script>

<style scoped>
.nim-dropdown {
  position: relative; /* 重要：设置为相对定位，作为绝对定位的参考 */
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
  min-width: 70px;
  z-index: 99999; /* 确保样式中也有高z-index */
}
</style>
