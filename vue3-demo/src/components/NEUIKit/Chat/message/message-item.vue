<template>
  <div
    :class="`msg-item-wrapper ${
      msg.pinState &&
      !(
        msg.messageType ===
          V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CUSTOM &&
        msg.timeValue !== undefined
      ) &&
      !msg.recallType
        ? 'msg-pin'
        : ''
    }`"
    :id="MSG_ID_FLAG + props.msg.messageClientId"
  >
    <!-- 通知消息 -->
    <MessageNotification
      v-if="
        msg.messageType ===
        V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_NOTIFICATION
      "
      :msg="msg"
    />
    <!-- 撤回消息-可重新编辑 -->
    <div
      v-else-if="
        msg.messageType ===
          V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CUSTOM &&
        msg.recallType === 'reCallMsg' &&
        msg.canEdit &&
        msg.isSelf
      "
      class="msg-recall"
    >
      <span class="recall-text">{{ t("you") + t("recall") }}</span>
      <span
        class="msg-recall-btn"
        @click="
          () => {
            handleReeditMsg(props.msg);
          }
        "
      >
        {{ t("reeditText") }}
      </span>
    </div>
    <!-- 撤回消息-不可重新编辑 本端撤回-->
    <div
      v-else-if="
        props.msg.messageType ===
          V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CUSTOM &&
        props.msg.recallType === 'beReCallMsg' &&
        !props.msg.canEdit &&
        props.msg.isSelf
      "
      class="msg-recall"
    >
      {{ t("you") + t("recall") }}
    </div>

    <div
      v-else-if="
        props.msg.messageType ===
          V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CUSTOM &&
        props.msg.recallType === 'reCallMsg' &&
        !props.msg.canEdit &&
        props.msg.isSelf
      "
      class="msg-recall"
    >
      {{ t("you") + t("recall") }}
    </div>
    <!-- 撤回消息 对端撤回 -->
    <div
      v-else-if="
        msg.messageType ===
          V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CUSTOM &&
        msg.recallType === 'beReCallMsg' &&
        !msg.isSelf
      "
    >
      <div class="msg-recall">
        {{ appellation + " " + t("recall") }}
      </div>
    </div>

    <div
      v-else
      class="msg-common"
      :style="{ flexDirection: !msg.isSelf ? 'row' : 'row-reverse' }"
    >
      <MessageAvatar :account="msg.senderId" :to="to" />
      <div
        class="msg-content"
        :style="{ alignItems: !msg.isSelf ? 'flex-start' : 'flex-end' }"
      >
        <div
          class="msg-name"
          :class="{
            'msg-name-left': !msg.isSelf,
            'msg-name-right': msg.isSelf,
          }"
        >
          {{ appellation }}
        </div>
        <MessageBubble :msg="msg" :bg-visible="true">
          <MessageItemContent :msg="msg" :replyMsg="replyMsg" />
        </MessageBubble>
        <!-- 消息时间 -->
        <div
          class="msg-timestamp"
          :class="{ 'msg-timestamp-self': msg.isSelf }"
        >
          {{ formatMessageTime?.(msg.createTime) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
/** 消息项 */
import { ref, computed, onUnmounted, getCurrentInstance } from "vue";
import MessageAvatar from "./message-avatar.vue";
import MessageBubble from "./message-bubble.vue";
import MessageNotification from "./message-notification.vue";
import MessageItemContent from "./message-item-content.vue";
import { events, MSG_ID_FLAG } from "../../utils/constants";
import { autorun } from "mobx";
import { t } from "../../utils/i18n";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import emitter from "../../utils/eventBus";
import type { V2NIMMessageForUI } from "@xkit-yx/im-store-v2/dist/types/types";

const props = withDefaults(
  defineProps<{
    msg: V2NIMMessageForUI & { timeValue?: number };
    index: number;
    replyMsgsMap?: {
      [key: string]: V2NIMMessageForUI;
    };
  }>(),
  {}
);

const { proxy } = getCurrentInstance()!; // 获取组件实例

// 回复消息
const replyMsg = computed(() => {
  return props.replyMsgsMap && props.replyMsgsMap[props.msg.messageClientId];
});

// 昵称
const appellation = ref("");

// 会话类型
const conversationType =
  proxy?.$NIM.V2NIMConversationIdUtil.parseConversationType(
    props.msg.conversationId
  ) as unknown as V2NIMConst.V2NIMConversationType;
// 会话对象
const to = proxy?.$NIM.V2NIMConversationIdUtil.parseConversationTargetId(
  props.msg.conversationId
);

// 重新编辑消息
const handleReeditMsg = (msg: V2NIMMessageForUI) => {
  emitter.emit(events.ON_REEDIT_MSG, msg);
};

// 格式化消息时间
const formatMessageTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  if (messageDate.getTime() === today.getTime()) {
    // 今天的消息，只显示时分秒
    return date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } else {
    // 其他日期的消息，根据是否为今年决定是否显示年份
    const currentYear = now.getFullYear();
    const messageYear = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    const second = String(date.getSeconds()).padStart(2, "0");

    if (messageYear !== currentYear) {
      // 不是今年的消息，显示年-月-日 时:分:秒格式
      return `${messageYear}-${month}-${day} ${hour}:${minute}:${second}`;
    } else {
      // 今年但不是今天的消息，显示月-日 时:分:秒格式
      return `${month}-${day} ${hour}:${minute}:${second}`;
    }
  }
};

// 监听昵称变化
const uninstallAppellationWatch = autorun(() => {
  // 昵称展示顺序 群昵称 > 备注 > 个人昵称 > 帐号
  // 断网重联下，若群成员修改昵称，可以通过拉取群成员接口，触发此函数执行，获取最新的群昵称
  appellation.value = proxy?.$UIKitStore.uiStore.getAppellation({
    account: props.msg.senderId,
    teamId:
      conversationType ===
      V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
        ? to
        : "",
  }) as string;
});

onUnmounted(() => {
  uninstallAppellationWatch();
});
</script>

<style scoped>
.msg-item-wrapper {
  padding: 0 10px 10px 10px;
}

.msg-common {
  padding-top: 8px;
  display: flex;
  align-items: flex-start;
  font-size: 14px;
}
.msg-pin {
  opacity: 1;
  background: #fffbea;
}
.msg-pin-tip {
  font-size: 11px;
  font-weight: normal;
  color: #3eaf96;
  margin: 8px 50px 0 50px;
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
}

.msg-common {
  padding-top: 8px;
  display: flex;
  align-items: flex-start;
  font-size: 16px;
  position: relative;
}

.msg-content {
  display: flex;
  flex-direction: column;
}

.msg-name {
  font-size: 12px;
  color: #999;
  margin: 0 8px;
}

.msg-content .msg-name-left {
  text-align: left;
  margin-right: 0;
  padding-left: 0;
}

.msg-name-right {
  text-align: right;
  margin-right: 8px;
  margin-left: 0;
}

.msg-name {
  font-size: 12px;
  color: #999;
  text-align: left;
  margin-bottom: 4px;
  max-width: 300px;
  padding-left: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.msg-video {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  outline: none;
  display: block;
}

.msg-time {
  margin-top: 8px;
  text-align: center;
  color: #b3b7bc;
  font-size: 12px;
}

.msg-recall-btn {
  margin-left: 5px;
  color: #1861df;
  cursor: pointer;
}

.msg-recall2 {
  font-size: 14px;
}

.msg-recall {
  width: 100%;
  text-align: center;
  overflow: hidden;
  border-radius: 8px 0px 8px 8px;
  margin-right: 8px;
  color: #666666;
  font-size: 14px;
  margin: 10px 0;
}

.recall-text {
  color: #666666;
}

.recall-text {
  color: #666666;
}

.video-msg-wrapper {
  box-sizing: border-box;
  max-width: 360px;
  position: relative;
}

.msg-timestamp {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
  text-align: left;
  padding-left: 10px;
  align-self: flex-start;
}

.msg-timestamp-self {
  text-align: right;
  align-self: flex-end;
  padding-left: 0;
  padding-right: 10px;
}
</style>
