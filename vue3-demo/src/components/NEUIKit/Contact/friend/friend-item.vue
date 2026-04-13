<template>
  <div class="friend-item" @click="() => emit('click', friend)">
    <Avatar :account="friend.accountId" />
    <div class="friend-name">
      {{ friend.appellation }}
      <span class="friend-item-status">{{ isOnline }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Avatar from "../../CommonComponents/Avatar.vue";
import { ref, onUnmounted } from "vue";
import { store } from "../../utils/init";
import { autorun } from "mobx";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import { t } from "../../utils/i18n";

const emit = defineEmits(["click"]);
const props = defineProps<{
  friend: { accountId: string; appellation: string };
}>();
const friend = props.friend;

/** 读取是否需要显示在线离线的全局配置 */
const loginStateVisible = store?.localOptions?.loginStateVisible ?? false;

const isOnline = ref<string>("");

/** 监听好友在线离线状态 */
const statusWatch = autorun(() => {
  const stateMap = store?.subscriptionStore?.stateMap;

  if (loginStateVisible) {
    isOnline.value =
      stateMap?.get(friend.accountId)?.statusType ===
      V2NIMConst.V2NIMUserStatusType.V2NIM_USER_STATUS_TYPE_LOGIN
        ? `(${t("userOnlineText")})`
        : `(${t("userOfflineText")})`;
  }
});

onUnmounted(() => {
  statusWatch();
});
</script>

<style scoped>
.friend-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
  min-height: 60px;
  box-sizing: border-box;
}

.friend-item:hover {
  background-color: #f8f9fa;
}

.friend-item:last-child {
  border-bottom: none;
}

.friend-name {
  margin-left: 12px;
  color: #333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  line-height: 1.4;
}

.friend-item-status {
  color: #999999;
  display: inline-block;
}
</style>
