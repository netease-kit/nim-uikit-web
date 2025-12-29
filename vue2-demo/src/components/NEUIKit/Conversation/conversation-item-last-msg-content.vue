<template>
  <!-- 会话项“最后一条消息内容”渲染：按消息状态/类型展示对应文案或文本/表情 -->
  <div>
    <!-- 撤回消息：显示“撤回”文案 -->
    <div
      v-if="
        lastMessage.lastMessageState ===
        V2NIMLastMessageStateEnum.V2NIM_MESSAGE_STATUS_REVOKE
      "
    >
      {{ t("recall") }}
    </div>
    <!-- 系统/通知消息：显示通知占位文案 -->
    <div
      v-else-if="
        lastMessage.messageType ===
        V2NIMMessageTypeEnum.V2NIM_MESSAGE_TYPE_NOTIFICATION
      "
    >
      {{ t("conversationNotificationText") }}
    </div>
    <!-- 发送失败：显示发送失败占位文案 -->
    <div
      v-else-if="
        lastMessage.sendingState ===
        V2NIMMessageSendingStateEnum.V2NIM_MESSAGE_SENDING_STATE_FAILED
      "
    >
      {{ t("conversationSendFailText") }}
    </div>

    <!-- 文件消息：显示“[文件]”占位 -->
    <div
      v-else-if="
        lastMessage.messageType === V2NIMMessageTypeEnum.V2NIM_MESSAGE_TYPE_FILE
      "
    >
      {{ translateMsg("fileMsgText") }}
    </div>
    <!-- 图片消息：显示“[图片消息]”占位 -->
    <div
      v-else-if="
        lastMessage.messageType ===
        V2NIMMessageTypeEnum.V2NIM_MESSAGE_TYPE_IMAGE
      "
    >
      {{ translateMsg("imgMsgText") }}
    </div>
    <!-- 自定义消息：优先显示 lastMessage.text，否则显示“[自定义]”占位 -->
    <div
      v-else-if="
        lastMessage.messageType ===
        V2NIMMessageTypeEnum.V2NIM_MESSAGE_TYPE_CUSTOM
      "
    >
      {{ lastMessage.text || translateMsg("customMsgText") }}
    </div>
    <!-- 语音消息：显示“[语音]”占位 -->
    <div
      v-else-if="
        lastMessage.messageType ===
        V2NIMMessageTypeEnum.V2NIM_MESSAGE_TYPE_AUDIO
      "
    >
      {{ translateMsg("audioMsgText") }}
    </div>
    <!-- 呼叫消息：显示“[通话]”占位 -->
    <div
      v-else-if="
        lastMessage.messageType === V2NIMMessageTypeEnum.V2NIM_MESSAGE_TYPE_CALL
      "
    >
      {{ translateMsg("callMsgText") }}
    </div>
    <!-- 位置消息：显示“[位置]”占位 -->
    <div
      v-else-if="
        lastMessage.messageType ===
        V2NIMMessageTypeEnum.V2NIM_MESSAGE_TYPE_LOCATION
      "
    >
      {{ translateMsg("geoMsgText") }}
    </div>

    <!-- 机器人消息：显示“[机器人]”占位 -->
    <div
      v-else-if="
        lastMessage.messageType ===
        V2NIMMessageTypeEnum.V2NIM_MESSAGE_TYPE_ROBOT
      "
    >
      {{ translateMsg("robotMsgText") }}
    </div>
    <!-- 小提示消息：显示“[提示]”占位 -->
    <div
      v-else-if="
        lastMessage.messageType === V2NIMMessageTypeEnum.V2NIM_MESSAGE_TYPE_TIPS
      "
    >
      {{ translateMsg("tipMsgText") }}
    </div>
    <!-- 视频消息：显示“[视频]”占位 -->
    <div
      v-else-if="
        lastMessage.messageType ===
        V2NIMMessageTypeEnum.V2NIM_MESSAGE_TYPE_VIDEO
      "
    >
      {{ translateMsg("videoMsgText") }}
    </div>
    <!-- 文本消息：解析并按顺序渲染纯文本与表情 -->
    <div
      v-else-if="
        lastMessage.messageType === V2NIMMessageTypeEnum.V2NIM_MESSAGE_TYPE_TEXT
      "
      class="msg-conversation-text-wrap"
    >
      <!-- 将 computed 的 textArr 中的项逐个渲染：text 为纯文本，emoji 为图标 -->
      <span v-for="(item, idx) in textArr" :key="idx">
        <span v-if="item.type === 'text'" class="msg-conversation-text">{{
          item.value
        }}</span>
        <span
          v-else-if="item.type === 'emoji'"
          class="msg-conversation-text-emoji"
        >
          <Icon :type="EMOJI_ICON_MAP_CONFIG[item.value]" :size="16" />
        </span>
      </span>
    </div>
  </div>
</template>

<script>
// 依赖：Icon 组件、IM 常量枚举、国际化函数与表情工具
import Icon from "../CommonComponents/Icon.vue";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import { t as i18nT } from "../utils/i18n";
import { EMOJI_ICON_MAP_CONFIG, emojiRegExp } from "../utils/emoji";

export default {
  name: "ConversationItemLastMsgContent",
  components: { Icon },
  props: {
    lastMessage: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      EMOJI_ICON_MAP_CONFIG,
      V2NIMMessageTypeEnum: V2NIMConst.V2NIMMessageType,
      V2NIMLastMessageStateEnum: V2NIMConst.V2NIMLastMessageState,
      V2NIMMessageSendingStateEnum: V2NIMConst.V2NIMMessageSendingState,
      t: i18nT,
    };
  },
  computed: {
    // 文本消息解析结果：将 lastMessage.text 拆分为包含顺序索引的文本与表情项
    textArr() {
      return this.parseTextWithEmoji(this.lastMessage.text || "");
    },
  },
  methods: {
    // 将文本中的 emoji 与词条按出现顺序拆分，保留 index 以便原位渲染
    parseTextWithEmoji(text) {
      if (!text) return [];
      const matches = [];
      const regexEmoji = emojiRegExp;
      let match;
      // 逐个提取 emoji，并用等长空格占位，记录其在原文本中的 index
      while ((match = regexEmoji.exec(text)) !== null) {
        matches.push({ type: "emoji", value: match[0], index: match.index });
        const fillText = " ".repeat(match[0].length);
        text = text.replace(match[0], fillText);
      }
      // 将残留的 emoji 统一替换为空格，便于后续按空格切分文本
      text = text.replace(regexEmoji, " ");
      if (text) {
        // 按空格切分剩余文本，过滤空项，记录每段文本的起始 index
        text
          .split(" ")
          .filter((item) => item.trim())
          .map((item) => {
            const index = text.indexOf(item);
            matches.push({ type: "text", value: item, index });
            const fillText = " ".repeat(item.length);
            text = text.replace(item, fillText);
          });
      }
      // 按原始出现位置排序，确保渲染顺序与原文本一致
      return matches.sort((a, b) => a.index - b.index);
    },
    // 将消息类型 key 映射到国际化文案，并用中括号包裹显示
    translateMsg(key) {
      const text =
        {
          textMsgText: this.t("textMsgText"),
          customMsgText: this.t("customMsgText"),
          audioMsgText: this.t("audioMsgText"),
          videoMsgText: this.t("videoMsgText"),
          fileMsgText: this.t("fileMsgText"),
          callMsgText: this.t("callMsgText"),
          geoMsgText: this.t("geoMsgText"),
          imgMsgText: this.t("imgMsgText"),
          notiMsgText: this.t("notiMsgText"),
          robotMsgText: this.t("robotMsgText"),
          tipMsgText: this.t("tipMsgText"),
          unknownMsgText: this.t("unknownMsgText"),
        }[key] || "";
      return `[${text}]`;
    },
  },
};
</script>

<style scoped>
/* 文本容器：用于占满剩余空间并做省略显示 */
.wrapper {
  flex: 1;
  font-size: 12px;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* 单个纯文本片段样式 */
.msg-conversation-text {
  font-size: 12px !important;
  height: 22px;
  line-height: 22px;
  width: 100%;
  display: inline;
}

/* 文本消息整体容器：单行省略，保证列表紧凑 */
.msg-conversation-text-wrap {
  width: 100%;
  line-height: 22px;
  height: 22px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  box-sizing: border-box;
  font-size: 14px;
}
/* 表情片段容器：固定尺寸，垂直居中显示图标 */
.msg-conversation-text-emoji {
  display: inline-flex;
  width: 18px;
  height: 18px;
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
}
</style>
