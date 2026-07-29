<template>
  <MessageDropdown
    placement="bottom"
    trigger="contextmenu"
    :disabled="props.readonly"
  >
    <div
      class="msg-bubble"
      :style="{ justifyContent: !msg.isSelf ? 'flex-start' : 'flex-end' }"
    >
      <div class="msg-status-wrapper">
        <MessageIsRead
          v-if="
            props.msg.isSelf &&
            isNormalMsg &&
            props.msg.sendingState ===
              V2NIMConst.V2NIMMessageSendingState
                .V2NIM_MESSAGE_SENDING_STATE_SUCCEEDED
          "
          :msg="msg"
        />
        <div
          v-else-if="
            props.msg.sendingState ===
            V2NIMConst.V2NIMMessageSendingState
              .V2NIM_MESSAGE_SENDING_STATE_SENDING
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
        v-if="isNormalMsg"
      >
        <div
          v-if="bgVisible"
          class="msg-bg"
          :class="[
            msg.isSelf ? 'msg-bg-out' : 'msg-bg-in',
            {
              'msg-bg-no-padding':
                msg.messageType ===
                  V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE ||
                msg.messageType ===
                  V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO,
            },
          ]"
        >
          <slot></slot>
        </div>
        <slot v-else></slot>
      </div>

      <div
        v-else-if="isFailedMsg"
        class="msg-failed-wrapper"
      >
        <div class="msg-failed">
          <Popover trigger="hover" placement="top" :align="'center'">
            <div class="msg-status-wrapper" @click="handleResendMsg">
              <div
                class="icon-fail"
                :class="{ 'icon-fail-antispam': isAntispamMsg }"
              >
                !
              </div>
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
                    V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE ||
                  msg.messageType ===
                    V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO,
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
          @click="() => handleActionItemClick(item.key)"
        >
          <Icon :type="item.iconType" :size="13"></Icon>
          <span class="action-name">{{ item.name }}</span>
        </div>
      </div>
    </template>
  </MessageDropdown>
</template>

<script lang="ts" setup>
/** 消息气泡 */
import { onMounted, onUnmounted, ref, computed, nextTick } from "vue";
import Icon from "../../CommonComponents/Icon.vue";
import { events } from "../../utils/constants";
import { autorun } from "mobx";
import type { V2NIMMessageForUI } from "@xkit-yx/im-store-v2/dist/types/src/types";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import { msgRecallTime } from "../../utils/constants";
import { t } from "../../utils/i18n";
import emitter from "../../utils/eventBus";
import { showToast } from "../../utils/toast";
import { copyText } from "../../utils";
import MessageIsRead from "./message-read.vue";
import MessageDropdown from "./message-dropdown.vue";
import Popover from "../../CommonComponents/Popover.vue";
import { nim, store } from "../../utils/init";
import {
  getAntispamLabelLocaleKey,
  getAntispamReasonFromMessage,
  getMessageErrorCode,
  isAntispamMessage,
  isFailedMessage,
  isNormalMessage,
  isStructuredAntispamReason,
} from "./message-status";

const props = withDefaults(
  defineProps<{
    msg: V2NIMMessageForUI;
    tooltipVisible?: boolean;
    bgVisible?: boolean;
    placement?: string;
    readonly?: boolean;
  }>(),
  {
    readonly: false,
  },
);

const messageErrorCode = computed(() => getMessageErrorCode(props.msg));
const isNormalMsg = computed(() =>
  isNormalMessage(
    props.msg,
    V2NIMConst.V2NIMMessageSendingState
      .V2NIM_MESSAGE_SENDING_STATE_SUCCEEDED,
    V2NIMConst.V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_SENDING,
    V2NIMConst.V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_UNKNOWN,
  ),
);
const isFailedMsg = computed(() =>
  isFailedMessage(
    props.msg,
    V2NIMConst.V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_FAILED,
  ),
);

const getAntispamReason = () => {
  const messageReason = getAntispamReasonFromMessage(props.msg);

  if (messageReason) {
    return messageReason;
  }

  const msgStore = store?.msgStore as unknown as {
    getAntispamReason?: (msg: V2NIMMessageForUI) => string | null;
  };

  return msgStore?.getAntispamReason?.(props.msg) || "";
};

const formatAntispamReason = (reason: string) => {
  const labelKey = getAntispamLabelLocaleKey(reason);

  if (labelKey) {
    return t("messageStoreAntispamTipWithType").replace("{type}", t(labelKey));
  }

  return isStructuredAntispamReason(reason)
    ? t("messageStoreAntispamTip")
    : reason;
};

const antispamReason = computed(() => getAntispamReason());
const isAntispamMsg = computed(
  () => isAntispamMessage(props.msg) || !!antispamReason.value,
);
const isPendingOrFailedMsg = computed(() =>
  [
    V2NIMConst.V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_SENDING,
    V2NIMConst.V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_FAILED,
  ].includes(props.msg.sendingState),
);
const isTextMsg = computed(
  () =>
    props.msg.messageType ===
    V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT,
);
const isLimitedActionMessage = computed(
  () =>
    props.msg.messageType ===
      V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CALL ||
    isUnknownMsg.value ||
    isAntispamMsg.value ||
    isPendingOrFailedMsg.value,
);

const errorTipText = computed(() => {
  // 消息发送失败时，在感叹号，hover上提示失败原因
  if (messageErrorCode.value === 102426) {
    return t("sendFailWithInBlackText");
  } else if (messageErrorCode.value === 104404) {
    return t("sendFailWithDeleteText");
  } else if (isAntispamMsg.value) {
    return antispamReason.value
      ? formatAntispamReason(antispamReason.value)
      : t("messageStoreAntispamTip");
  } else if (messageErrorCode.value === 108306) {
    return t("teamBannedText");
  } else {
    return t("msgNetworkErrorText");
  }
});

const isFriend = ref(true);

// 未知消息
const isUnknownMsg = ref(false);

const msgActions = computed(() => {
  return [
    {
      name: t("copyText"),
      class: "action-copy",
      key: "action-copy",
      show: isTextMsg.value,
      iconType: "icon-fuzhi1",
    },
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
        !isLimitedActionMessage.value &&
        props.msg.isSelf &&
        props.msg.sendingState ===
          V2NIMConst.V2NIMMessageSendingState
            .V2NIM_MESSAGE_SENDING_STATE_SUCCEEDED,

      iconType: "icon-recall",
    },
    {
      name: t("replyText"),
      class: "action-reply",
      key: "action-reply",
      iconType: "icon-reply",
      show: !isLimitedActionMessage.value,
    },
    {
      name: t("forwardText"),
      class: "action-forward",
      key: "action-forward",
      iconType: "icon-forward",
      show:
        !isLimitedActionMessage.value &&
        props.msg.messageType !==
          V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO,
    },
    {
      name: t("collectionText"),
      class: "action-collect",
      key: "action-collect",
      show:
        !isLimitedActionMessage.value &&
        props.msg &&
        props.msg.sendingState ===
          V2NIMConst.V2NIMMessageSendingState
            .V2NIM_MESSAGE_SENDING_STATE_SUCCEEDED,
      iconType: "icon-collection",
    },
    {
      name: t("voiceToText"),
      class: "action-voice-to-text",
      key: "action-voice-to-text",
      show:
        !isLimitedActionMessage.value &&
        props.msg.messageType ===
          V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO &&
        !props.msg.textOfVoice,
      iconType: "icon-zhuanwenzi",
    },
    {
      name: t("multiSelectText"),
      class: "action-multi-select",
      key: "action-multi-select",
      show: true,
      iconType: "icon-duoxuan",
    },
  ];
});

const handleActionItemClick = (key: string) => {
  switch (key) {
    case "action-copy":
      handleCopyMsg();
      break;
    case "action-delete":
      handleDeleteMsg();
      break;
    case "action-recall":
      handleRecallMsg();
      break;
    case "action-reply":
      handleReplyMsg();
      break;
    case "action-forward":
      handleForwardMsg();
      break;
    case "action-collect":
      handleCollectMsg();
      break;
    case "action-voice-to-text":
      handleVoiceToTextMsg();
      break;
    case "action-multi-select":
      handleMultiSelectMsg();
      break;
    default:
      break;
  }
};

const handleMultiSelectMsg = () => {
  store.uiStore.setMultiSelectMode(true);

  if (props.msg.messageClientId) {
    store.uiStore.selectMessage(props.msg.messageClientId);
    nextTick(() => {
      emitter.emit(events.SCROLL_MSG_INTO_VIEW, props.msg.messageClientId);
    });
  }
};

const handleForwardMsg = () => {
  emitter.emit(events.CONFIRM_FORWARD_MSG, props.msg);
};

const handleCopyMsg = () => {
  copyText(props.msg.text || "");
  showToast({
    message: t("copySuccessText"),
    type: "success",
  });
};

const handleVoiceToTextMsg = async () => {
  try {
    showToast({
      message: t("voiceToTextLoadingText"),
      type: "info",
      duration: 1000,
    });
    await store.msgStore.voiceToTextActive(props.msg);
  } catch {
    showToast({
      message: t("voiceToTextFailedText"),
      type: "error",
    });
  }
};

const scrollBottom = async () => {
  const timer = setTimeout(() => {
    emitter.emit(events.ON_SCROLL_BOTTOM);
    clearTimeout(timer);
  }, 300);
};

// 收藏消息
const handleCollectMsg = async () => {
  try {
    const conversationId = store?.uiStore.selectedConversation as string;

    const conversation = store?.sdkOptions?.enableV2CloudConversation
      ? store?.conversationStore?.conversations.get(conversationId)
      : store?.localConversationStore?.conversations.get(conversationId);

    const conversationType = nim.V2NIMConversationIdUtil.parseConversationType(
      props.msg.conversationId,
    ) as unknown as V2NIMConst.V2NIMConversationType
    const isTeamMessage =
      conversationType ===
      V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM; // V2NIM_CONVERSATION_TYPE_TEAM

    // 获取teamId（如果是群聊）
    const teamId = isTeamMessage
      ? nim.V2NIMConversationIdUtil.parseConversationTargetId(
          props.msg.conversationId,
        )
      : undefined;

    await nim.V2NIMMessageService.addCollection({
      collectionType: props.msg.messageType + 1000,
      collectionData: JSON.stringify({
        message: nim.V2NIMMessageConverter.messageSerialization(
          //@ts-ignore
          props.msg,
        ),
        conversationName: conversation?.name,
        senderName: store?.uiStore.getAppellation({
          account: props.msg.senderId,
          teamId: teamId,
        }),
        avatar: store?.userStore.users.get(props.msg.senderId)?.avatar,
      }),
      uniqueId: props.msg.messageServerId,
    });
    showToast({
      message: t("addCollectionSuccessText"),
      type: "success",
    });
  } catch (error: unknown) {
    showToast({
      message: t("addCollectionFailedText"),
      type: "error",
    });
  }
};

// 重发消息
const handleResendMsg = async () => {
  if (isAntispamMsg.value) {
    return;
  }

  const _msg = props.msg as V2NIMMessageForUI;
  store.msgStore.removeMsg(_msg.conversationId, [
    _msg.messageClientId,
  ]);

  try {
    if (_msg.threadReply) {
      const beReplyMsg =
        await nim.V2NIMMessageService.getMessageListByRefers([
          //@ts-ignore
          _msg.threadReply,
        ]);
      if (beReplyMsg.length > 0) {
          //@ts-ignore
        store?.msgStore.replyMsgActive(beReplyMsg[0]);
      }
    }
    switch (_msg.messageType) {
      case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE:
      case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO:
        store?.msgStore
          .sendMessageActive({
            msg: _msg,
            conversationId: _msg.conversationId,
            progress: () => true,
            sendBefore: () => {
              scrollBottom();
            },
          })
          .then(() => {
            scrollBottom();
          });
        break;
      case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT:
        store?.msgStore.sendMessageActive({
          msg: _msg,
          conversationId: _msg.conversationId,
          sendBefore: () => {
            scrollBottom();
          },
        });
        break;
      default:
        store?.msgStore.sendMessageActive({
          msg: _msg,
          conversationId: _msg.conversationId,
          sendBefore: () => {
            scrollBottom();
          },
        });
        break;
    }
    scrollBottom();
  } catch (error) {
    console.log(error);
  }
};

// 回复消息
const handleReplyMsg = async () => {
  const _msg = props.msg;
  store.msgStore.replyMsgActive(_msg);
  emitter.emit(events.REPLY_MSG, props.msg);
  // 在群里回复其他人的消息，也是@被回复人
  if (
    props.msg.conversationType ===
      V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM &&
    !props.msg.isSelf
  ) {
    emitter.emit(events.AIT_TEAM_MEMBER, {
      accountId: props.msg.senderId,
      appellation: store?.uiStore.getAppellation({
        account: props.msg.senderId,
        teamId: props.msg.receiverId,
        ignoreAlias: true,
      }),
    });
  }
};

// 撤回消息
const handleRecallMsg = () => {
  const diff = Date.now() - props.msg.createTime;
  if (diff > msgRecallTime) {
    showToast({
      message: t("msgRecallTimeErrorText"),
      type: "info",
    });
    return;
  }

  store.msgStore.reCallMsgActive(props.msg).catch(() => {
    showToast({
      message: t("recallMsgFailText"),
      type: "info",
    });
  });
};

// 删除消息
const handleDeleteMsg = () => {
  store.msgStore.deleteMsgActive([props.msg]);
  store.msgStore.removeMsg(props.msg.conversationId, [
    props.msg.messageClientId,
  ]);
};

const uninstallFriendsWatch = autorun(() => {
  const _isFriend = store.uiStore.friends
    .filter(
      (item) =>
        !store.relationStore.blacklist.includes(item.accountId),
    )
    .map((item) => item.accountId)
    .some((item: any) => item.account === props.msg.receiverId);
  isFriend.value = _isFriend as boolean;
});

onMounted(() => {
  // 当前版本仅支持文本、图片、文件、语音、视频 话单消息，其他消息类型统一为未知消息
  isUnknownMsg.value = !(
    props.msg.messageType ==
      V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT ||
    props.msg.messageType ==
      V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE ||
    props.msg.messageType ==
      V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_FILE ||
    props.msg.messageType ==
      V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO ||
    props.msg.messageType ==
      V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO ||
    props.msg.messageType == V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CALL
  );
});

//卸载监听
onUnmounted(() => {
  uninstallFriendsWatch();
});
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

.icon-fail-antispam {
  background: #a8b0bd;
  cursor: default;
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
  min-width: 35px;
  white-space: nowrap;
}
</style>
