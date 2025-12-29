<template>
  <div class="conversation-wrapper">
    <div class="conversation-empty" v-if="!conversationList.length">
      <Empty
        v-if="!conversationList || conversationList.length === 0"
        :text="t('conversationEmptyText')"
      />
    </div>
    <!-- 使用 @scroll.native 监听原生滚动事件，配合 handleScroll 做触底加载 -->
    <RecycleScroller
      v-else
      class="conversation-list-wrapper"
      ref="listWrapper"
      :items="conversationList"
      :item-size="65"
      :buffer="100"
      key-field="conversationId"
      v-slot="{ item }"
      @scroll.native="handleScroll"
    >
      <div :key="item.conversationId" class="conversation-item-wrapper">
        <ConversationItem
          :conversation="item"
          :selectedConversation="selectedConversation"
          :current-move-session-id="currentMoveSessionId"
          @click="handleConversationItemClick(item)"
          @mute="handleConversationItemMute(item)"
          @delete="handleConversationItemDelete(item)"
          @stickyToTop="handleConversationItemStickTop(item)"
        />
      </div>
    </RecycleScroller>
  </div>
</template>

<script>
import { autorun } from "../utils/store";
import { RecycleScroller } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import Empty from "../CommonComponents/Empty.vue";
import ConversationItem from "./conversation-item.vue";
import { t } from "../utils/i18n";
import { showToast } from "../utils/toast";
import { trackInit } from "../utils/reporter";
import { nim, uiKitStore } from "../utils/init";
export default {
  name: "ConversationList",
  components: {
    Empty,
    ConversationItem,
    RecycleScroller,
  },
  data() {
    return {
      conversationList: [],
      addDropdownVisible: false,
      currentMoveSessionId: "",
      loading: false,
      selectedConversation: "",
      flag: false,
      // 是否启用云端会话，影响分页接口与数据源
      enableV2CloudConversation:
        uiKitStore?.sdkOptions?.enableV2CloudConversation,
    };
  },
  created() {
    if (nim?.options?.appkey) {
      trackInit("ContactUIKit", nim.options.appkey);
    }
    // 监听选中会话变化，保持列表项高亮与右侧消息区同步
    this.selectedConversationWatch = autorun(() => {
      this.selectedConversation =
        uiKitStore?.uiStore?.selectedConversation || "";
    });
    // 监听会话列表变化，并按 sortOrder 逆序展示（新会话靠前）
    this.conversationListWatch = autorun(() => {
      const list = this.enableV2CloudConversation
        ? uiKitStore?.uiStore?.conversations
        : uiKitStore?.uiStore?.localConversations;

      this.conversationList = list
        .slice()
        .sort((a, b) => b.sortOrder - a.sortOrder);
    });
  },
  beforeDestroy() {
    this.addDropdownVisible = false;
    if (this.selectedConversationWatch) this.selectedConversationWatch();
    if (this.conversationListWatch) this.conversationListWatch();
  },
  methods: {
    t,
    // 列表滚动处理：触底时根据模式加载更多会话
    handleScroll(e) {
      const target = e.target;
      if (!target) return;
      const isBottom =
        target.scrollHeight - target.scrollTop <= target.clientHeight + 50;

      if (isBottom && !this.loading && this.conversationList.length > 0) {
        // 打开 loading，避免重复触发分页
        this.loading = true;
        // 每次分页的条数，可通过 localOptions.conversationLimit 配置
        const limit = uiKitStore?.localOptions?.conversationLimit || 100;
        const done = () => {
          this.loading = false;
        };
        Promise.resolve()
          .then(async () => {
            if (this.enableV2CloudConversation) {
              // 云端会话分页：以列表最后一项的 sortOrder 作为 offset
              const offset =
                uiKitStore.uiStore.conversations[
                  uiKitStore.uiStore.conversations.length - 1
                ]?.sortOrder;
              await uiKitStore?.conversationStore?.getConversationListActive(
                offset,
                limit
              );
            } else {
              // 本地会话分页：以本地列表最后一项的 sortOrder 作为 offset
              const offset =
                uiKitStore?.uiStore?.localConversations[
                  uiKitStore.uiStore.localConversations.length - 1
                ]?.sortOrder;
              await uiKitStore?.localConversationStore?.getConversationListActive(
                offset,
                limit
              );
            }
          })
          .catch((error) => {
            console.error("加载更多会话失败:", error);
          })
          .finally(done);
      }
    },
    // 切换会话免打扰：P2P 走 relationStore，群组走 teamStore
    handleConversationItemMute(conversation) {
      const muteMode = !conversation?.mute;
      const conversationType =
        nim.V2NIMConversationIdUtil?.parseConversationType(
          conversation?.conversationId
        );
      const conversationTarget =
        nim.V2NIMConversationIdUtil?.parseConversationTargetId(
          conversation?.conversationId
        );
      if (
        conversationType ===
        V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P
      ) {
        return uiKitStore?.relationStore.setP2PMessageMuteModeActive(
          conversationTarget,
          muteMode
            ? V2NIMConst.V2NIMP2PMessageMuteMode.V2NIM_P2P_MESSAGE_MUTE_MODE_ON
            : V2NIMConst.V2NIMP2PMessageMuteMode.V2NIM_P2P_MESSAGE_MUTE_MODE_OFF
        );
      } else {
        return uiKitStore?.teamStore.setTeamMessageMuteModeActive(
          conversationTarget,
          conversationType ===
            V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
            ? V2NIMConst.V2NIMTeamType.V2NIM_TEAM_TYPE_ADVANCED
            : V2NIMConst.V2NIMTeamType.V2NIM_TEAM_TYPE_SUPER,
          muteMode
            ? V2NIMConst.V2NIMTeamMessageMuteMode
                .V2NIM_TEAM_MESSAGE_MUTE_MODE_ON
            : V2NIMConst.V2NIMTeamMessageMuteMode
                .V2NIM_TEAM_MESSAGE_MUTE_MODE_OFF
        );
      }
    },
    // 点击会话：选中会话并对群会话做已读上报（云端/本地分别处理）
    handleConversationItemClick(conversation) {
      if (this.flag) return;
      this.currentMoveSessionId = "";
      this.flag = true;
      const finish = () => {
        this.flag = false;
      };
      Promise.resolve()
        .then(async () => {
          if (
            conversation.type ===
              V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM ||
            conversation.type ===
              V2NIMConst.V2NIMConversationType
                .V2NIM_CONVERSATION_TYPE_SUPER_TEAM
          ) {
            if (uiKitStore?.sdkOptions?.enableV2CloudConversation) {
              await uiKitStore?.conversationStore?.markConversationReadActive(
                conversation.conversationId
              );
            } else {
              await uiKitStore?.localConversationStore?.markConversationReadActive(
                conversation.conversationId
              );
            }
          }
          await uiKitStore?.uiStore?.selectConversation(
            conversation.conversationId
          );
        })
        .catch(() => {
          showToast({ message: t("selectSessionFailText"), type: "info" });
        })
        .finally(finish);
    },
    // 删除会话：根据模式调用对应删除接口
    handleConversationItemDelete(conversation) {
      try {
        if (this.enableV2CloudConversation) {
          uiKitStore?.conversationStore?.deleteConversationActive(
            conversation.conversationId
          );
        } else {
          uiKitStore?.localConversationStore?.deleteConversationActive(
            conversation.conversationId
          );
        }
        this.currentMoveSessionId = "";
      } catch {
        showToast({ message: t("deleteSessionFailText"), type: "info" });
      }
    },
    // 置顶/取消置顶：云端/本地分别调用 stickTop 接口
    handleConversationItemStickTop(conversation) {
      if (conversation.stickTop) {
        return Promise.resolve()
          .then(async () => {
            if (this.enableV2CloudConversation) {
              await uiKitStore?.conversationStore?.stickTopConversationActive(
                conversation.conversationId,
                false
              );
            } else {
              await uiKitStore?.localConversationStore?.stickTopConversationActive(
                conversation.conversationId,
                false
              );
            }
          })
          .catch(() => {
            showToast({ message: t("deleteStickTopFailText"), type: "info" });
          });
      } else {
        return Promise.resolve()
          .then(async () => {
            if (this.enableV2CloudConversation) {
              await uiKitStore?.conversationStore?.stickTopConversationActive(
                conversation.conversationId,
                true
              );
            } else {
              await uiKitStore?.localConversationStore?.stickTopConversationActive(
                conversation.conversationId,
                true
              );
            }
          })
          .catch(() => {
            showToast({ message: t("addStickTopFailText"), type: "info" });
          });
      }
    },
  },
};
</script>

<style scoped>
.conversation-wrapper {
  height: 100%;
  overflow: hidden;
  background-color: #fff;
  position: relative;
}

/* 虚拟滚动容器样式 */
.conversation-list-wrapper {
  height: 100%;
  box-sizing: border-box;
  width: 100%;
}

/* 确保虚拟滚动项目的高度 */
.conversation-item-wrapper {
  position: relative;
  height: 65px; /* 固定高度，与 item-size 保持一致 */
}

.conversation-search {
  display: flex;
  align-items: center;
  height: 54px;
  box-sizing: border-box;
  overflow: hidden;
  padding: 10px;
}

.security-tip {
  padding: 0 10px;
  background: #fff5e1;
  height: 50px;
  width: 100%;
  box-sizing: border-box;
  font-size: 14px;
  text-align: center;
  white-space: wrap;
  color: #eb9718;
  text-align: left;
  display: flex;
  align-items: center;
}

.search-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  height: 34px;
  overflow: hidden;
  box-sizing: border-box;
  padding: 8px 10px;
  background: #f3f5f7;
  border-radius: 5px;
}

.search-input {
  margin-left: 5px;
  color: #999999;
}

.search-icon-wrapper {
  height: 22px;
  display: flex;
  align-items: center;
}

.block {
  height: 60px;
  width: 100%;
  display: block;
}

.conversation-list-wrapper {
  height: 100%;
  box-sizing: border-box;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.logo-box {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: 500;
  color: #000;
}
.logo-img {
  width: 32px;
  height: 32px;
  margin-right: 10px;
}

.logo-title {
  font-size: 20px;
  font-weight: 500;
  color: #000;
}

.button-icon-add {
  position: relative;
  right: 20px;
}

.dropdown-mark {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.dropdown-container {
  position: absolute;
  top: 100%;
  right: 30px;
  min-width: 122px;
  min-height: 40px;
  background-color: #fff;
  border: 1px solid #e6e6e6;
  box-shadow: 0px 4px 7px rgba(133, 136, 140, 0.25);
  border-radius: 8px;
  color: #000;
  z-index: 99;
}

.add-menu-list {
  padding: 15px 10px;
}
.add-menu-item {
  white-space: nowrap;
  font-size: 16px;
  padding-left: 5px;
  margin-bottom: 10px;
  height: 30px;
  line-height: 30px;
  display: flex;
  align-items: center;
}
.add-menu-item:last-child {
  margin-bottom: 0;
}

.conversation-block {
  width: 100%;
  height: 72px;
}
.conversation-item-wrapper {
  position: relative;
}

.conversation-empty {
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
}
</style>
