<template>
  <MessageDropdown placement="bottom" trigger="contextmenu">
    <div
      class="msg-bubble"
      :style="{ justifyContent: !msg.isSelf ? 'flex-start' : 'flex-end' }"
    >
      <div class="msg-status-wrapper">
        <MessageIsRead
          v-if="
            msg.isSelf &&
            msg.sendingState ===
              V2NIMMessageSendingStateEnum.V2NIM_MESSAGE_SENDING_STATE_SUCCEEDED &&
            msg.messageType !== V2NIMMessageTypeEnum.V2NIM_MESSAGE_TYPE_CALL
          "
          :msg="msg"
        />
        <div
          v-else-if="
            msg.sendingState ===
            V2NIMMessageSendingStateEnum.V2NIM_MESSAGE_SENDING_STATE_SENDING
          "
        >
          <Icon
            :size="15"
            color="#337EFF"
            class="msg-status-icon icon-loading"
            type="icon-a-Frame8"
          ></Icon>
        </div>
      </div>
      <div
        v-if="
          msg.sendingState ===
            V2NIMMessageSendingStateEnum.V2NIM_MESSAGE_SENDING_STATE_SUCCEEDED ||
          msg.sendingState ===
            V2NIMMessageSendingStateEnum.V2NIM_MESSAGE_SENDING_STATE_SENDING
        "
      >
        <div
          v-if="bgVisible"
          class="msg-bg"
          :class="[
            msg.isSelf ? 'msg-bg-out' : 'msg-bg-in',
            {
              'msg-bg-no-padding':
                msg.messageType ===
                  V2NIMMessageTypeEnum.V2NIM_MESSAGE_TYPE_IMAGE ||
                msg.messageType ===
                  V2NIMMessageTypeEnum.V2NIM_MESSAGE_TYPE_VIDEO,
            },
          ]"
        >
          <slot></slot>
        </div>
        <slot v-else></slot>
      </div>

      <div
        v-else-if="
          msg.sendingState ===
            V2NIMMessageSendingStateEnum.V2NIM_MESSAGE_SENDING_STATE_FAILED ||
          msg.messageStatus.errorCode === 102426 ||
          msg.messageStatus.errorCode === 104404
        "
        class="msg-failed-wrapper"
      >
        <div class="msg-failed">
          <Popover
            trigger="hover"
            placement="top"
            :align="'center'"
            :modelValue="failedTipVisible"
            @update:modelValue="(v) => (failedTipVisible = v)"
          >
            <div class="msg-status-wrapper" @click="handleResendMsg">
              <div class="icon-fail">!</div>
            </div>
            <template #content>
              <div>{{ errorTipText }}</div>
            </template>
          </Popover>
          <!-- 显示消息内容 -->
          <div
            v-if="bgVisible"
            class="msg-bg"
            :class="[
              msg.isSelf ? 'msg-bg-out' : 'msg-bg-in',
              {
                'msg-bg-no-padding':
                  msg.messageType ===
                    V2NIMMessageTypeEnum.V2NIM_MESSAGE_TYPE_IMAGE ||
                  msg.messageType ===
                    V2NIMMessageTypeEnum.V2NIM_MESSAGE_TYPE_VIDEO,
              },
            ]"
          >
            <slot></slot>
          </div>
          <slot v-else></slot>
        </div>
      </div>
    </div>
    <template #overlay>
      <div class="msg-dropdown-menu">
        <div
          class="msg-dropdown-item"
          v-for="item in msgActions.filter((item) => item.show)"
          :key="item.key"
          @click="handleActionItemClick(item.key)"
        >
          <Icon :type="item.iconType" :size="13"></Icon>
          <span class="action-name">{{ item.name }}</span>
        </div>
      </div>
    </template>
  </MessageDropdown>
</template>

<script>
import Icon from "../../CommonComponents/Icon.vue";
import { events, msgRecallTime } from "../../utils/constants";
import { autorun } from "mobx";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import { t } from "../../utils/i18n";
import emitter from "../../utils/eventBus";
import { showToast } from "../../utils/toast";
import MessageIsRead from "./message-read.vue";
import MessageDropdown from "./message-dropdown.vue";
import Popover from "../../CommonComponents/Popover.vue";
import { nim, uiKitStore } from "../../utils/init";
const { V2NIMMessageType, V2NIMMessageSendingState, V2NIMConversationType } =
  V2NIMConst;
export default {
  name: "MessageBubble",
  components: { Icon, MessageIsRead, MessageDropdown, Popover },
  props: {
    msg: { type: Object, required: true },
    tooltipVisible: { type: Boolean, default: false },
    bgVisible: { type: Boolean, default: true },
    placement: { type: String, default: "bottom" },
  },
  data() {
    return {
      isFriend: true,
      isUnknownMsg: false,
      uninstallFriendsWatch: null,
      failedTipVisible: false,
    };
  },
  computed: {
    V2NIMMessageTypeEnum() {
      return V2NIMMessageType;
    },
    V2NIMMessageSendingStateEnum() {
      return V2NIMMessageSendingState;
    },
    V2NIMConversationTypeEnum() {
      return V2NIMConversationType;
    },
    store() {
      return uiKitStore;
    },
    errorTipText() {
      if (this.msg.messageStatus.errorCode === 102426) {
        return t("sendFailWithInBlackText");
      } else if (this.msg.messageStatus.errorCode === 104404) {
        return t("sendFailWithDeleteText");
      } else if (this.msg.messageStatus.errorCode === 108306) {
        return t("teamBannedText");
      } else {
        return t("msgNetworkErrorText");
      }
    },
    msgActions() {
      return [
        {
          name: t("deleteText"),
          class: "action-delete",
          key: "action-delete",
          show: true,
          iconType: "icon-delete",
        },
        {
          name: t("recallText"),
          class: "action-recall",
          key: "action-recall",
          show:
            this.msg.messageType !==
              V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CALL &&
            this.msg.isSelf &&
            ![
              V2NIMConst.V2NIMMessageSendingState
                .V2NIM_MESSAGE_SENDING_STATE_SENDING,
              V2NIMConst.V2NIMMessageSendingState
                .V2NIM_MESSAGE_SENDING_STATE_FAILED,
            ].includes(this.msg.sendingState),
          iconType: "icon-recall",
        },
        {
          name: t("replyText"),
          class: "action-reply",
          key: "action-reply",
          iconType: "icon-reply",
          show:
            this.msg.messageType !==
              V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CALL &&
            ![
              V2NIMConst.V2NIMMessageSendingState
                .V2NIM_MESSAGE_SENDING_STATE_SENDING,
              V2NIMConst.V2NIMMessageSendingState
                .V2NIM_MESSAGE_SENDING_STATE_FAILED,
            ].includes(this.msg.sendingState),
        },
        {
          name: t("forwardText"),
          class: "action-forward",
          key: "action-forward",
          iconType: "icon-forward",
          show:
            this.msg.messageType !==
              V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CALL &&
            this.msg.messageType !==
              V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO &&
            ![
              V2NIMConst.V2NIMMessageSendingState
                .V2NIM_MESSAGE_SENDING_STATE_SENDING,
              V2NIMConst.V2NIMMessageSendingState
                .V2NIM_MESSAGE_SENDING_STATE_FAILED,
            ].includes(this.msg.sendingState),
        },
        {
          name: t("collectionText"),
          class: "action-collect",
          key: "action-collect",
          show:
            this.msg.messageType !==
              V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CALL &&
            this.msg &&
            this.msg.sendingState ===
              V2NIMConst.V2NIMMessageSendingState
                .V2NIM_MESSAGE_SENDING_STATE_SUCCEEDED,
          iconType: "icon-collection",
        },
      ];
    },
  },
  created() {
    this.uninstallFriendsWatch = autorun(() => {
      const ids = this.store?.uiStore.friends
        .filter(
          (item) =>
            !this.store?.relationStore.blacklist.includes(item.accountId)
        )
        .map((item) => item.accountId);
      this.isFriend = ids.some((id) => id === this.msg.receiverId);
    });
  },
  mounted() {
    this.isUnknownMsg = !(
      this.msg.messageType ==
        V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT ||
      this.msg.messageType ==
        V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE ||
      this.msg.messageType ==
        V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_FILE ||
      this.msg.messageType ==
        V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO ||
      this.msg.messageType ==
        V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO ||
      this.msg.messageType ==
        V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CALL
    );
  },
  beforeDestroy() {
    if (this.uninstallFriendsWatch) this.uninstallFriendsWatch();
  },
  methods: {
    t,
    handleActionItemClick(key) {
      switch (key) {
        case "action-delete":
          this.handleDeleteMsg();
          break;
        case "action-recall":
          this.handleRecallMsg();
          break;
        case "action-reply":
          this.handleReplyMsg();
          break;
        case "action-forward":
          this.handleForwardMsg();
          break;
        case "action-collect":
          this.handleCollectMsg();
          break;
        default:
          break;
      }
    },
    handleForwardMsg() {
      emitter.emit(events.CONFIRM_FORWARD_MSG, this.msg);
    },
    scrollBottom() {
      const timer = setTimeout(() => {
        emitter.emit(events.ON_SCROLL_BOTTOM);
        clearTimeout(timer);
      }, 300);
    },
    async handleCollectMsg() {
      try {
        const conversationId = this.store?.uiStore.selectedConversation;
        const conversation = this.store?.sdkOptions?.enableV2CloudConversation
          ? this.store?.conversationStore?.conversations.get(conversationId)
          : this.store?.localConversationStore?.conversations.get(
              conversationId
            );
        const conversationType =
          nim.V2NIMConversationIdUtil.parseConversationType(
            this.msg.conversationId
          );
        const isTeamMessage =
          conversationType ===
          V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM;
        const teamId = isTeamMessage
          ? nim.V2NIMConversationIdUtil.parseConversationTargetId(
              this.msg.conversationId
            )
          : undefined;
        await nim.V2NIMMessageService.addCollection({
          collectionType: this.msg.messageType + 1000,
          collectionData: JSON.stringify({
            message: nim.V2NIMMessageConverter.messageSerialization(this.msg),
            conversationName: conversation?.name,
            senderName: this.store?.uiStore.getAppellation({
              account: this.msg.senderId,
              teamId,
            }),
            avatar: this.store?.userStore.users.get(this.msg.senderId)?.avatar,
          }),
          uniqueId: this.msg.messageServerId,
        });
        showToast({ message: t("addCollectionSuccessText"), type: "success" });
      } catch (error) {
        showToast({ message: t("addCollectionFailedText"), type: "error" });
      }
    },
    async handleResendMsg() {
      this.failedTipVisible = false;
      const _msg = this.msg;
      this.store?.msgStore.removeMsg(_msg.conversationId, [
        _msg.messageClientId,
      ]);
      try {
        if (_msg.threadReply) {
          const beReplyMsg =
            await nim.V2NIMMessageService.getMessageListByRefers([
              _msg.threadReply,
            ]);
          if (beReplyMsg.length > 0) {
            this.store?.msgStore.replyMsgActive(beReplyMsg[0]);
          }
        }
        switch (_msg.messageType) {
          case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE:
          case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO:
            this.store?.msgStore
              .sendMessageActive({
                msg: _msg,
                conversationId: _msg.conversationId,
                progress: () => true,
                sendBefore: () => {
                  this.scrollBottom();
                },
              })
              .then(() => {
                this.scrollBottom();
              });
            break;
          case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT:
            this.store?.msgStore.sendMessageActive({
              msg: _msg,
              conversationId: _msg.conversationId,
              sendBefore: () => {
                this.scrollBottom();
              },
            });
            break;
          default:
            this.store?.msgStore.sendMessageActive({
              msg: _msg,
              conversationId: _msg.conversationId,
              sendBefore: () => {
                this.scrollBottom();
              },
            });
            break;
        }
        this.scrollBottom();
      } catch (error) {
        console.log(error);
      }
    },
    async handleReplyMsg() {
      const _msg = this.msg;
      this.store?.msgStore.replyMsgActive(_msg);
      emitter.emit(events.REPLY_MSG, this.msg);
      if (
        this.msg.conversationType ===
          V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM &&
        !this.msg.isSelf
      ) {
        emitter.emit(events.AIT_TEAM_MEMBER, {
          accountId: this.msg.senderId,
          appellation: this.store?.uiStore.getAppellation({
            account: this.msg.senderId,
            teamId: this.msg.receiverId,
            ignoreAlias: true,
          }),
        });
      }
    },
    handleRecallMsg() {
      const diff = Date.now() - this.msg.createTime;
      if (diff > msgRecallTime) {
        showToast({ message: t("msgRecallTimeErrorText"), type: "info" });
        return;
      }
      this.store?.msgStore.reCallMsgActive(this.msg).catch(() => {
        showToast({ message: t("recallMsgFailText"), type: "info" });
      });
    },
    handleDeleteMsg() {
      this.store?.msgStore.deleteMsgActive([this.msg]);
      this.store?.msgStore.removeMsg(this.msg.conversationId, [
        this.msg.messageClientId,
      ]);
    },
  },
};
</script>

<style scoped>
.msg-bubble {
  display: flex;
  position: relative;
}

.msg-bg {
  max-width: 550px;
  width: fit-content;
  overflow: hidden;
  padding: 12px 16px;
}

.msg-bg-no-padding {
  padding: 0;
}

.msg-bg-in {
  border-radius: 0 8px 8px 8px;
  background-color: #e8eaed;
  margin-left: 8px;
}

.msg-bg-out {
  border-radius: 8px 0 8px 8px;
  background-color: #d6e5f6;
  margin-right: 8px;
}

.msg-action-groups {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  max-width: 224px;
  width: max-content;
}

.msg-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
  width: 56px;
}

.msg-action-btn-icon {
  color: #656a72;
  font-size: 18px;
}

.msg-action-btn-text {
  color: #000;
  font-size: 14px;
  word-break: keep-all;
}

.msg-failed-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: 100%;
}

.msg-failed-wrapper .in-blacklist {
  color: #b3b7bc;
  font-size: 14px;
  position: relative;
  right: 20%;
  margin: 10px 0;
}

.msg-failed-wrapper .friend-delete {
  color: #b3b7bc;
  font-size: 14px;
  margin: 10px 0;
}

.msg-failed-wrapper .friend-delete .friend-verification {
  color: #337eff;
  font-size: 14px;
}

.msg-status-wrapper {
  box-sizing: border-box;
  display: flex;
  align-items: flex-end;
}

.msg-status-wrapper .msg-bg-out {
  margin-right: 0;
  flex: 1;
}

.msg-status-icon {
  margin-right: 8px;
  font-size: 21px;
  color: #337eff;
}

@keyframes loadingCircle {
  100% {
    transform: rotate(360deg);
  }
}

.icon-loading {
  color: #337eff;
  margin-right: 8px;
  animation: loadingCircle 1s infinite linear;
}

.icon-fail {
  background: #fc596a;
  color: white;
  border-radius: 50%;
  width: 15px;
  height: 15px;
  text-align: center;
  line-height: 15px;
  font-size: 12px;
  flex-shrink: 0;
  cursor: pointer;
}

.msg-failed {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 8px;
}

.msg-dropdown-item {
  padding: 5px 12px;
  height: 32px;
  box-sizing: border-box;
  font-size: 14px;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.85);
  cursor: pointer;
  display: flex;
  align-items: center;
}

.msg-dropdown-item:hover {
  background-color: #f5f5f5;
}

.action-name {
  margin-left: 5px;
  font-size: 14px;
}
</style>
