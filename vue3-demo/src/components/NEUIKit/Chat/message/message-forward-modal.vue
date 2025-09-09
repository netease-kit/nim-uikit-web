<template>
  <Modal
    :title="t('sendToText')"
    :visible="visible"
    :confirmText="t('sendText')"
    :cancelText="t('cancelText')"
    :width="900"
    :height="670"
    :confirmDisabled="!selectedId"
    @cancel="handleForwardCancel"
    @confirm="handleForwardConfirm"
  >
    <div class="forward-container">
      <!-- 左侧列表 -->
      <div class="list-container">
        <!-- 搜索框 -->
        <div class="search-container">
          <div class="search-box">
            <div class="search-icon">
              <Icon type="icon-sousuo"></Icon>
            </div>
            <Input
              type="text"
              :placeholder="t('searchTitleText')"
              v-model="searchKeyword"
              :inputStyle="{
                height: '24px',
                fontSize: '14px',
                border: 'none',
              }"
              :inputWrapperStyle="{
                backgroundColor: '#fff',
              }"
              :showClear="true"
            />
          </div>
        </div>
        <!-- 标签页 -->
        <div class="tab-container">
          <div
            class="tab-item"
            :class="{ active: currentTab === 'recent' }"
            @click="switchTab('recent')"
          >
            {{ t("recentConversationText") }}
          </div>
          <div
            class="tab-item"
            :class="{ active: currentTab === 'friend' }"
            @click="switchTab('friend')"
          >
            {{ t("myFriendsText") }}
          </div>
          <div
            class="tab-item"
            :class="{ active: currentTab === 'team' }"
            @click="switchTab('team')"
          >
            {{ t("teamChooseText") }}
          </div>
        </div>

        <!-- 最近会话列表 -->
        <div v-if="currentTab === 'recent'" class="list">
          <Empty
            v-if="filteredRecentList.length === 0"
            :text="t('searchNoResText')"
            :emptyStyle="{
              marginTop: '40px',
            }"
          />
          <RecycleScroller
            v-else
            class="conversation-scroller"
            :items="filteredRecentList"
            :item-size="48"
            :buffer="5"
            key-field="conversationId"
            v-slot="{ item: conversation }"
          >
            <div
              class="list-item"
              :key="conversation.conversationId"
              :class="{ selected: selectedId === conversation.conversationId }"
              @click="
                () =>
                  selectItem(
                    conversation.conversationId,
                    conversation.type,
                    conversation
                  )
              "
            >
              <Avatar
                :account="conversation.accountId"
                :avatar="conversation.avatar"
                size="32"
              />
              <div class="item-info">
                <Appellation
                  class="conversation-item-title"
                  v-if="
                    conversation.type ===
                    V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P
                  "
                  :account="conversation.accountId"
                  :fontSize="14"
                />
                <span v-else>
                  {{ conversation.name }}
                </span>
              </div>
            </div>
          </RecycleScroller>
        </div>

        <!-- 好友列表 -->
        <div v-else-if="currentTab === 'friend'" class="list">
          <Empty
            v-if="filteredFriendList.length === 0"
            :text="t('searchNoResText')"
            :emptyStyle="{
              marginTop: '40px',
            }"
          />
          <RecycleScroller
            v-else
            class="friend-scroller"
            :items="filteredFriendList"
            :item-size="48"
            :buffer="5"
            key-field="accountId"
            v-slot="{ item: friend }"
          >
            <div
              class="list-item"
              :key="friend.accountId"
              :class="{ selected: selectedId === friend.accountId }"
              @click="
                () =>
                  selectItem(
                    friend.accountId,
                    V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P
                  )
              "
            >
              <Avatar :account="friend.accountId" size="32" />
              <div class="item-info">
                <Appellation :fontSize="14" :account="friend.accountId" />
              </div>
            </div>
          </RecycleScroller>
        </div>

        <!-- 群聊列表 -->
        <div v-else class="list">
          <Empty
            v-if="filteredTeamList.length === 0"
            :text="t('searchNoResText')"
            :emptyStyle="{
              marginTop: '40px',
            }"
          />
          <RecycleScroller
            v-else
            class="team-scroller"
            :items="filteredTeamList"
            :item-size="48"
            :buffer="5"
            key-field="teamId"
            v-slot="{ item: team }"
          >
            <div
              class="list-item"
              :class="{ selected: selectedId === team.teamId }"
              :key="team.teamId"
              @click="
                () =>
                  selectItem(
                    team.teamId,
                    V2NIMConst.V2NIMConversationType
                      .V2NIM_CONVERSATION_TYPE_TEAM
                  )
              "
            >
              <Avatar :account="team.teamId" :avatar="team.avatar" size="32" />
              <div class="item-info">
                <div class="item-name">{{ team.name }}</div>
              </div>
            </div>
          </RecycleScroller>
        </div>
      </div>
      <!-- 右侧发送给区域 -->
      <div class="send-to-container">
        <div class="send-to-header">{{ t("sendToText") }}</div>
        <div class="selected-items">
          <div v-if="selectedItem" class="selected-item">
            <Avatar
              :account="selectedItem.id"
              :avatar="selectedItem.avatar"
              size="32"
            />
            <span class="selected-name">{{ selectedItem.name }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 底部留言区域 -->
    <div class="message-container">
      <Input
        v-model="forwardComment"
        :placeholder="t('forwardComment')"
        class="message-input"
        :inputStyle="{
          height: '26px',
          fontSize: '14px',
          border: 'none',
        }"
      ></Input>
    </div>
  </Modal>
</template>

<script lang="ts" setup>
/** 消息转发弹窗 */
import { ref, computed, getCurrentInstance } from "vue";
import Avatar from "../../CommonComponents/Avatar.vue";
import Appellation from "../../CommonComponents/Appellation.vue";
import { t } from "../../utils/i18n";
import { autorun } from "mobx";
import { onUnmounted } from "vue";
import type { V2NIMTeam } from "nim-web-sdk-ng/dist/esm/nim/src/V2NIMTeamService";
import type { V2NIMMessage } from "nim-web-sdk-ng/dist/esm/nim/src/V2NIMMessageService";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import { toast } from "../../utils/toast";
import Modal from "../../CommonComponents/Modal.vue";
import Input from "../../CommonComponents/Input.vue";
import Icon from "../../CommonComponents/Icon.vue";
import Empty from "../../CommonComponents/Empty.vue";
import { RecycleScroller } from "vue-virtual-scroller";

const props = defineProps<{
  visible: boolean;
  msg?: V2NIMMessage; // 转发的消息对象
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "forward", targetId: string, type: "friend" | "team"): void;
  (e: "cancel"): void;
  (e: "confirm", targetId: string, type: "friend" | "team"): void;
  (e: "close"): void;
}>();

const { proxy } = getCurrentInstance()!;
const store = proxy?.$UIKitStore;
const nim = proxy?.$NIM;

const forwardConversationType = ref<V2NIMConst.V2NIMConversationType>(
  V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P
);

const currentTab = ref<"recent" | "friend" | "team">("recent");
const selectedId = ref<string>("");
const searchKeyword = ref("");
const forwardComment = ref("");
const selectedItem = ref<any>(null);

// 获取好友列表
const friendList = ref<{ accountId: string; appellation: string }[]>([]);
// 获取群聊列表
const teamList = ref<V2NIMTeam[]>([]);
// 获取最近会话列表
const recentList = ref<any[]>([]);

// 过滤后的列表
const filteredFriendList = computed(() => {
  if (!searchKeyword.value) return friendList.value;
  return friendList.value.filter((friend) =>
    friend.appellation.toLowerCase().includes(searchKeyword.value.toLowerCase())
  );
});

const filteredTeamList = computed(() => {
  if (!searchKeyword.value) return teamList.value;
  return teamList.value.filter((team) =>
    team.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  );
});

const filteredRecentList = computed(() => {
  if (!searchKeyword.value) return recentList.value;
  return recentList.value.filter((conversation) =>
    conversation.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  );
});

/**转发消息确认 */
const handleForwardConfirm = () => {
  if (!selectedId.value) {
    return;
  }

  if (!props.msg) {
    toast.info(t("getForwardMessageFailed"));
    return;
  }

  store?.msgStore
    .forwardMsgActive(
      props.msg,
      forwardConversationId.value,
      forwardComment.value
    )
    .then(() => {
      toast.success(t("forwardSuccessText"));
    })
    .catch(() => {
      toast.error(t("forwardFailedText"));
    })
    .finally(() => {
      emit("close");
    });
};

/**
 * 取消转发弹窗
 */
const handleForwardCancel = () => {
  emit("close");
};

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

  if (data?.length) {
    //@ts-ignore
    friendList.value = data;
  }
});

/** 群列表监听 */
const teamListWatch = autorun(() => {
  if (store?.uiStore.teamList) {
    teamList.value = store?.uiStore.teamList;
  }
});

/** 最近会话列表监听 */
const recentConversationListWatch = autorun(() => {
  const conversations = store?.sdkOptions?.enableV2CloudConversation
    ? [...(store?.uiStore?.conversations?.values() || [])]
    : [...(store?.uiStore?.localConversations?.values() || [])];

  if (conversations?.length) {
    recentList.value = conversations.map((item) => ({
      name: item.name || item.conversationId,
      avatar: item.avatar,
      type: item.type,
      conversationId: item.conversationId,
      accountId: nim.V2NIMConversationIdUtil.parseConversationTargetId(
        item.conversationId
      ),
    }));
  }
});

const switchTab = (tab: "recent" | "friend" | "team") => {
  currentTab.value = tab;
  selectedId.value = "";
  selectedItem.value = null;
};

// 新增一个变量来存储计算好的conversationId
const forwardConversationId = ref<string>("");

// 整合后的选择函数
const selectItem = (
  targetId: string,
  conversationType?: V2NIMConst.V2NIMConversationType,
  conversation?: any
) => {
  selectedId.value = targetId;

  if (conversation) {
    forwardConversationId.value = targetId;
  } else {
    if (conversationType) {
      forwardConversationType.value = conversationType;
    }
    // 在这里计算forwardConversationId
    forwardConversationId.value =
      nim.V2NIMConversationIdUtil[
        forwardConversationType.value ===
        V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P
          ? "p2pConversationId"
          : "teamConversationId"
      ](targetId);
  }

  // 设置选中项信息
  if (currentTab.value === "friend") {
    const friend = friendList.value.find((f) => f.accountId === targetId);
    if (friend) {
      selectedItem.value = {
        id: friend.accountId,
        name: friend.appellation,
        avatar: null,
      };
    }
  } else if (currentTab.value === "team") {
    const team = teamList.value.find((t) => t.teamId === targetId);
    if (team) {
      selectedItem.value = {
        id: team.teamId,
        name: team.name,
        avatar: team.avatar,
      };
    }
  } else if (currentTab.value === "recent") {
    // 处理最近会话的情况
    if (conversation) {
      selectedItem.value = {
        id: nim.V2NIMConversationIdUtil.parseConversationTargetId(targetId),

        name:
          conversation.type ===
          V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
            ? conversation.name
            : store?.uiStore.getAppellation({
                account: conversation.accountId,
              }),
        avatar: conversation.avatar,
      };
    }
  }
};

onUnmounted(() => {
  friendListWatch();
  teamListWatch();
  recentConversationListWatch();
});
</script>

<style scoped>
.forward-container {
  height: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  display: flex;
  min-height: 400px;
  max-height: 440px;
  overflow-y: hidden;
}

.search-container {
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 4px 11px;
  height: 32px;
  box-sizing: border-box;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  font-size: 14px;
  outline: none;
  border: none;
}

.search-input:focus {
  border-color: #1890ff;
  background-color: #fff;
}

.search-icon {
  color: #999;
  font-size: 14px;
}

.tab-container {
  display: flex;
  padding: 0 16px;
  border-bottom: 1px solid #f0f0f0;
  height: 50px;
  margin-bottom: 16px;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 13px 0;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
}

.tab-item:hover {
  color: #1890ff;
}

.tab-item.active {
  color: #1890ff;
  font-weight: 500;
}

.tab-item.active::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 2px;
  background-color: #1890ff;
}

.content-wrapper {
  flex: 1;
  display: flex;
  min-height: 0;
}

.list-container {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  border-right: 1px solid #f0f0f0;
}

.list {
  height: 310px;
  overflow: hidden;
  position: relative;
}

/* 虚拟滚动容器样式 */
.conversation-scroller,
.friend-scroller,
.team-scroller {
  height: 100%;
  width: 100%;
}

.send-to-container {
  flex: 1;
  padding: 16px;
}

.send-to-header {
  font-size: 14px;
  font-weight: 500;
  color: #666;
  margin-bottom: 12px;
}

.selected-items {
  min-height: 100px;
}

.selected-item {
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: #fff;
  border-radius: 6px;
  border: 1px solid #e6f2ff;
  margin-bottom: 8px;
}

.selected-name {
  margin-left: 8px;
  font-size: 14px;
  color: #333;
}

.list-item {
  display: flex;
  align-items: center;
  height: 48px;
  min-height: 48px;
  max-height: 48px;
  padding: 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 4px;
  transition: background-color 0.2s;
  font-size: 14px;
  flex-shrink: 0;
}

.list-item:hover {
  background-color: #f5f5f5;
}

.list-item.selected {
  background-color: #e6f2ff;
  border: 1px solid #1890ff;
}

.item-info {
  margin-left: 12px;
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  margin-bottom: 2px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.item-desc {
  font-size: 12px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.team-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.message-container {
  margin-top: 12px;
  border-radius: 4px;
  height: 32px;
  border: 1px solid #d9d9d9;
}

.message-input {
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  height: 30px;
  resize: none;
  outline: none;
  font-family: inherit;
  border: none;
  background-color: none;
  background-color: #fff;
}

.message-input:focus {
  border-color: #1890ff;
}

.message-input::placeholder {
  color: #bfbfbf;
}
</style>
