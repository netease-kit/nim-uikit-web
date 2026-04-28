<template>
  <div v-if="pinAIUsers.length > 0" class="conversation-ai-list">
    <PinAIItem
      v-for="aiUser in pinAIUsers"
      :key="aiUser.accountId"
      :aiUser="aiUser"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onUnmounted } from "vue";
import { autorun } from "mobx";
import { store } from "../utils/init";
import PinAIItem from "./PinAIItem.vue";

const pinAIUsers = ref<{ accountId: string }[]>([]);

const pinAIUsersWatch = autorun(() => {
  pinAIUsers.value = store?.aiUserStore?.getAIPinUser?.() ?? [];
});

onUnmounted(() => {
  pinAIUsersWatch();
});
</script>

<style scoped>
.conversation-ai-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  padding: 8px 8px 4px 8px;
  gap: 4px;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
}
</style>
