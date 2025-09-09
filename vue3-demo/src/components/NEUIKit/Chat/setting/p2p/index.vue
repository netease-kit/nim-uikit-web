<template>
  <div class="p2p-set-container-wrapper">
    <!-- 用户信息卡片 -->
    <div class="user-info-card">
      <div class="user-info">
        <Avatar :account="accountId" size="36" />
        <div class="user-details">
          <Appellation :account="accountId" :fontSize="14" class="user-name" />
        </div>
      </div>
    </div>

    <!-- 功能选项 -->
    <div class="function-list">
      <div class="function-item" @click="addTeamMember">
        <Icon type="icon-tianjiaanniu" class="function-icon" />
        <span class="function-text">{{ t("addChatMemberText") }}</span>
      </div>
    </div>

    <CreateTeamModal
      v-if="CreateTeamModalVisible"
      :p2pAccountId="accountId"
      :visible="CreateTeamModalVisible"
      @close="CreateTeamModalVisible = false"
    >
    </CreateTeamModal>
  </div>
</template>

<script lang="ts" setup>
/**单聊设置组件 */
import Avatar from "../../../CommonComponents/Avatar.vue";
import Icon from "../../../CommonComponents/Icon.vue";

import { ref } from "vue";
import { t } from "../../../utils/i18n";

import CreateTeamModal from "../../../Search/add/create-team-modal.vue";
import Appellation from "../../../CommonComponents/Appellation.vue";

interface Props {
  accountId: string;
}

defineProps<Props>();

const CreateTeamModalVisible = ref(false);
/**添加群成员 */
const addTeamMember = () => {
  CreateTeamModalVisible.value = true;
};
</script>

<style scoped>
.p2p-set-container-wrapper {
  height: 100vh;
  background-color: #fff;
  display: flex;
  flex-direction: column;
}

.close-icon {
  font-size: 20px;
  color: #666;
  cursor: pointer;
}

.close-icon:hover {
  color: #333;
}

/* 用户信息卡片 */
.user-info-card {
  background-color: #fff;
  margin: 20px 10px 10px 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-details {
  flex: 1;
}

.user-name {
  color: #333;
}

/* 功能选项列表 */
.function-list {
  background-color: #fff;
  margin: 0 10px 10px 10px;
}

.function-item {
  display: flex;
  align-items: center;
  padding: 16px 2px 16px 10px;
  cursor: pointer;
  transition: background-color 0.2s;
  gap: 12px;
}

.function-item:hover {
  background-color: #f8f9fa;
}

.function-icon {
  width: 36px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  border: 1px dashed #b7b9ba;
}

.function-text {
  font-size: 14px;
  color: #000;
  flex: 1;
}
</style>
