<template>
  <div class="black-list-container">
    <RecycleScroller
      v-if="blacklist.length > 0"
      class="black-list-content"
      :items="blacklist"
      :item-size="60"
      :buffer="100"
      key-field="id"
      v-slot="{ item }"
    >
      <div @click="() => handleItemClick(item)" class="black-item" :key="item">
        <div class="item-left">
          <Avatar :account="item" />
          <Appellation class="black-name" :account="item" />
        </div>
        <div class="black-button" @click="(e) => handleClick(e, item)">
          {{ t("removeBlacklist") }}
        </div>
      </div>
    </RecycleScroller>

    <Empty
      v-else
      :emptyStyle="{
        marginTop: '100px',
      }"
      :text="t('blacklistEmptyText')"
    />

    <UserCardModal
      v-if="showUserCard"
      :visible="showUserCard"
      :account="selectedAccount"
      @close="handleCloseUserCard"
      @update:visible="handleUpdateVisible"
      @footClick="emit('onBlackItemClick')"
    />
  </div>
</template>

<script lang="ts" setup>
/** 通讯录 黑名单列表组件 */
import { autorun } from "mobx";
import { onUnmounted, ref, getCurrentInstance } from "vue";
import { RecycleScroller } from "vue-virtual-scroller";
import Empty from "../CommonComponents/Empty.vue";
import Avatar from "../CommonComponents/Avatar.vue";
import Appellation from "../CommonComponents/Appellation.vue";
import RootStore from "@xkit-yx/im-store-v2";
import { t } from "../utils/i18n";
import { toast } from "../utils/toast";
import UserCardModal from "../CommonComponents/UserCardModal.vue";

const emit = defineEmits<{
  onBlackItemClick: [];
}>();

const blacklist = ref<string[]>([]);
const users = ref();

const { proxy } = getCurrentInstance()!;

const store = proxy?.$UIKitStore as RootStore;

/** 移除黑名单 */
const handleClick = async (e, account: string) => {
  e.stopPropagation();
  try {
    await store?.relationStore.removeUserFromBlockListActive(account);
    toast.success(t("removeBlackSuccessText"));
  } catch (error) {
    toast.info(t("removeBlackFailText"));
  }
};

// UserCardModal 相关状态
const showUserCard = ref(false);
const selectedAccount = ref("");

/** 关闭用户名片弹窗 */
function handleCloseUserCard() {
  showUserCard.value = false;
  selectedAccount.value = "";
}

/** 处理弹窗可见性更新 */
function handleUpdateVisible(visible: boolean) {
  showUserCard.value = visible;
  if (!visible) {
    selectedAccount.value = "";
  }
}

const handleItemClick = (item) => {
  selectedAccount.value = item;
  showUserCard.value = true;
};

/** 黑名单列表监听 */
const blacklistWatch = autorun(() => {
  blacklist.value = store?.relationStore.blacklist;
});

/** 用户列表监听 */
const usersWatch = autorun(() => {
  // 加一个监听
  users.value = store?.userStore.users;
});

onUnmounted(() => {
  blacklistWatch();
  usersWatch();
});
</script>

<style scoped>
.black-list-container {
  height: 100%;
  overflow: hidden; /* 改为 hidden，让 RecycleScroller 处理滚动 */
}

.black-list-subtitle {
  color: #b3b7bc;
  font-size: 14px;
  padding: 10px 20px;
  text-align: center;
  background-color: #f8f9fa;
  margin: 0;
  border-bottom: 1px solid #e9eff5;
}

.black-list-content {
  height: 100%;
  padding: 0;
}

.black-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 20px;
  border-bottom: 1px solid #f5f8fc;
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.black-item:hover {
  background-color: #f8f9fa;
}

.black-item:last-child {
  border-bottom: none;
}

.item-left {
  display: flex;
  align-items: center;
  width: 70%;
}

.black-name {
  margin-left: 10px;
  font-size: 16px;
  padding-right: 20px;
  color: #000;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.black-button {
  margin: 0;
  width: 60px;
  height: 32px;
  line-height: 32px;
  font-size: 14px;
  color: #337eef;
  border: 1px solid #337eef;
  text-align: center;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.black-button:hover {
  background-color: #337eef;
  color: #fff;
}
</style>
