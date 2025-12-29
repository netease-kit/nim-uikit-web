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
        <Empty :text="noReadInfoText"></Empty>
      </div>
    </div>
  </div>
</template>

<script>
import { t as i18nT } from "../../utils/i18n";
import Avatar from "../../CommonComponents/Avatar.vue";
import Appellation from "../../CommonComponents/Appellation.vue";
import Empty from "../../CommonComponents/Empty.vue";
import { RecycleScroller } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import { nim, uiKitStore } from "../../utils/init";

export default {
  name: "MessageReadInfo",
  components: {
    Avatar,
    Appellation,
    Empty,
    RecycleScroller,
  },
  props: {
    msg: {
      type: Object,
      default: null,
    },
    conversationId: {
      type: String,
      default: "",
    },
    messageClientId: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      readCount: 0,
      unReadCount: 0,
      readList: [],
      unReadList: [],
      teamId: "",
    };
  },
  computed: {
    readListData() {
      return this.readList.map((accountId, index) => ({
        accountId,
        uniqueKey: accountId,
        index,
      }));
    },
    unReadListData() {
      return this.unReadList.map((accountId, index) => ({
        accountId,
        uniqueKey: accountId,
        index,
      }));
    },
    noReadInfoText() {
      return i18nT("noReadInfoText");
    },
  },
  methods: {
    handleAvatarClick(account) {
      this.$emit("avatarClick", account);
    },
  },
  mounted() {
    const messageClientId = this.messageClientId;
    const conversationId = this.conversationId;

    if (messageClientId && conversationId) {
      this.teamId = nim.V2NIMConversationIdUtil.parseConversationTargetId(
        conversationId
      );

      const targetMsg =
        this.msg ||
        (uiKitStore &&
          uiKitStore.msgStore.getMsg(conversationId, [messageClientId])?.[0]);

      if (targetMsg) {
        uiKitStore?.msgStore
          .getTeamMessageReceiptDetailsActive(targetMsg)
          .then((res) => {
            this.readCount = res && res.readReceipt && res.readReceipt.readCount ? res.readReceipt.readCount : 0;
            this.unReadCount = res && res.readReceipt && res.readReceipt.unreadCount ? res.readReceipt.unreadCount : 0;
            this.readList = (res && res.readAccountList) || [];
            this.unReadList = (res && res.unreadAccountList) || [];
          });
      }
    }
  },
};
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
