<template>
  <div
    v-if="
      props.msg.messageType !==
        V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CUSTOM &&
      props.msg.recallType !== 'reCallMsg' &&
      props.msg.sendingState ===
        V2NIMConst.V2NIMMessageSendingState
          .V2NIM_MESSAGE_SENDING_STATE_SUCCEEDED
    "
    class="msg-read-wrapper"
  >
    <div
      class="msg-read"
      v-if="
        conversationType ===
          V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P &&
        p2pMsgReceiptVisible
      "
    >
      <div v-if="p2pMsgRotateDeg == 360" class="icon-read-wrapper">
        <Icon type="icon-read" :size="14"></Icon>
      </div>
      <div v-else class="sector">
        <span
          class="cover-1"
          :style="`transform: rotate(${p2pMsgRotateDeg}deg)`"
        ></span>
        <span
          :class="p2pMsgRotateDeg >= 180 ? 'cover-2 cover-3' : 'cover-2'"
        ></span>
      </div>
    </div>
    <div
      v-if="
        conversationType ===
          V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM &&
        teamMsgReceiptVisible
      "
      :style="{ cursor: 'pointer' }"
      class="msg-read"
    >
      <Popover
        trigger="click"
        placement="top"
        :show-arrow="false"
        :offset="teamMsgRotateDeg == 360 || teamMsgRotateDeg == 0 ? 10 : 30"
      >
        <div class="icon-read-wrapper" v-if="teamMsgRotateDeg == 360">
          <Icon type="icon-read" :size="14"></Icon>
        </div>
        <div v-else class="sector">
          <span
            class="cover-1"
            :style="`transform: rotate(${teamMsgRotateDeg}deg)`"
          ></span>
          <span
            :class="teamMsgRotateDeg >= 180 ? 'cover-2 cover-3' : 'cover-2'"
          ></span>
        </div>
        <template #content>
          <div class="msg-read-tip" v-if="teamMsgRotateDeg == 360">
            {{ t("allReadText") }}
          </div>
          <div class="msg-read-tip" v-else-if="teamMsgRotateDeg == 0">
            {{ t("allUnReadText") }}
          </div>
          <div v-else class="popover-content">
            <MessageReadInfo
              :msg="props.msg"
              :conversation-id="props.msg.conversationId"
              :message-client-id="props.msg.messageClientId"
              @avatar-click="handleAvatarClick"
            />
          </div>
        </template>
      </Popover>
    </div>

    <UserCardModal
      v-if="showUserCardModal"
      :visible="showUserCardModal"
      :account="selectedAccount"
      @close="handleCloseModal"
      @update:visible="handleUpdateVisible"
    />
  </div>
</template>

<script lang="ts" setup>
/** 消息已读未读组件 */

import { computed, ref, onMounted, onUnmounted, getCurrentInstance } from "vue";
import type { V2NIMMessageForUI } from "@xkit-yx/im-store-v2/dist/types/types";
import Icon from "../../CommonComponents/Icon.vue";
import Popover from "../../CommonComponents/Popover.vue";
import MessageReadInfo from "./message-read-info.vue";
import UserCardModal from "../../CommonComponents/UserCardModal.vue";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import { t } from "../../utils/i18n";
import { autorun } from "mobx";

const props = withDefaults(
  defineProps<{
    msg: V2NIMMessageForUI;
  }>(),
  {}
);

const { proxy } = getCurrentInstance()!; // 获取组件实例
const store = proxy?.$UIKitStore;
const nim = proxy?.$NIM;

/** 是否需要显示群组消息已读未读，默认 false */
const teamMsgReceiptVisible = store?.localOptions.teamMsgReceiptVisible;

/** 是否需要显示 p2p 消息、p2p会话列表消息已读未读，默认 false */
const p2pMsgReceiptVisible = store?.localOptions.p2pMsgReceiptVisible;

/** 会话类型 */
const conversationType = nim.V2NIMConversationIdUtil.parseConversationType(
  props.msg.conversationId
) as unknown as V2NIMConst.V2NIMConversationType;

/** 单聊消息已读未读，用于UI变更 */
const p2pMsgRotateDeg = ref(0);

const showUserCardModal = ref(false);
const selectedAccount = ref<string>("");

// 处理头像点击事件
const handleAvatarClick = (account: string) => {
  selectedAccount.value = account;
  showUserCardModal.value = true;
};

// 关闭用户名片弹窗
const handleCloseModal = () => {
  showUserCardModal.value = false;
  selectedAccount.value = "";
};

// 处理弹窗可见性更新
const handleUpdateVisible = (visible: boolean) => {
  showUserCardModal.value = visible;
  if (!visible) {
    selectedAccount.value = "";
  }
};

/**是否是云端会话 */
const enableV2CloudConversation = store?.sdkOptions?.enableV2CloudConversation;
const setP2pMsgRotateDeg = () => {
  /**如果是单聊 */
  if (
    conversationType ===
    V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P
  ) {
    const conversation = enableV2CloudConversation
      ? store?.conversationStore?.conversations.get(props.msg.conversationId)
      : store?.localConversationStore?.conversations.get(
          props.msg.conversationId
        );

    p2pMsgRotateDeg.value =
      props?.msg?.createTime <= (conversation?.msgReceiptTime || 0) ? 360 : 0;
  }
};

const p2pMsgReadWatch = autorun(() => {
  setP2pMsgRotateDeg();
});

/** 群消息已读未读，用于UI变更 */
const teamMsgRotateDeg = computed(() => {
  if (
    conversationType ===
    V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
  ) {
    const percentage =
      (props?.msg?.yxRead || 0) /
        ((props?.msg?.yxUnread || 0) + (props?.msg?.yxRead || 0)) || 0;
    return percentage * 360;
  }
  return 0;
});

onMounted(() => {
  setP2pMsgRotateDeg();
});

onUnmounted(() => {
  p2pMsgReadWatch();
});
</script>

<style scoped>
/* 消息已读状态容器 */
.msg-read-wrapper {
  align-self: flex-end;
  height: 20px;
}

.msg-read {
  position: relative;
  height: 100%;
}

/* 已读图标容器 */
.icon-read-wrapper {
  margin: 0 10px 5px 0;
}

/* 扇形进度容器 */
.sector {
  display: inline-block;
  position: relative;
  overflow: hidden;
  border: 1px solid #4c84ff;
  width: 14px;
  height: 14px;
  background-color: #eee;
  border-radius: 50%;
  margin: 0 10px 0 0;
}

/* 扇形进度遮罩层1 */
.cover-1 {
  position: absolute;
  top: 0;
  width: 50%;
  height: 100%;
  background-color: #4c84ff;
  transform-origin: right;
}

/* 扇形进度遮罩层2 */
.cover-2 {
  position: absolute;
  top: 0;
  width: 50%;
  height: 100%;
  background-color: #eee;
}

/* 扇形进度遮罩层3 */
.cover-3 {
  right: 0;
  background-color: #4c84ff;
}

/* Popover trigger 包装器样式 */
.popover-trigger-wrapper {
  display: contents;
}

/* Popover 内容样式 */
.popover-content {
  width: 320px;
  min-height: 200px;
  max-height: 200px;
  padding: 0;
  overflow: hidden;
}

.msg-read-tip {
  color: #000;
}
</style>
