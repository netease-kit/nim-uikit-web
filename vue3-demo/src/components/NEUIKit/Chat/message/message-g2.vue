<template>
  <div class="g2-message-wrapper">
    <Icon :type="iconType" :size="24"></Icon>
    <div class="g2-message-status">{{ status }}</div>
    <div v-if="duration" class="g2-message-duration">{{ duration }}</div>
  </div>
</template>

<script lang="ts" setup>
/** 音视频消息 */
import Icon from "../../CommonComponents/Icon.vue";
import { convertSecondsToTime } from "../../utils";
import { g2StatusMap } from "../../utils/constants";
import type { V2NIMMessageForUI } from "@xkit-yx/im-store-v2/dist/types/types";
const props = withDefaults(defineProps<{ msg: V2NIMMessageForUI }>(), {});

const attachment = props.msg.attachment as any;
// 音视频消息时长
const duration = convertSecondsToTime(attachment?.durations[0]?.duration);
// 音视频消息状态 接听 拒绝 等待接听
const status = g2StatusMap[attachment?.status];
// 音视频消息图标类型 语音通话 视频通话
const iconType = attachment?.type == 1 ? "icon-yuyin8" : "icon-shipin8";
</script>

<style scoped>
/* 音视频消息容器 */
.g2-message-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 音视频消息状态 */
.g2-message-status {
  margin: 0 7px;
  font-size: 14px;
}

/* 音视频消息时长 */
.g2-message-duration {
  color: #666;
}
</style>
