<template>
  <div class="add-container">
    <Dropdown trigger="click" :dropdownStyle="{ borderRadius: '8px' }">
      <div class="add-button">
        <Icon
          iconClassName="add-icon"
          :size="16"
          color="#A6ADB6"
          type="icon-tianjiaanniu"
        ></Icon>
      </div>
      <template #overlay>
        <div class="dropdown-menu">
          <div
            v-for="item in menuItems"
            :key="item.action"
            class="dropdown-item"
            @click="handleMenuClick(item.action)"
          >
            <Icon
              iconClassName="menu-icon"
              :size="16"
              color="#666"
              :type="item.icon"
            ></Icon>
            <span class="menu-text">{{ item.text }}</span>
          </div>
        </div>
      </template>
    </Dropdown>
    <AddFriendModal
      v-if="addFriendModalVisible"
      :visible="addFriendModalVisible"
      @close="addFriendModalVisible = false"
    />
    <CreateTeamModal
      v-if="createTeamModalVisible"
      :visible="createTeamModalVisible"
      @close="createTeamModalVisible = false"
    />
    <JoinTeamModal
      v-if="joinTeamModalVisible"
      :visible="joinTeamModalVisible"
      @close="joinTeamModalVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Icon from "../../CommonComponents/Icon.vue";
import Dropdown from "../../CommonComponents/Dropdown.vue";
import { t } from "../../utils/i18n";
import AddFriendModal from "./add-friend-modal.vue";
import CreateTeamModal from "./create-team-modal.vue";
import JoinTeamModal from "./join-team-modal.vue";
// 定义菜单项数组
const menuItems = ref([
  {
    action: "addFriend",
    icon: "icon-tianjiahaoyou",
    text: t("addFriendText"),
  },
  {
    action: "createTeam",
    icon: "icon-chuangjianqunzu",
    text: t("createTeamText"),
  },
  {
    action: "joinTeam",
    icon: "icon-join",
    text: t("joinTeamText"),
  },
]);

const addFriendModalVisible = ref(false);
const createTeamModalVisible = ref(false);
const joinTeamModalVisible = ref(false);

const handleMenuClick = (action: string) => {
  // 这里可以添加具体的处理逻辑
  switch (action) {
    case "addFriend":
      addFriendModalVisible.value = true;
      break;
    case "createTeam":
      createTeamModalVisible.value = true;
      break;
    case "joinTeam":
      joinTeamModalVisible.value = true;
      // 加入群组逻辑
      break;
  }
};
</script>

<style scoped>
.add-button {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  margin-left: 20px;
  background: #f1f5f8;
  width: 38px;
  height: 38px;
}

.add-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.dropdown-menu {
  padding: 5px 7px;
  border-radius: 8px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  height: 30px;
  transition: background-color 0.2s;
}
.dropdown-item:hover {
  background-color: #f5f5f5;
  border-radius: 2px;
}

.menu-text {
  font-size: 14px;
  color: #333;
  margin-left: 8px;
}
</style>
