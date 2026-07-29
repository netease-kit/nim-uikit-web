<template>
  <div v-if="readonly" class="unknown-msg">
    [{{ callData?.type == 1 ? t("audioCallText") : t("videoCallText") }}]
  </div>
  <div v-else class="g2-message-wrapper" @click="handleCallRecordClick">
    <Icon :type="iconType" :size="24"></Icon>
    <div class="g2-message-status">{{ status }}</div>
    <div v-if="duration" class="g2-message-duration">{{ duration }}</div>
  </div>
</template>

<script lang="ts" setup>
/** 音视频消息 */
import Icon from "../../CommonComponents/Icon.vue";
import { computed } from "vue";
import { convertSecondsToTime } from "../../utils";
import { g2StatusMap } from "../../utils/constants";
import { t } from "../../utils/i18n";
import { toast } from "../../utils/toast";
import type { V2NIMMessageForUI } from "@xkit-yx/im-store-v2/dist/types/src/types";
import { call } from "@xkit-yx/call-kit-vue3-ui";
const props = withDefaults(
  defineProps<{ msg: V2NIMMessageForUI; readonly?: boolean }>(),
  { readonly: false },
);

const callData = computed(() => {
  const attachment = props.msg.attachment as any;
  let raw = attachment?.raw;

  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      raw = undefined;
    }
  }

  return raw || attachment || {};
});
// 音视频消息时长
const duration = computed(() =>
  convertSecondsToTime(callData.value?.durations?.[0]?.duration)
);
// 音视频消息状态 接听 拒绝 等待接听
const status = computed(() => g2StatusMap[callData.value?.status]);
// 音视频消息图标类型 语音通话 视频通话
const iconType = computed(() =>
  callData.value?.type == 1 ? "icon-yuyin8" : "icon-call-record-video"
);

const handleCallRecordClick = async () => {
  const accId = props.msg.isSelf ? props.msg.receiverId : props.msg.senderId;
  const type = Number(callData.value?.type);
  const callType: "1" | "2" = type === 1 ? "1" : "2";

  if (!accId) {
    return;
  }

  try {
    await call({
      accId,
      callType,
    });
  } catch (error: any) {
    switch (String(error?.code || "")) {
      case "105":
        toast.error(t("inCallText"));
        break;
      case "Error_Internet_Disconnected":
        toast.error(t("networkDisconnectText"));
        break;
      default:
        toast.error(t("callFailed"));
        break;
    }
  }
};
</script>

<style scoped>
.unknown-msg {
  font-size: 14px;
  color: #000000;
}

/* 音视频消息容器 */
.g2-message-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  margin: -12px -16px;
  cursor: pointer;
}

/* 音视频消息状态 */
.g2-message-status {
  margin: 0 7px;
  color: #000000;
  font-size: 14px;
}

/* 音视频消息时长 */
.g2-message-duration {
  color: #000000;
  font-size: 14px;
}
</style>
