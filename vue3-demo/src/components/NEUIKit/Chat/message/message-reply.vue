<template>
  <div v-if="props.replyMsg?.messageClientId" class="reply-msg-wrapper">
    <!-- replyMsg 不存在 说明回复的消息被删除或者撤回 -->
    <div v-if="props.replyMsg?.messageClientId == 'noFind'">
      <span>{{ t("replyNotFindText") }}</span>
    </div>
    <Popover
      v-else
      trigger="click"
      placement="top"
      :maxWidth="500"
      :bodyStyle="{ padding: '0', maxHeight: '300px', overflow: 'auto' }"
      v-model="popoverVisible"
    >
      <!-- 移除 @click 事件，让 Popover 自己处理点击 -->
      <div class="reply-msg">
        <div class="reply-msg-name-wrapper">
          <div class="reply-msg-name-content">
            <Appellation
              :account="replyMsg?.senderId"
              :teamId="replyMsg?.receiverId"
              :fontSize="13"
              color="#666666"
            />
            :
          </div>
        </div>
        <MessageOneLine
          v-if="
            replyMsg &&
            replyMsg.messageType ===
              V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT
          "
          :text="replyMsg.text"
        />
        <div class="reply-msg-type-tip" v-else>
          {{
            replyMsg?.messageType
              ? `[${
                  REPLY_MSG_TYPE_MAP[replyMsg.messageType] || "Unsupported Type"
                }]`
              : "[Unknown]"
          }}
        </div>
      </div>
      <template #content>
        <div
          @click="(e) => e.stopPropagation()"
          class="popover-message-content"
        >
          <MessageItemContent :msg="replyMsg" />
        </div>
      </template>
    </Popover>
  </div>
</template>

<script lang="ts" setup>
/** 回复消息组件 */
import { t } from "../../utils/i18n";
import { ref } from "vue";
import { REPLY_MSG_TYPE_MAP } from "../../utils/constants";
import type { V2NIMMessageForUI } from "@xkit-yx/im-store-v2/dist/types/types";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";

import Appellation from "../../CommonComponents/Appellation.vue";
import MessageOneLine from "../../CommonComponents/MessageOneLine.vue";
import Popover from "../../CommonComponents/Popover.vue";
import MessageItemContent from "./message-item-content.vue";

const props = withDefaults(defineProps<{ replyMsg: V2NIMMessageForUI }>(), {});

// Popover 显示状态
const popoverVisible = ref(false);
</script>

<style scoped>
.reply-msg-wrapper {
  display: flex;
  align-items: center;
  color: #666666;
  font-size: 13px;
  white-space: nowrap;
  width: 100%;
  min-width: 190px;
  border-bottom: 1px solid #bbd2ed;
  margin-bottom: 5px;
  height: 45px;
  box-sizing: border-box;
}

.reply-msg-wrapper .reply-msg {
  display: flex;
  flex-direction: column;
  flex: 1;
  font-size: 13px;
  width: 100%;
  max-width: 520px;
  cursor: pointer;
}

/* 为MessageOneLine组件的容器添加专门的样式 */
.reply-msg-wrapper .reply-msg .message-one-line {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 100%;
  min-width: 0;
}

.clickable-reply {
  cursor: pointer;
  transition: background-color 0.2s ease;
  padding: 2px 4px;
  border-radius: 4px;
}

/* 移除 hover 背景色变化 */
/* .clickable-reply:hover {
  background-color: #f5f5f5;
} */

.reply-msg-wrapper .reply-msg-name-wrapper {
  width: 100%;
  display: flex;
  white-space: nowrap;
}

.reply-msg-name-content {
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.reply-msg-wrapper .reply-msg-name-line {
  flex-basis: 0 0 3px;
  margin-right: 2px;
}

.reply-msg-wrapper .reply-msg-name-to {
  flex-basis: 0 0 3px;
}

.reply-msg-wrapper .reply-msg-name-content {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.reply-msg-wrapper .reply-msg-content {
  display: flex;
  width: 100%;
  text-align: left;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 10px 0;
}

.reply-msg-image {
  width: 100%;
}

.reply-msg-type-tip {
  font-size: 13px;
}

/* Popover 内容样式 */
.popover-message-content {
  min-width: 240px;
  max-width: 400px;
  padding: 15px 10px;
  display: flex;
  justify-content: center;
}

.popover-message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px 8px 16px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fafafa;
}

.message-time {
  font-size: 12px;
  color: #999;
}

.popover-message-body {
  padding: 12px 16px;
  background-color: #fff;
}

/* 保留原有样式 */
.reply-full-screen {
  position: fixed;
  right: 0;
  bottom: 0;
  top: 0;
  left: 0;
  height: 100vh;
  overflow: hidden;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 24px;
  justify-content: center;
  touch-action: none;
  z-index: 999999999;
  box-sizing: border-box;
}

.reply-message-content {
  height: 85vh;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 30px 30px 100px 30px;
  touch-action: none;
  display: flex;
  align-items: center;
}

.reply-message-close {
  position: fixed;
  right: 20px;
  z-index: 999999;
  top: 60px;
}

.reply-message-close-mp {
  position: fixed;
  right: 20px;
  top: 100px;
  z-index: 999999;
}

.msg-common {
  display: flex;
  align-items: flex-start;
  font-size: 16px;
  max-width: 360px;
  overflow: hidden;
  padding: 16px 20px;
}

.video-msg-wrapper {
  box-sizing: border-box;
  max-width: 360px;
  position: relative;
}

.msg-video {
  max-height: 300px;
  max-width: 360px;
  border-radius: 8px;
  outline: none;
  display: block;
}
</style>
