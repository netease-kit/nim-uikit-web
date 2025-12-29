<template>
  <div class="nim-dropdown" ref="dropdownRef">
    <div
      class="nim-dropdown-trigger"
      @contextmenu.prevent="handleContextMenu"
      @click="handleClick"
    >
      <slot></slot>
    </div>
    <Transition name="dropdown">
      <div
        v-if="!lazy || hasBeenShown"
        v-show="visible"
        ref="dropdownContent"
        class="nim-dropdown-content"
        :style="contentStyle"
        @click="handleContentClick"
      >
        <slot name="overlay"></slot>
      </div>
    </Transition>
  </div>
</template>

<script>
export default {
  name: "NEUIDropdown",
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
      return Object.assign(
        {
          position: "fixed",
          left: `${this.position.x}px`,
          top: `${this.position.y}px`,
          zIndex: 2000,
          transformOrigin: this.placement === "top" ? "bottom" : "top",
        },
        this.dropdownStyle || {}
      );
    },
  },
  watch: {
    visible(val) {
      this.$nextTick(() => {
        const content = this.$refs.dropdownContent;
        if (val && content) {
          document.body.appendChild(content);
        } else if (!val && content && content.parentNode === document.body) {
          document.body.removeChild(content);
        }
      });
    },
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside);
    document.addEventListener("contextmenu", this.handleGlobalContextMenu);
  },
  beforeDestroy() {
    document.removeEventListener("click", this.handleClickOutside);
    document.removeEventListener("contextmenu", this.handleGlobalContextMenu);
    const content = this.$refs.dropdownContent;
    if (content && content.parentNode === document.body) {
      document.body.removeChild(content);
    }
  },
  methods: {
    showDropdown() {
      this.visible = true;
      this.hasBeenShown = true;
    },
    hideDropdown() {
      this.visible = false;
    },
    handleClick(event) {
      if (this.trigger === "click" || this.trigger === "both") {
        event.preventDefault();
        event.stopPropagation();
        const rect = event.currentTarget.getBoundingClientRect();
        if (this.visible) {
          this.hideDropdown();
        } else {
          this.showDropdown();
          this.$nextTick(() => {
            const dropdownContent = this.$refs.dropdownContent;
            const dropdownHeight = dropdownContent
              ? dropdownContent.offsetHeight
              : 0;
            this.position = {
              x: rect.left,
              y:
                this.placement === "top"
                  ? rect.top - dropdownHeight - 4
                  : rect.bottom + 4,
            };
          });
        }
      }
    },
    handleContextMenu(event) {
      if (this.trigger === "contextmenu" || this.trigger === "both") {
        event.preventDefault();
        this.showDropdown();
        this.$nextTick(() => {
          const dropdownContent = this.$refs.dropdownContent;
          const dropdownHeight = dropdownContent
            ? dropdownContent.offsetHeight
            : 0;
          this.position = {
            x: event.clientX,
            y:
              this.placement === "top"
                ? event.clientY - dropdownHeight - 4
                : event.clientY + 4,
          };
        });
      }
    },
    handleContentClick() {
      this.hideDropdown();
    },
    handleGlobalContextMenu(event) {
      const target = event.target;
      if (this.$refs.dropdownRef && !this.$refs.dropdownRef.contains(target)) {
        this.hideDropdown();
      }
    },
    handleClickOutside(event) {
      const target = event.target;
      if (this.$refs.dropdownRef && !this.$refs.dropdownRef.contains(target)) {
        this.hideDropdown();
      }
    },
  },
};
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
