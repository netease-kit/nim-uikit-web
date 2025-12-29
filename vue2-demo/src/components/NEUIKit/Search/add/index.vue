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
      @goChat="emitGoChat"
    />
    <CreateTeamModal
      v-if="createTeamModalVisible"
      :visible="createTeamModalVisible"
      @goChat="emitGoChat"
      @close="createTeamModalVisible = false"
    />
    <CreateDiscussionModal
      v-if="createDiscussionModalVisible"
      :visible="createDiscussionModalVisible"
      @close="createDiscussionModalVisible = false"
      @goChat="emitGoChat"
    />
    <JoinTeamModal
      v-if="joinTeamModalVisible"
      :visible="joinTeamModalVisible"
      @close="joinTeamModalVisible = false"
      @goChat="emitGoChat"
    />
  </div>
</template>

<script>
import Icon from "../../CommonComponents/Icon.vue";
import Dropdown from "../../CommonComponents/Dropdown.vue";
import { t } from "../../utils/i18n";
import AddFriendModal from "./add-friend-modal.vue";
import CreateTeamModal from "./create-team-modal.vue";
import CreateDiscussionModal from "./create-discussion-modal.vue";
import JoinTeamModal from "./join-team-modal.vue";
import { uiKitStore } from "../../utils/init";

export default {
  name: "AddEntry",
  components: {
    Icon,
    Dropdown,
    AddFriendModal,
    CreateTeamModal,
    CreateDiscussionModal,
    JoinTeamModal,
  },
  data() {
    return {
      store: uiKitStore,
      menuItems: [
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
          action: "createDiscussion",
          icon: "icon-chuangjianqunzu",
          text: t("createDiscussionText"),
        },
        { action: "joinTeam", icon: "icon-join", text: t("joinTeamText") },
      ],
      addFriendModalVisible: false,
      createTeamModalVisible: false,
      joinTeamModalVisible: false,
      createDiscussionModalVisible: false,
    };
  },
  methods: {
    t,
    emitGoChat() {
      this.$emit("goChat");
    },
    handleMenuClick(action) {
      switch (action) {
        case "addFriend":
          this.addFriendModalVisible = true;
          break;
        case "createTeam":
          this.createTeamModalVisible = true;
          break;
        case "createDiscussion":
          this.createDiscussionModalVisible = true;
          break;
        case "joinTeam":
          this.joinTeamModalVisible = true;
          break;
      }
    },
  },
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
  width: 36px;
  height: 36px;
  box-sizing: border-box;
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
  box-sizing: border-box;
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
