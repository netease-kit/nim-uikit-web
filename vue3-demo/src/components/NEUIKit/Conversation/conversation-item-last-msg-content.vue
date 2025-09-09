<template>
  <div>
    <div
      v-if="
        props.lastMessage.lastMessageState ===
        V2NIMConst.V2NIMLastMessageState.V2NIM_MESSAGE_STATUS_REVOKE
      "
    >
      {{ t("recall") }}
    </div>
    <div
      v-else-if="
        props.lastMessage.messageType ===
        V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_NOTIFICATION
      "
    >
      {{ t("conversationNotificationText") }}
    </div>
    <div
      v-else-if="
        props.lastMessage.sendingState ===
        V2NIMConst.V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_FAILED
      "
    >
      {{ t("conversationSendFailText") }}
    </div>

    <div
      v-else-if="
        props.lastMessage.messageType ===
        V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_FILE
      "
    >
      {{ translateMsg("fileMsgText") }}
    </div>
    <div
      v-else-if="
        props.lastMessage.messageType ===
        V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE
      "
    >
      {{ translateMsg("imgMsgText") }}
    </div>
    <div
      v-else-if="
        props.lastMessage.messageType ===
        V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CUSTOM
      "
    >
      {{ props.lastMessage.text || translateMsg("customMsgText") }}
    </div>
    <div
      v-else-if="
        props.lastMessage.messageType ===
        V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO
      "
    >
      {{ translateMsg("audioMsgText") }}
    </div>
    <div
      v-else-if="
        props.lastMessage.messageType ===
        V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CALL
      "
    >
      {{ translateMsg("callMsgText") }}
    </div>
    <div
      v-else-if="
        props.lastMessage.messageType ===
        V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_LOCATION
      "
    >
      {{ translateMsg("geoMsgText") }}
    </div>

    <div
      v-else-if="
        props.lastMessage.messageType ===
        V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_ROBOT
      "
    >
      {{ translateMsg("robotMsgText") }}
    </div>
    <div
      v-else-if="
        props.lastMessage.messageType ===
        V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_TIPS
      "
    >
      {{ translateMsg("tipMsgText") }}
    </div>
    <div
      v-else-if="
        props.lastMessage.messageType ===
        V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO
      "
    >
      {{ translateMsg("videoMsgText") }}
    </div>
    <div
      v-else-if="
        props.lastMessage.messageType ===
        V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT
      "
      class="msg-conversation-text-wrap"
    >
      <template v-for="item in textArr">
        <template v-if="item.type === 'text'">
          <span class="msg-conversation-text">{{ item.value }}</span>
        </template>
        <template v-else-if="item.type === 'emoji'">
          <span class="msg-conversation-text-emoji">
            <Icon :type="EMOJI_ICON_MAP_CONFIG[item.value]" :size="16" />
          </span>
        </template>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import Icon from "../CommonComponents/Icon.vue";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import { t } from "../utils/i18n";
import type { V2NIMLastMessage } from "nim-web-sdk-ng/dist/esm/nim/src/V2NIMConversationService";
import { EMOJI_ICON_MAP_CONFIG, emojiRegExp } from "../utils/emoji";
const props = withDefaults(
  defineProps<{
    lastMessage: V2NIMLastMessage;
  }>(),
  {}
);

// 筛选出文本和表情
const parseTextWithEmoji = (text: string) => {
  if (!text) return [];
  const matches: {
    type: "emoji" | "text";
    value: string;
    index: number;
  }[] = [];
  let match;
  const regexEmoji = emojiRegExp;

  while ((match = regexEmoji.exec(text)) !== null) {
    matches.push({
      type: "emoji",
      value: match[0],
      index: match.index,
    });
    const fillText = " ".repeat(match[0].length);
    text = text.replace(match[0], fillText);
  }

  text = text.replace(regexEmoji, " ");

  if (text) {
    text
      .split(" ")
      .filter((item) => item.trim())
      .map((item) => {
        const index = text?.indexOf(item);
        matches.push({
          type: "text",
          value: item,
          index,
        });
        const fillText = " ".repeat(item.length);
        text = text.replace(item, fillText);
      });
  }

  return matches.sort((a, b) => a.index - b.index);
};

const textArr = computed(() => {
  return parseTextWithEmoji(props.lastMessage.text as string);
});

const translateMsg = (key: string): string => {
  const text =
    {
      textMsgText: t("textMsgText"),
      customMsgText: t("customMsgText"),
      audioMsgText: t("audioMsgText"),
      videoMsgText: t("videoMsgText"),
      fileMsgText: t("fileMsgText"),
      callMsgText: t("callMsgText"),
      geoMsgText: t("geoMsgText"),
      imgMsgText: t("imgMsgText"),
      notiMsgText: t("notiMsgText"),
      robotMsgText: t("robotMsgText"),
      tipMsgText: t("tipMsgText"),
      unknownMsgText: t("unknownMsgText"),
    }[key] || "";
  return `[${text}]`;
};
</script>

<style scoped>
.wrapper {
  flex: 1;
  font-size: 12px;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.msg-conversation-text {
  font-size: 12px !important;
  height: 22px;
  line-height: 22px;
  width: 100%;
  display: inline;
}

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
.msg-conversation-text-emoji {
  display: inline-flex;
  width: 18px;
  height: 18px;
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
}
</style>
