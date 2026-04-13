<template>
  <!-- 文本消息 -->
  <div
    v-if="
      props.msg.messageType ===
        V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT &&
      props.msg.streamConfig == undefined
    "
  >
    <!-- 回复消息 -->
    <ReplyMessage
      :visible="!!props.msg.threadReply && props.showReply"
      :replyMsg="replyMsg"
    />
    <MessageText :msg="props.msg"></MessageText>
  </div>

  <!-- 流式消息（Markdown）格式 -->
  <div
    v-else-if="
      props.msg.aiConfig?.aiStatus ===
        V2NIMConst.V2NIMMessageAIStatus.V2NIM_MESSAGE_AI_STATUS_RESPONSE ||
      props.msg.streamConfig !== undefined
    "
  >
    <ReplyMessage
      :visible="!!props.msg.threadReply && props.showReply"
      :replyMsg="replyMsg"
    />
    <MessageAIMarkdown :msg="props.msg" />
  </div>
  <!-- 图片消息 -->
  <MessageImage
    v-else-if="
      props.msg.messageType ===
      V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE
    "
    :msg="props.msg"
  />
  <!-- 视频消息 -->
  <MessageVideo
    v-else-if="
      props.msg.messageType ===
      V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO
    "
    :msg="msg"
  />
  <!-- 音视频消息 -->
  <MessageG2
    v-else-if="
      props.msg.messageType ===
      V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CALL
    "
    :msg="props.msg"
  />
  <!-- 文件消息 -->
  <MessageFile
    v-else-if="
      props.msg.messageType ===
      V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_FILE
    "
    :msg="props.msg"
  />
  <!-- 语音消息 -->
  <MessageAudio
    v-else-if="
      props.msg.messageType ===
      V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO
    "
    :msg="props.msg"
  />

  <!-- 未知消息 -->
  <div v-else>
    <div class="unknown-msg">[{{ t("unknownMsgText") }}]</div>
  </div>
</template>

<script lang="ts" setup>
/** 消息内容 */
import ReplyMessage from "./message-reply.vue";
import MessageFile from "./message-file.vue";
import MessageText from "./message-text.vue";
import MessageAudio from "./message-audio.vue";
import MessageG2 from "./message-g2.vue";
import MessageImage from "./message-image.vue";
import MessageVideo from "./message-video.vue";
import MessageAIMarkdown from "./message-ai-markdown.vue";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import { t } from "../../utils/i18n";
import type { V2NIMMessageForUI } from "@xkit-yx/im-store-v2/dist/types/types";

const props = withDefaults(
  defineProps<{
    msg: V2NIMMessageForUI & { timeValue?: number };
    replyMsg?: V2NIMMessageForUI;
    showReply?: boolean;
  }>(),
  { showReply: true },
);
</script>

<style scoped>
.unknown-msg {
  font-size: 14px;
  color: #000000;
}
</style>
