<template>
  <div class="ai-list-container">
    <!-- 列表 -->
    <div v-if="aiUsers.length > 0" class="ai-list-content">
      <div
        v-for="aiUser in aiUsers"
        :key="aiUser.accountId"
        class="ai-item"
        @click="handleItemClick(aiUser)"
      >
        <Avatar size="36" :account="aiUser.accountId" />
        <span class="ai-item-label">
          {{ store.uiStore.getAppellation({ account: aiUser.accountId }) }}
        </span>
      </div>
    </div>

    <!-- 空状态 -->
    <Empty
      v-else
      :text="t('noAIUserText')"
      :emptyStyle="{ marginTop: '100px' }"
    />

    <!-- 用户名片弹窗（点击数字人后展示） -->
    <UserCardModal
      v-if="showUserCard"
      :visible="showUserCard"
      :account="selectedAccount"
      @close="handleCloseUserCard"
      @update:visible="handleUpdateVisible"
      @footClick="emit('afterSendMsgClick')"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onUnmounted } from "vue";
import { autorun } from "mobx";
import { store } from "../utils/init";
import { t } from "../utils/i18n";
import Avatar from "../CommonComponents/Avatar.vue";
import Empty from "../CommonComponents/Empty.vue";
import UserCardModal from "../CommonComponents/UserCardModal.vue";

const emit = defineEmits<{
  afterSendMsgClick: [];
  onAIItemClick: [accountId: string];
}>();

// 数字人列表（响应式）
const aiUsers = ref<{ accountId: string }[]>([]);

const aiUsersWatch = autorun(() => {
  aiUsers.value = store?.aiUserStore?.getAIUserList?.() ?? [];
});

// 用户名片弹窗状态
const showUserCard = ref(false);
const selectedAccount = ref("");

const handleItemClick = (aiUser: { accountId: string }) => {
  selectedAccount.value = aiUser.accountId;
  showUserCard.value = true;
  emit("onAIItemClick", aiUser.accountId);
};

const handleCloseUserCard = () => {
  showUserCard.value = false;
  selectedAccount.value = "";
};

const handleUpdateVisible = (visible: boolean) => {
  showUserCard.value = visible;
  if (!visible) selectedAccount.value = "";
};

onUnmounted(() => {
  aiUsersWatch();
});
</script>

<style scoped>
.ai-list-container {
  height: 100%;
  overflow-y: auto;
}

.ai-list-content {
  padding: 0 16px;
}

.ai-item {
  cursor: pointer;
  padding: 16px 0;
  display: flex;
  align-items: center;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.ai-item:not(:last-child) {
  border-bottom: 1px solid #f0f0f0;
}

.ai-item:hover {
  background-color: #f6f8fa;
}

.ai-item-label {
  margin-left: 12px;
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}
</style>
