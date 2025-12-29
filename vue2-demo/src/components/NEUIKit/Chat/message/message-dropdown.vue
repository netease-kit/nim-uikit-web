<template>
  <div class="nim-dropdown" ref="dropdownRef">
    <div class="nim-dropdown-trigger" @contextmenu.prevent="handleContextMenu" @click="handleClick">
      <slot></slot>
    </div>
    <transition name="dropdown" v-if="visible">
      <div
        v-show="visible"
        class="nim-dropdown-content"
        :style="contentStyle"
        @click="handleContentClick"
      >
        <slot name="overlay"></slot>
      </div>
    </transition>
  </div>
</template>

<script>
let globalActiveDropdown = null;

export default {
  name: "MessageDropdown",
  props: {
    trigger: { type: String, default: "contextmenu" },
    lazy: { type: Boolean, default: true },
    dropdownStyle: { type: Object, default: () => ({}) },
    placement: { type: String, default: "bottom" },
  },
  data() {
    return {
      visible: false,
      position: { x: 0, y: 0 },
      hasBeenShown: false,
    };
  },
  computed: {
    contentStyle() {
      return {
        position: "absolute",
        left: `${this.position.x}px`,
        top: `${this.position.y}px`,
        zIndex: 99999,
        transformOrigin: this.placement === "top" ? "bottom" : "top",
        ...this.dropdownStyle,
      };
    },
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside);
    document.addEventListener("contextmenu", this.handleClickOutside);
  },
  beforeDestroy() {
    document.removeEventListener("click", this.handleClickOutside);
    document.removeEventListener("contextmenu", this.handleClickOutside);
  },
  methods: {
    showDropdown() {
      if (globalActiveDropdown && globalActiveDropdown !== this.hideDropdown) {
        globalActiveDropdown();
      }
      globalActiveDropdown = this.hideDropdown;
      this.visible = true;
      this.hasBeenShown = true;
    },
    hideDropdown() {
      this.visible = false;
      if (globalActiveDropdown === this.hideDropdown) {
        globalActiveDropdown = null;
      }
    },
    handleClick(event) {
      if (this.trigger === "click" || this.trigger === "both") {
        this.handleContextMenu(event);
      }
    },
    async handleContextMenu(event) {
      if (this.trigger === "contextmenu" || this.trigger === "click" || this.trigger === "both") {
        event.preventDefault();
        event.stopPropagation();
        this.showDropdown();
        await new Promise((resolve) => requestAnimationFrame(resolve));
        const dropdownContainer = this.$refs.dropdownRef;
        if (dropdownContainer) {
          const containerRect = dropdownContainer.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const viewportWidth = window.innerWidth;
          const relativeX = event.clientX - containerRect.left;
          const relativeY = event.clientY - containerRect.top;
          const dropdownContent = dropdownContainer.querySelector(".nim-dropdown-content");
          const dropdownHeight = dropdownContent ? dropdownContent.offsetHeight : 0;
          const dropdownWidth = dropdownContent ? dropdownContent.offsetWidth : 0;
          const spaceBelow = viewportHeight - event.clientY;
          const spaceAbove = event.clientY;
          let finalPlacement = this.placement;
          if (this.placement === "bottom") {
            if (spaceBelow < dropdownHeight + 200 && spaceAbove > dropdownHeight + 10) {
              finalPlacement = "top";
            }
          } else if (this.placement === "top") {
            if (spaceAbove < dropdownHeight + 10 && spaceBelow > dropdownHeight + 10) {
              finalPlacement = "bottom";
            }
          }
          let finalY;
          if (finalPlacement === "top") {
            finalY = relativeY - dropdownHeight - 4;
          } else {
            finalY = relativeY + 4;
          }
          let finalX = relativeX;
          const absoluteX = containerRect.left + finalX;
          if (absoluteX + dropdownWidth > viewportWidth) {
            finalX = viewportWidth - containerRect.left - dropdownWidth - 4;
          }
          if (finalX < 0) {
            finalX = 4;
          }
          const absoluteY = containerRect.top + finalY;
          if (absoluteY < 0) {
            finalY = -containerRect.top + 4;
          } else if (absoluteY + dropdownHeight > viewportHeight) {
            finalY = viewportHeight - containerRect.top - dropdownHeight - 4;
          }
          this.position = { x: finalX, y: finalY };
          const contentElement = dropdownContent;
          if (contentElement) {
            contentElement.style.transformOrigin = finalPlacement === "top" ? "bottom" : "top";
          }
        }
      }
    },
    handleContentClick() {
      this.hideDropdown();
    },
    handleClickOutside(event) {
      const target = event.target;
      const el = this.$refs.dropdownRef;
      if (el && !el.contains(target)) {
        this.hideDropdown();
      }
    },
  },
};
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
