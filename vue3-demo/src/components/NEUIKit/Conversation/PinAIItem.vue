<template>
  <div class="conversation-ai-item" @click="handleItemClick">
    <Avatar size="36" :account="aiUser.accountId" />
    <Appellation
      class="conversation-ai-item-name"
      :account="aiUser.accountId"
      :fontSize="12"
    />
  </div>
</template>

<script lang="ts" setup>
import { showToast } from "../utils/toast";
import { t } from "../utils/i18n";
import { nim, store } from "../utils/init";
import Avatar from "../CommonComponents/Avatar.vue";
import Appellation from "../CommonComponents/Appellation.vue";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";

const props = defineProps<{
  aiUser: { accountId: string };
}>();

const handleItemClick = async () => {
  try {
    if (store?.sdkOptions?.enableV2CloudConversation) {
      await store?.conversationStore?.insertConversationActive(
        V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P,
        props.aiUser.accountId,
        true,
      );
    } else {
      await store?.localConversationStore?.insertConversationActive(
        V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P,
        props.aiUser.accountId,
        true,
      );
    }
  } catch (err) {
    showToast({ message: t("aiConversationSelectFailed"), type: "info" });
  }
};
</script>

<style scoped>
.conversation-ai-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 8px 4px;
  border-radius: 8px;
  min-width: 52px;
  max-width: 68px;
  transition: background-color 0.15s;
}

.conversation-ai-item:hover {
  background-color: #f3f5f7;
}

.conversation-ai-item-name {
  margin-top: 4px;
  max-width: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
  color: #333;
}
</style>
