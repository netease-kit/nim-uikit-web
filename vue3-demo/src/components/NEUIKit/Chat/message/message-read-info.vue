<template>
  <div class="msg-read-wrapper">
    <div class="msg-read-header">
      <div class="msg-read-header-item">
        {{ `未读${unReadCount}人` }}
      </div>
      <div class="msg-read-header-item">
        {{ `已读${readCount}人` }}
      </div>
    </div>
    <div class="list-wrapper">
      <div class="two-columns-container">
        <!-- 左侧：未读用户列表 -->
        <div class="left-column">
          <div v-if="!unReadListData.length" class="empty-state">
            <Empty></Empty>
          </div>
          <RecycleScroller
            v-else
            class="unread-scroller"
            :items="unReadListData"
            :item-size="50"
            :buffer="50"
            key-field="uniqueKey"
            key="accountId"
            v-slot="{ item }"
          >
            <div class="list-item" :key="item.accountId">
              <div
                class="avatar-wrapper"
                @click="handleAvatarClick(item.accountId)"
              >
                <Avatar
                  size="32"
                  :account="item.accountId"
                  :goto-user-card="false"
                  :teamId="teamId"
                  :goto-team-card="false"
                />
              </div>
              <Appellation
                :account="item.accountId"
                :teamId="teamId"
                :font-size="14"
              ></Appellation>
            </div>
          </RecycleScroller>
        </div>

        <!-- 右侧：已读用户列表 -->
        <div class="right-column">
          <div v-if="!readListData.length" class="empty-state">
            <Empty></Empty>
          </div>
          <RecycleScroller
            v-else
            class="read-scroller"
            :items="readListData"
            :item-size="50"
            :buffer="5"
            key-field="accountId"
            v-slot="{ item }"
          >
            <div class="list-item" :key="item.accountId">
              <div
                class="avatar-wrapper"
                @click="handleAvatarClick(item.accountId)"
              >
                <Avatar
                  size="32"
                  :account="item.accountId"
                  :goto-user-card="false"
                  :teamId="teamId"
                  :goto-team-card="false"
                />
              </div>
              <Appellation
                :account="item.accountId"
                :teamId="teamId"
                :font-size="14"
              ></Appellation>
            </div>
          </RecycleScroller>
        </div>
      </div>

      <!-- 完全空状态占位图 -->
      <div v-if="!readList.length && !unReadList.length" class="full-empty">
        <Empty :text="t('noReadInfoText')"></Empty>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
/** 消息已读未读详情 */
import { onMounted, ref, computed } from "vue";
import { t } from "../../utils/i18n";
import Avatar from "../../CommonComponents/Avatar.vue";
import Appellation from "../../CommonComponents/Appellation.vue";
import Empty from "../../CommonComponents/Empty.vue";
import { RecycleScroller } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import { getCurrentInstance } from "vue";
import type { V2NIMMessageForUI } from "@xkit-yx/im-store-v2/dist/types/types";

const props = withDefaults(
  defineProps<{
    msg?: V2NIMMessageForUI;
    conversationId?: string;
    messageClientId?: string;
  }>(),
  {}
);

const { proxy } = getCurrentInstance()!;
const store = proxy?.$UIKitStore;
const nim = proxy?.$NIM;

// 定义事件 - 向父组件传递头像点击事件
const emit = defineEmits<{
  avatarClick: [account: string];
}>();
// 已读用户数
const readCount = ref(0);
// 未读用户数
const unReadCount = ref(0);
// 已读用户列表
const readList = ref<string[]>([]);
// 未读用户列表
const unReadList = ref<string[]>([]);
// 群id
const teamId = ref<string>("");

// 转换为虚拟滚动所需的对象数组格式
const readListData = computed(() => {
  // 去重
  return readList.value.map((accountId, index) => ({
    accountId,
    uniqueKey: accountId, // 直接使用 accountId 作为 key
    index,
  }));
});
// 转换为虚拟滚动所需的对象数组格式
const unReadListData = computed(() => {
  // 去重
  return unReadList.value.map((accountId, index) => ({
    accountId,
    uniqueKey: accountId, // 直接使用 accountId 作为 key
    index,
  }));
});

// 处理头像点击事件 - 改为向父组件发射事件
const handleAvatarClick = (account: string) => {
  emit("avatarClick", account);
};

onMounted(() => {
  const messageClientId = props.messageClientId;
  const conversationId = props.conversationId;

  if (messageClientId && conversationId) {
    teamId.value =
      nim.V2NIMConversationIdUtil.parseConversationTargetId(conversationId);

    // 如果有 props.msg，直接使用；否则从 store 获取
    const targetMsg =
      props.msg ||
      (store && store.msgStore.getMsg(conversationId, [messageClientId])?.[0]);

    if (targetMsg) {
      // 获取当前消息的已读未读详情
      store?.msgStore
        .getTeamMessageReceiptDetailsActive(targetMsg)
        .then((res) => {
          readCount.value = res?.readReceipt.readCount;
          unReadCount.value = res?.readReceipt.unreadCount;
          readList.value = res?.readAccountList;
          unReadList.value = res?.unreadAccountList;
        });
    }
  }
});
</script>

<style scoped>
.msg-read-wrapper {
  display: flex;
  flex-direction: column;
  height: 200px !important;
  box-sizing: border-box;
  background-color: #fff;
}

.msg-nav {
  flex-basis: 45px;
}

.msg-read-header {
  display: flex;
  align-items: center;
  width: 100%;
  height: 20px;
  margin-top: 5px;
}

.msg-read-header-item {
  flex: 1;
  text-align: center;
  line-height: 20px;
  color: #000;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 400;
}

.list-wrapper {
  flex: 1;
  overflow: hidden;
  padding: 0;
  min-height: 0;
}

.two-columns-container {
  display: flex;
  height: 100%;
  min-height: 0;
}

.left-column,
.right-column {
  width: 50%;
  flex-shrink: 0;
  height: 100%;
  overflow: hidden;
  min-height: 0;
}

.unread-scroller,
.read-scroller {
  height: 100%;
  box-sizing: border-box;
  width: 100%;
}

.list-item {
  height: 50px !important;
  min-height: 50px;
  max-height: 50px;
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0 5px;
  background-color: #fff;
  box-sizing: border-box;
  overflow: hidden; /* 防止内容溢出 */
}

/* 确保Avatar不会撑高容器 */
.avatar-wrapper {
  margin-right: 12px;
  flex-shrink: 0;
  cursor: pointer;
  margin-left: 2px;
  transition: transform 0.2s ease;
  height: 32px; /* 固定Avatar容器高度 */
  display: flex;
  align-items: center;
}

.list-item:hover {
  background-color: #f5f5f5;
}

.avatar-wrapper:hover {
  transform: scale(1.05);
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  color: #999;
  font-size: 14px;
}

.full-empty {
  padding: 60px 20px;
  text-align: center;
}
</style>
