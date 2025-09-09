<template>
  <div class="search-container-wrapper">
    <div class="search-input-wrapper" @click="searchModalVisible = true">
      <div class="search-icon-wrapper">
        <Icon
          iconClassName="search-icon"
          :size="14"
          color="#A6ADB6"
          type="icon-sousuo"
        ></Icon>
        <div class="search-title">{{ t("searchTitleText") }}</div>
      </div>
    </div>
    <Add />
    <SearchModal
      v-if="searchModalVisible"
      :visible="searchModalVisible"
      @close="searchModalVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Icon from "../CommonComponents/Icon.vue";
import Add from "./add/index.vue";
import { t } from "../utils/i18n";
import SearchModal from "./search-modal.vue";
const searchText = ref("");
const inputFocus = ref(false);

const searchModalVisible = ref(false);

const handleInputFocus = () => {
  inputFocus.value = true;
};

const handleInputBlur = () => {
  inputFocus.value = false;
};

const toggleDropdown = () => {
  // Dropdown 组件会自动处理显示/隐藏
};

const handleMenuClick = (action: string) => {
  console.log("Menu clicked:", action);
  // 这里可以添加具体的处理逻辑
  switch (action) {
    case "addFriend":
      // 添加好友逻辑
      break;
    case "createGroup":
      // 创建群组逻辑
      break;
    case "createDiscussion":
      // 创建讨论组逻辑
      break;
    case "joinGroup":
      // 加入群组逻辑
      break;
  }
};
</script>

<style scoped>
.search-container-wrapper {
  width: 100%;
  padding: 8px 16px;
  display: flex;
  align-items: center;
}

.search-input-wrapper {
  width: 100%;
  padding: 8px 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  color: #b3b7bc;
  background: #f1f5f8;
  border-radius: 4px;
  cursor: pointer;
}

.search-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-title {
  margin-left: 5px;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #333;
}

.search-input::placeholder {
  color: #a6adb6;
}

.dropdown-menu {
  min-width: 120px;
  padding: 4px 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  gap: 8px;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.menu-text {
  font-size: 14px;
  color: #333;
}
</style>
