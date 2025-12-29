<template>
  <div
    v-if="
      msg.messageType !== messageType.V2NIM_MESSAGE_TYPE_CUSTOM &&
      msg.recallType !== 'reCallMsg' &&
      msg.sendingState ===
        sendingStateEnum.V2NIM_MESSAGE_SENDING_STATE_SUCCEEDED
    "
    class="msg-read-wrapper"
  >
    <div
      class="msg-read"
      v-if="
        conversationType === conversationTypeEnum.V2NIM_CONVERSATION_TYPE_P2P &&
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
          conversationTypeEnum.V2NIM_CONVERSATION_TYPE_TEAM &&
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
        <div v-if="teamMsgRotateDeg == 360" class="icon-read-wrapper">
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
              :msg="msg"
              :conversation-id="msg.conversationId"
              :message-client-id="msg.messageClientId"
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

<script>
import Icon from "../../CommonComponents/Icon.vue";
import Popover from "../../CommonComponents/Popover.vue";
import MessageReadInfo from "./message-read-info.vue";
import UserCardModal from "../../CommonComponents/UserCardModal.vue";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import { t } from "../../utils/i18n";
import { autorun } from "mobx";
import { nim, uiKitStore } from "../../utils/init";
const { V2NIMMessageType, V2NIMMessageSendingState, V2NIMConversationType } =
  V2NIMConst;

export default {
  name: "MessageRead",
  components: {
    Icon,
    Popover,
    MessageReadInfo,
    UserCardModal,
  },
  props: {
    msg: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      p2pMsgRotateDeg: 0,
      showUserCardModal: false,
      selectedAccount: "",
      p2pMsgReadWatcher: null,
      enableV2CloudConversation:
        (uiKitStore &&
          uiKitStore.sdkOptions &&
          uiKitStore.sdkOptions.enableV2CloudConversation) ||
        false,
    };
  },
  computed: {
    conversationTypeEnum() {
      return V2NIMConversationType;
    },
    messageType() {
      return V2NIMMessageType;
    },
    sendingStateEnum() {
      return V2NIMMessageSendingState;
    },
    teamMsgReceiptVisible() {
      return (
        uiKitStore &&
        uiKitStore.localOptions &&
        uiKitStore.localOptions.teamMsgReceiptVisible
      );
    },
    p2pMsgReceiptVisible() {
      return (
        uiKitStore &&
        uiKitStore.localOptions &&
        uiKitStore.localOptions.p2pMsgReceiptVisible
      );
    },
    conversationType() {
      return nim.V2NIMConversationIdUtil.parseConversationType(
        this.msg.conversationId
      );
    },
    teamMsgRotateDeg() {
      if (
        this.conversationType ===
        V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
      ) {
        const percentage =
          ((this.msg && this.msg.yxRead) || 0) /
            (((this.msg && this.msg.yxUnread) || 0) +
              ((this.msg && this.msg.yxRead) || 0)) || 0;
        return percentage * 360;
      }
      return 0;
    },
  },
  methods: {
    t,
    handleAvatarClick(account) {
      this.selectedAccount = account;
      this.showUserCardModal = true;
    },
    handleCloseModal() {
      this.showUserCardModal = false;
      this.selectedAccount = "";
    },
    handleUpdateVisible(visible) {
      this.showUserCardModal = visible;
      if (!visible) {
        this.selectedAccount = "";
      }
    },
    setP2pMsgRotateDeg() {
      if (
        this.conversationType ===
        V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P
      ) {
        const conversation = this.enableV2CloudConversation
          ? uiKitStore &&
            uiKitStore.conversationStore &&
            uiKitStore.conversationStore.conversations.get(
              this.msg.conversationId
            )
          : uiKitStore &&
            uiKitStore.localConversationStore &&
            uiKitStore.localConversationStore.conversations.get(
              this.msg.conversationId
            );

        this.p2pMsgRotateDeg =
          (this.msg && this.msg.createTime) <=
          ((conversation && conversation.msgReceiptTime) || 0)
            ? 360
            : 0;
      }
    },
  },
  mounted() {
    this.setP2pMsgRotateDeg();
    this.p2pMsgReadWatcher = autorun(() => {
      this.setP2pMsgRotateDeg();
    });
  },
  beforeDestroy() {
    if (this.p2pMsgReadWatcher) {
      this.p2pMsgReadWatcher();
      this.p2pMsgReadWatcher = null;
    }
  },
};
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
  width: 16px;
  height: 16px;
  display: inline-block;
}

/* 扇形进度容器 */
.sector {
  display: inline-block;
  position: relative;
  overflow: hidden;
  border: 1px solid #4c84ff;
  width: 14px;
  height: 14px;
  font-size: 14px;
  background-color: #eee;
  border-radius: 50%;
  box-sizing: border-box;
  margin: 0 10px 5px 0;
  top: 5px;
  right: 1px;
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
