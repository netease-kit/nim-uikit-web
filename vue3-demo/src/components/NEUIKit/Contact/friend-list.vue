<template>
  <div class="friend-list-container">
    <RecycleScroller
      v-if="flattenedFriendList.length > 0"
      class="friend-group-list"
      :items="flattenedFriendList"
      :item-size="60"
      :buffer="100"
      key-field="id"
      v-slot="{ item }"
    >
      <div :key="item.id">
        <!-- 分组标题 -->
        <div v-if="item.type === 'group'" class="friend-group-title">
          {{ item.title }}
        </div>
        <!-- 好友项 -->
        <div
          v-else
          class="friend-item"
          @click="handleFriendItemClick(item.data)"
        >
          <Avatar :account="item.data.accountId" />
          <div class="friend-name">{{ item.data.appellation }}</div>
        </div>
      </div>
    </RecycleScroller>

    <Empty
      v-else
      :text="t('noFriendText')"
      :emptyStyle="{
        marginTop: '100px',
      }"
    />

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
/** 好友列表组件 */
import Avatar from "../CommonComponents/Avatar.vue";
import UserCardModal from "../CommonComponents/UserCardModal.vue";
import { RecycleScroller } from "vue-virtual-scroller";
import { autorun } from "mobx";
import { onUnmounted, ref, getCurrentInstance, computed } from "vue";
import { friendGroupByPy } from "../utils/friend";
import Empty from "../CommonComponents/Empty.vue";

import { t } from "../utils/i18n";
import RootStore from "@xkit-yx/im-store-v2";

const { proxy } = getCurrentInstance()!;

const store = proxy?.$UIKitStore as RootStore;

const emit = defineEmits<{
  afterSendMsgClick: [];
}>();

const friendGroupList = ref<
  { key: string; data: { accountId: string; appellation: string }[] }[]
>([]);

// 将分组数据扁平化为虚拟列表可用的格式
const flattenedFriendList = computed(() => {
  const result: Array<{
    id: string;
    type: "group" | "friend";
    title?: string;
    data?: { accountId: string; appellation: string };
  }> = [];

  friendGroupList.value.forEach((group, groupIndex) => {
    // 添加分组标题
    result.push({
      id: `group-${groupIndex}`,
      type: "group",
      title: group.key,
    });

    // 添加该分组下的好友
    group.data.forEach((friend) => {
      result.push({
        id: friend.accountId,
        type: "friend",
        data: friend,
      });
    });
  });

  return result;
});

// UserCardModal 相关状态
const showUserCard = ref(false);
const selectedAccount = ref("");

/** 点击跳转好友名片页 */
function handleFriendItemClick(friend: {
  accountId: string;
  appellation: string;
}) {
  selectedAccount.value = friend.accountId;
  showUserCard.value = true;
}

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

/** 好友列表监听 */
const friendListWatch = autorun(() => {
  const data = store?.uiStore.friends
    .filter((item) => !store?.relationStore.blacklist.includes(item.accountId))
    .map((item) => ({
      accountId: item.accountId,
      appellation: store?.uiStore.getAppellation({
        account: item.accountId,
      }),
    }));

  friendGroupList.value = friendGroupByPy(
    data,
    {
      firstKey: "appellation",
    },
    false
  );
});

onUnmounted(() => {
  friendListWatch();
});
</script>

<style scoped>
.friend-list-container {
  height: 100%;
  overflow: hidden; /* 改为 hidden，让 RecycleScroller 处理滚动 */
}

.friend-group-list {
  height: 100%;
  padding: 0;
}

.friend-group-item {
  margin-bottom: 0;
}

.friend-group-title {
  height: 40px;
  line-height: 40px;
  font-size: 16px;
  font-weight: 500;
  color: #999;
  background-color: #f6f8fa;
  padding: 0 20px;
  border-bottom: 1px solid #e9e9e9;
  position: relative;
  top: 15px;
  z-index: 1;
}

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
</style>
