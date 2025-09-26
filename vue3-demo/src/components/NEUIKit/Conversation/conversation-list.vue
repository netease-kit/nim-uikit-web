<template>
  <div class="conversation-wrapper">
    <div class="conversation-empty" v-if="!conversationList.length">
      <Empty
        v-if="!conversationList || conversationList.length === 0"
        :text="t('conversationEmptyText')"
      />
    </div>
    <RecycleScroller
      v-else
      class="conversation-list-wrapper"
      ref="listWrapper"
      :items="conversationList"
      :item-size="60"
      :buffer="100"
      key-field="conversationId"
      v-slot="{ item: conversation }"
      @scroll="handleScroll"
    >
      <div :key="conversation.conversationId" class="conversation-item-wrapper">
        <ConversationItem
          :conversation="conversation"
          :selectedConversation="selectedConversation"
          :current-move-session-id="currentMoveSessionId"
          @click="handleConversationItemClick(conversation)"
          @mute="handleConversationItemMute(conversation)"
          @delete="handleConversationItemDelete(conversation)"
          @stickyToTop="handleConversationItemStickTop(conversation)"
        />
      </div>
    </RecycleScroller>
  </div>
</template>

<script lang="ts" setup>
/** 会话列表主界面 */

import { onUnmounted, ref, getCurrentInstance } from "vue";
import { autorun } from "mobx";
import { RecycleScroller } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import Empty from "../CommonComponents/Empty.vue";
import ConversationItem from "./conversation-item.vue";
import { t } from "../utils/i18n";
import { showToast } from "../utils/toast";
import { trackInit } from "../utils/reporter";
import type {
  V2NIMConversationForUI,
  V2NIMLocalConversationForUI,
} from "@xkit-yx/im-store-v2/dist/types/types";

const conversationList = ref<
  (V2NIMConversationForUI | V2NIMLocalConversationForUI)[]
>([]);
const addDropdownVisible = ref(false);

const currentMoveSessionId = ref("");

const { proxy } = getCurrentInstance()!; // 获取组件实例
const store = proxy?.$UIKitStore;
const nim = proxy?.$NIM;

trackInit("ContactUIKit", nim.options.appkey);

/**是否是云端会话 */
const enableV2CloudConversation = store?.sdkOptions?.enableV2CloudConversation;

const listWrapper = ref<HTMLElement | null>(null);
const loading = ref(false);

const selectedConversation = ref("");

const selectedConversationWatch = autorun(() => {
  selectedConversation.value = store?.uiStore?.selectedConversation || "";
});

// 处理滚动事件 - 修改为适配虚拟滚动
const handleScroll = async (e: Event) => {
  const target = e.target as HTMLElement;
  if (!target) return;

  // 判断是否滚动到底部
  const isBottom =
    target.scrollHeight - target.scrollTop <= target.clientHeight + 50; // 增加一些缓冲区

  if (isBottom && !loading.value && conversationList.value.length > 0) {
    loading.value = true;
    const limit = store?.localOptions.conversationLimit || 100;
    try {
      // 这里添加加载更多会话的逻辑
      if (enableV2CloudConversation) {
        const offset =
          store.uiStore.conversations[store.uiStore.conversations.length - 1]
            ?.sortOrder;
        await store?.conversationStore?.getConversationListActive(
          offset,
          limit
        );
      } else {
        const offset = store?.uiStore.localConversations[
          store.uiStore.localConversations.length - 1
        ]?.sortOrder as number;
        await store?.localConversationStore?.getConversationListActive(
          offset,
          limit
        );
      }
    } catch (error) {
      console.error("加载更多会话失败:", error);
    } finally {
      loading.value = false;
    }
  }
};

/** 会话免打扰 */
const handleConversationItemMute = async (
  conversation: V2NIMConversationForUI | V2NIMLocalConversationForUI | null
) => {
  const muteMode = !conversation?.mute;
  const conversationType = nim.V2NIMConversationIdUtil.parseConversationType(
    conversation?.conversationId
  );
  const conversationTarget =
    nim.V2NIMConversationIdUtil.parseConversationTargetId(
      conversation?.conversationId
    );

  if (
    conversationType ===
    V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P
  ) {
    await store?.relationStore.setP2PMessageMuteModeActive(
      conversationTarget,
      muteMode
        ? V2NIMConst.V2NIMP2PMessageMuteMode.V2NIM_P2P_MESSAGE_MUTE_MODE_ON
        : V2NIMConst.V2NIMP2PMessageMuteMode.V2NIM_P2P_MESSAGE_MUTE_MODE_OFF
    );
  } else {
    await store?.teamStore.setTeamMessageMuteModeActive(
      conversationTarget,
      conversationType ===
        V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
        ? V2NIMConst.V2NIMTeamType.V2NIM_TEAM_TYPE_ADVANCED
        : V2NIMConst.V2NIMTeamType.V2NIM_TEAM_TYPE_SUPER,
      muteMode
        ? V2NIMConst.V2NIMTeamMessageMuteMode.V2NIM_TEAM_MESSAGE_MUTE_MODE_ON
        : V2NIMConst.V2NIMTeamMessageMuteMode.V2NIM_TEAM_MESSAGE_MUTE_MODE_OFF
    );
  }
};

let flag = false;
// 点击会话
const handleConversationItemClick = async (
  conversation: V2NIMConversationForUI | V2NIMLocalConversationForUI
) => {
  if (flag) return;
  currentMoveSessionId.value = "";
  try {
    flag = true;
    // 处理@消息相关
    if (
      conversation.type ===
        V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM ||
      conversation.type ===
        V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_SUPER_TEAM
    ) {
      if (store?.sdkOptions?.enableV2CloudConversation) {
        await store?.conversationStore?.markConversationReadActive(
          conversation.conversationId
        );
      } else {
        await store?.localConversationStore?.markConversationReadActive(
          conversation.conversationId
        );
      }
    }
    await store?.uiStore.selectConversation(conversation.conversationId);
  } catch {
    showToast({
      message: t("selectSessionFailText"),
      type: "info",
    });
  } finally {
    flag = false;
  }
};

// 删除会话
const handleConversationItemDelete = async (
  conversation: V2NIMConversationForUI | V2NIMLocalConversationForUI
) => {
  try {
    if (enableV2CloudConversation) {
      await store?.conversationStore?.deleteConversationActive(
        conversation.conversationId
      );
    } else {
      await store?.localConversationStore?.deleteConversationActive(
        conversation.conversationId
      );
    }
    currentMoveSessionId.value = "";
  } catch {
    showToast({
      message: t("deleteSessionFailText"),
      type: "info",
    });
  }
};

// 置顶会话
const handleConversationItemStickTop = async (
  conversation: V2NIMConversationForUI | V2NIMLocalConversationForUI
) => {
  if (conversation.stickTop) {
    try {
      if (enableV2CloudConversation) {
        await store?.conversationStore?.stickTopConversationActive(
          conversation.conversationId,
          false
        );
      } else {
        await store?.localConversationStore?.stickTopConversationActive(
          conversation.conversationId,
          false
        );
      }
    } catch {
      showToast({
        message: t("deleteStickTopFailText"),
        type: "info",
      });
    }
  } else {
    try {
      if (enableV2CloudConversation) {
        await store?.conversationStore?.stickTopConversationActive(
          conversation.conversationId,
          true
        );
      } else {
        await store?.localConversationStore?.stickTopConversationActive(
          conversation.conversationId,
          true
        );
      }
    } catch {
      showToast({
        message: t("addStickTopFailText"),
        type: "info",
      });
    }
  }
};

/** 监听会话列表 */
const conversationListWatch = autorun(() => {
  const _conversationList = enableV2CloudConversation
    ? store?.uiStore?.conversations
    : store?.uiStore?.localConversations;

  conversationList.value = _conversationList?.sort(
    (
      a: V2NIMConversationForUI | V2NIMLocalConversationForUI,
      b: V2NIMConversationForUI | V2NIMLocalConversationForUI
    ) => b.sortOrder - a.sortOrder
  ) as (V2NIMConversationForUI | V2NIMLocalConversationForUI)[];

  // todo
  // setTabUnread();
});

onUnmounted(() => {
  addDropdownVisible.value = false;
  conversationListWatch();
  selectedConversationWatch();
});
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
