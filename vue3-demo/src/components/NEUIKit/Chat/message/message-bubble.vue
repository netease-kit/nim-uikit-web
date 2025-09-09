<template>
  <MessageDropdown placement="bottom" trigger="contextmenu">
    <div
      class="msg-bubble"
      :style="{ justifyContent: !msg.isSelf ? 'flex-start' : 'flex-end' }"
    >
      <div class="msg-status-wrapper">
        <MessageIsRead
          v-if="
            props.msg.isSelf &&
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
        v-if="
          props.msg.sendingState ===
            V2NIMConst.V2NIMMessageSendingState
              .V2NIM_MESSAGE_SENDING_STATE_SUCCEEDED ||
          props.msg.sendingState ===
            V2NIMConst.V2NIMMessageSendingState
              .V2NIM_MESSAGE_SENDING_STATE_SENDING
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
        v-else-if="
          props.msg.sendingState ===
            V2NIMConst.V2NIMMessageSendingState
              .V2NIM_MESSAGE_SENDING_STATE_FAILED ||
          props.msg.messageStatus.errorCode === 102426 ||
          props.msg.messageStatus.errorCode === 104404
        "
        class="msg-failed-wrapper"
      >
        <div class="msg-failed">
          <Popover trigger="hover" placement="top" :align="'center'">
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
import { onMounted, onUnmounted, ref, getCurrentInstance, computed } from "vue";
import Icon from "../../CommonComponents/Icon.vue";
import { events } from "../../utils/constants";
import { autorun } from "mobx";
import type { V2NIMMessageForUI } from "@xkit-yx/im-store-v2/dist/types/types";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import { msgRecallTime } from "../../utils/constants";
import { t } from "../../utils/i18n";
import emitter from "../../utils/eventBus";
import { showToast } from "../../utils/toast";
import MessageIsRead from "./message-read.vue";
import MessageDropdown from "./message-dropdown.vue";
import Popover from "../../CommonComponents/Popover.vue";
const props = withDefaults(
  defineProps<{
    msg: V2NIMMessageForUI;
    tooltipVisible?: boolean;
    bgVisible?: boolean;
    placement?: string;
  }>(),
  {}
);

const { proxy } = getCurrentInstance()!; // 获取组件实例

const store = proxy?.$UIKitStore;

const errorTipText = computed(() => {
  // 消息发送失败时，在感叹号，hover上提示失败原因
  if (props.msg.messageStatus.errorCode === 102426) {
    return t("sendFailWithInBlackText");
  } else if (props.msg.messageStatus.errorCode === 104404) {
    return t("sendFailWithDeleteText");
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
        props.msg.messageType !==
          V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CALL &&
        props.msg.isSelf &&
        ![
          V2NIMConst.V2NIMMessageSendingState
            .V2NIM_MESSAGE_SENDING_STATE_SENDING,
          V2NIMConst.V2NIMMessageSendingState
            .V2NIM_MESSAGE_SENDING_STATE_FAILED,
        ].includes(props.msg.sendingState),

      iconType: "icon-recall",
    },
    {
      name: t("replyText"),
      class: "action-reply",
      key: "action-reply",
      iconType: "icon-reply",
      show:
        props.msg.messageType !==
          V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CALL &&
        [
          V2NIMConst.V2NIMMessageSendingState
            .V2NIM_MESSAGE_SENDING_STATE_SENDING,
          V2NIMConst.V2NIMMessageSendingState
            .V2NIM_MESSAGE_SENDING_STATE_FAILED,
        ].includes(props.msg.sendingState)
          ? false
          : true,
    },
    {
      name: t("forwardText"),
      class: "action-forward",
      key: "action-forward",
      iconType: "icon-forward",
      show:
        props.msg.messageType !==
          V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CALL &&
        props.msg.messageType !==
          V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO &&
        ![
          V2NIMConst.V2NIMMessageSendingState
            .V2NIM_MESSAGE_SENDING_STATE_SENDING,
          V2NIMConst.V2NIMMessageSendingState
            .V2NIM_MESSAGE_SENDING_STATE_FAILED,
        ].includes(props.msg.sendingState),
    },
  ];
});

const handleActionItemClick = (key: string) => {
  switch (key) {
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
      emitter.emit(events.CONFIRM_FORWARD_MSG, props.msg);
      break;
    default:
      break;
  }
};

const scrollBottom = async () => {
  const timer = setTimeout(() => {
    emitter.emit(events.ON_SCROLL_BOTTOM);
    clearTimeout(timer);
  }, 300);
};

// 重发消息
const handleResendMsg = async () => {
  const _msg = props.msg as V2NIMMessageForUI;
  proxy?.$UIKitStore.msgStore.removeMsg(_msg.conversationId, [
    _msg.messageClientId,
  ]);

  try {
    if (_msg.threadReply) {
      const beReplyMsg =
        await proxy?.$NIM.V2NIMMessageService.getMessageListByRefers([
          _msg.threadReply,
        ]);
      if (beReplyMsg.length > 0) {
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
  proxy?.$UIKitStore.msgStore.replyMsgActive(_msg);
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

  proxy?.$UIKitStore.msgStore.reCallMsgActive(props.msg).catch(() => {
    showToast({
      message: t("recallMsgFailText"),
      type: "info",
    });
  });
};

// 删除消息
const handleDeleteMsg = () => {
  proxy?.$UIKitStore.msgStore.deleteMsgActive([props.msg]);
  proxy?.$UIKitStore.msgStore.removeMsg(props.msg.conversationId, [
    props.msg.messageClientId,
  ]);
};

const uninstallFriendsWatch = autorun(() => {
  const _isFriend = proxy?.$UIKitStore.uiStore.friends
    .filter(
      (item) =>
        !proxy?.$UIKitStore.relationStore.blacklist.includes(item.accountId)
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
