<template>
  <div class="user-page">
    <div class="user-avatar-container">
      <Avatar
        :key="myUserInfo && myUserInfo.updateTime"
        :account="userAccount"
        size="36"
        @click.native="showUserCard = true"
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

<script>
import Avatar from "../CommonComponents/Avatar.vue";
import MyUserCard from "./my-user-card.vue";
import { autorun } from "../utils/store";
import { uiKitStore } from "../utils/init";

export default {
  name: "UserIndex",
  components: { Avatar, MyUserCard },
  data() {
    return {
      showUserCard: false,
      myUserInfo: undefined,
      uninstallMyUserInfoWatch: null,
    };
  },
  computed: {
    userAccount() {
      return (this.myUserInfo && this.myUserInfo.accountId) || "";
    },
    userName() {
      return (
        (this.myUserInfo &&
          (this.myUserInfo.name || this.myUserInfo.accountId)) ||
        "未知用户"
      );
    },
  },
  methods: {
    handleSaveUserInfo(userInfo) {
      console.log("保存用户信息:", userInfo);
      // 这里可以调用API保存用户信息
      // 可以通过store更新用户信息
    },
  },
  mounted() {
    const store = uiKitStore;
    this.uninstallMyUserInfoWatch = autorun(() => {
      this.myUserInfo = store && store.userStore && store.userStore.myUserInfo;
    });
  },
  beforeDestroy() {
    if (this.uninstallMyUserInfoWatch) {
      this.uninstallMyUserInfoWatch();
    }
  },
};
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
