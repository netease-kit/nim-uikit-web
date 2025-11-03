<template>
  <div class="search-result-list-item" @click="handleClick">
    <div class="result-item-avatar">
      <Avatar size="36" :account="to" :avatar="teamAvatar" />
    </div>
    <div v-if="!isTeam" class="result-item-title">
      <Appellation :fontSize="14" :account="to" />
    </div>
    <div v-else class="result-item-title">
      {{ teamName }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import Avatar from "../CommonComponents/Avatar.vue";
import Appellation from "../CommonComponents/Appellation.vue";

const props = withDefaults(
  defineProps<{
    item: any;
  }>(),
  {}
);

const emit = defineEmits<{
  "item-click": [item: any];
}>();

// 群头像
const teamAvatar = computed(() => {
  if (props.item.teamId) {
    return props.item.avatar;
  }
});

// 对话方
const to = computed(() => {
  if (props.item.teamId) {
    return props.item.teamId;
  }
  return props.item.accountId;
});

// 是否是群
const isTeam = computed(() => {
  return !!props.item.teamId;
});

// 群名
const teamName = computed(() => {
  if (props.item.teamId) {
    return props.item.name;
  }
  return "";
});

/** 点击处理 */
const handleClick = () => {
  emit("item-click", props.item);
};
</script>

<style scoped>
.search-result-list-item {
  display: flex;
  align-items: center;
  height: 50px;
  margin: 10px 0;
  width: 100%;
  padding-left: 5px;
}

.search-result-list-item:hover {
  background-color: #f5f7fa;
  cursor: pointer;
  border-radius: 6px;
}

.result-item-avatar {
  width: 42px;
}

.result-item-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-left: 10px;
  font-size: 14px;
  color: #000;
}
.result-item-account {
  font-size: 13px;
  color: #b5b6b8;
}
</style>
