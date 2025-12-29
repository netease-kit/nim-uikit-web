<template>
  <!-- 文本消息 -->
  <div v-if="msg.messageType == V2NIMMessageTypeEnum.V2NIM_MESSAGE_TYPE_TEXT">
    <!-- 回复消息 -->
    <ReplyMessage
      :visible="showReply && !!msg.threadReply"
      :replyMsg="replyMsg"
    ></ReplyMessage>
    <MessageText :msg="msg"></MessageText>
  </div>
  <!-- 图片消息 -->
  <MessageImage
    v-else-if="msg.messageType == V2NIMMessageTypeEnum.V2NIM_MESSAGE_TYPE_IMAGE"
    :msg="msg"
  />
  <!-- 视频消息 -->
  <MessageVideo
    v-else-if="msg.messageType == V2NIMMessageTypeEnum.V2NIM_MESSAGE_TYPE_VIDEO"
    :msg="msg"
  />
  <!-- 音视频消息 -->
  <MessageG2
    v-else-if="msg.messageType == V2NIMMessageTypeEnum.V2NIM_MESSAGE_TYPE_CALL"
    :msg="msg"
  />
  <!-- 文件消息 -->
  <MessageFile
    v-else-if="msg.messageType == V2NIMMessageTypeEnum.V2NIM_MESSAGE_TYPE_FILE"
    :msg="msg"
  />
  <!-- 语音消息 -->
  <MessageAudio
    v-else-if="msg.messageType == V2NIMMessageTypeEnum.V2NIM_MESSAGE_TYPE_AUDIO"
    :msg="msg"
  />
  <!-- 未知消息 -->
  <div v-else>
    <div class="unknown-msg">[{{ t("unknownMsgText") }}]</div>
  </div>
</template>

<script>
import ReplyMessage from "./message-reply.vue";
import MessageFile from "./message-file.vue";
import MessageText from "./message-text.vue";
import MessageAudio from "./message-audio.vue";
import MessageG2 from "./message-g2.vue";
import MessageImage from "./message-image.vue";
import MessageVideo from "./message-video.vue";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import { t } from "../../utils/i18n";

export default {
  name: "MessageItemContent",
  components: {
    ReplyMessage,
    MessageFile,
    MessageText,
    MessageAudio,
    MessageG2,
    MessageImage,
    MessageVideo,
  },
  props: {
    msg: { type: Object, required: true },
    replyMsg: { type: Object, default: null },
    showReply: { type: Boolean, default: true },
  },
  computed: {
    V2NIMMessageTypeEnum() {
      return V2NIMConst.V2NIMMessageType;
    },
  },

  methods: {
    t,
  },
};
</script>

<style scoped>
.unknown-msg {
  font-size: 14px;
  color: #000000;
}
</style>
