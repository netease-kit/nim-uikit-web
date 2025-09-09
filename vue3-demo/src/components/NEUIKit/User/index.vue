<template>
  <div class="user-page">
    <div class="user-avatar-container">
      <Avatar
        :account="userAccount"
        size="36"
        @click="showUserCard = true"
        class="clickable-avatar"
      />
    </div>

    <MyUserCard
      v-if="showUserCard"
      :visible="showUserCard"
      @update:visible="showUserCard = $event"
      @save="handleSaveUserInfo"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, getCurrentInstance, onUnmounted } from "vue";
import Avatar from "../CommonComponents/Avatar.vue";
import MyUserCard from "./my-user-card.vue";
import { autorun } from "mobx";
import type { V2NIMUser } from "nim-web-sdk-ng/dist/esm/nim/src/V2NIMUserService";
import RootStore from "@xkit-yx/im-store-v2";

// 获取store实例
const instance = getCurrentInstance();
const store = instance?.proxy?.$UIKitStore as RootStore;

// 响应式数据
const showUserCard = ref(false);
const myUserInfo = ref<V2NIMUser>();

// 监听用户信息变化
const uninstallMyUserInfoWatch = autorun(() => {
  myUserInfo.value = store?.userStore.myUserInfo;
});

// 计算属性
const userAccount = computed(() => myUserInfo.value?.accountId || "");
const userName = computed(
  () => myUserInfo.value?.name || myUserInfo.value?.accountId || "未知用户"
);

// 处理保存用户信息
const handleSaveUserInfo = (userInfo) => {
  console.log("保存用户信息:", userInfo);
  // 这里可以调用API保存用户信息
  // 可以通过store更新用户信息
};

// 组件卸载时清理监听
onUnmounted(() => {
  uninstallMyUserInfoWatch();
});
</script>

<style scoped>
.user-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.user-avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 0;
  width: 100%;
}

.clickable-avatar {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.clickable-avatar:hover {
  transform: scale(1.05);
}

.user-name {
  margin: 0;
  font-size: 12px;
  font-weight: 400;
  color: #666;
  text-align: center;
  max-width: 50px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
