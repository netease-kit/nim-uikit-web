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
        <div key="recent" v-if="currentTab === 'recent'" class="list">
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
                  v-if="conversation.type === 1"
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
        <div key="friend" v-else-if="currentTab === 'friend'" class="list">
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
                selectItem(
                  friend.accountId,
                  V2NIMConversationTypeEnum.V2NIM_CONVERSATION_TYPE_P2P
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
        <div key="team" v-else-if="currentTab === 'team'" class="list">
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
                selectItem(
                  team.teamId,
                  V2NIMConversationTypeEnum.V2NIM_CONVERSATION_TYPE_TEAM
                )
              "
            >
              <Avatar :avatar="team.avatar" size="32" />
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
          <div :key="selectedItem.id" v-if="selectedItem" class="selected-item">
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
        class="message-forward-input"
        :inputStyle="{
          height: '26px',
          fontSize: '14px',
          border: 'none',
        }"
      ></Input>
    </div>
  </Modal>
</template>

<script>
import Avatar from "../../CommonComponents/Avatar.vue";
import Appellation from "../../CommonComponents/Appellation.vue";
import { t } from "../../utils/i18n";
import { autorun } from "mobx";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import { toast } from "../../utils/toast";
import Modal from "../../CommonComponents/Modal.vue";
import Input from "../../CommonComponents/Input.vue";
import Icon from "../../CommonComponents/Icon.vue";
import Empty from "../../CommonComponents/Empty.vue";
import { RecycleScroller } from "vue-virtual-scroller";
import { nim, uiKitStore } from "../../utils/init";

export default {
  name: "MessageForwardModal",
  components: {
    Avatar,
    Appellation,
    Modal,
    Input,
    Icon,
    Empty,
    RecycleScroller,
  },
  props: {
    visible: { type: Boolean, default: false },
    msg: { type: Object },
  },
  data() {
    return {
      forwardConversationType:
        V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P,
      currentTab: "recent",
      selectedId: "",
      searchKeyword: "",
      forwardComment: "",
      selectedItem: null,
      friendList: [],
      teamList: [],
      recentList: [],
      friendListWatch: null,
      teamListWatch: null,
      recentConversationListWatch: null,
      forwardConversationId: "",
      V2NIMConversationTypeEnum: V2NIMConst.V2NIMConversationType,
    };
  },
  computed: {
    store() {
      return uiKitStore;
    },
    filteredFriendList() {
      if (!this.searchKeyword) return this.friendList;
      return this.friendList.filter((friend) =>
        (friend.appellation || "")
          .toLowerCase()
          .includes(this.searchKeyword.toLowerCase())
      );
    },
    filteredTeamList() {
      if (!this.searchKeyword) return this.teamList;
      return this.teamList.filter((team) =>
        (team.name || "")
          .toLowerCase()
          .includes(this.searchKeyword.toLowerCase())
      );
    },
    filteredRecentList() {
      if (!this.searchKeyword) return this.recentList;
      return this.recentList.filter((conversation) =>
        (conversation.name || "")
          .toLowerCase()
          .includes(this.searchKeyword.toLowerCase())
      );
    },
  },
  created() {
    this.friendListWatch = autorun(() => {
      const data = this.store?.uiStore.friends
        .filter(
          (item) =>
            !this.store?.relationStore.blacklist.includes(item.accountId)
        )
        .map((item) => ({
          accountId: item.accountId,
          appellation: this.store?.uiStore.getAppellation({
            account: item.accountId,
          }),
        }));
      if (data && data.length) {
        this.friendList = data;
      }
    });
    this.teamListWatch = autorun(() => {
      if (this.store?.uiStore.teamList) {
        this.teamList = this.store?.uiStore.teamList;
      }
    });
    this.recentConversationListWatch = autorun(() => {
      const conversations = this.store?.sdkOptions?.enableV2CloudConversation
        ? [...(this.store?.uiStore?.conversations?.values() || [])]
        : [...(this.store?.uiStore?.localConversations?.values() || [])];
      if (conversations && conversations.length) {
        this.recentList = conversations.map((item) => ({
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
  },
  beforeDestroy() {
    if (this.friendListWatch) this.friendListWatch();
    if (this.teamListWatch) this.teamListWatch();
    if (this.recentConversationListWatch) this.recentConversationListWatch();
  },
  methods: {
    t,
    handleForwardConfirm() {
      if (!this.selectedId) return;
      if (!this.msg) {
        toast.info(t("getForwardMessageFailed"));
        return;
      }
      this.store?.msgStore
        .forwardMsgActive(
          this.msg,
          this.forwardConversationId,
          this.forwardComment
        )
        .then(() => {
          toast.success(t("forwardSuccessText"));
        })
        .catch(() => {
          toast.error(t("forwardFailedText"));
        })
        .finally(() => {
          this.$emit("close");
        });
    },
    handleForwardCancel() {
      this.$emit("close");
    },
    switchTab(tab) {
      this.currentTab = tab;
    },
    selectItem(targetId, conversationType, conversation) {
      this.selectedId = targetId;
      if (conversation) {
        this.forwardConversationId = targetId;
      } else {
        if (conversationType) {
          this.forwardConversationType = conversationType;
        }
        this.forwardConversationId =
          nim.V2NIMConversationIdUtil[
            this.forwardConversationType ===
            V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P
              ? "p2pConversationId"
              : "teamConversationId"
          ](targetId);
      }
      if (this.currentTab === "friend") {
        const friend = this.friendList.find((f) => f.accountId === targetId);
        if (friend) {
          this.selectedItem = {
            id: friend.accountId,
            name: friend.appellation,
            avatar: null,
          };
        }
      } else if (this.currentTab === "team") {
        const team = this.teamList.find((t) => t.teamId === targetId);
        if (team) {
          this.selectedItem = {
            id: team.teamId,
            name: team.name,
            avatar: team.avatar,
          };
        }
      } else if (this.currentTab === "recent") {
        if (conversation) {
          this.selectedItem = {
            id: nim.V2NIMConversationIdUtil.parseConversationTargetId(targetId),
            name:
              conversation.type ===
              V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
                ? conversation.name
                : this.store?.uiStore.getAppellation({
                    account: conversation.accountId,
                  }),
            avatar: conversation.avatar,
          };
        }
      }
    },
  },
};
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
  box-sizing: border-box;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 0;
  margin-right: 2px;
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
  height: 40px;
}

.message-forward-input {
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  box-sizing: border-box;
  height: 36px;
  resize: none;
  outline: none;
  font-family: inherit;
  border: none;
  background-color: #fff;
  border-radius: 2px;
  border: 1px solid #d9d9d9;
}

.message-forward-input:focus {
  border-color: #1890ff;
}

.message-forward-input::placeholder {
  color: #bfbfbf;
}
</style>
