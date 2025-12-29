<template>
  <div class="g2-message-wrapper">
    <Icon :type="iconType" :size="24"></Icon>
    <div class="g2-message-status">{{ status }}</div>
    <div v-if="duration" class="g2-message-duration">{{ duration }}</div>
  </div>
</template>

<script>
import Icon from "../../CommonComponents/Icon.vue";
import { convertSecondsToTime } from "../../utils";
import { g2StatusMap } from "../../utils/constants";

export default {
  name: "MessageG2",
  components: { Icon },
  props: {
    msg: { type: Object, required: true },
  },
  computed: {
    attachment() {
      return (this.msg && this.msg.attachment) || {};
    },
    duration() {
      const dur = this.attachment?.durations?.[0]?.duration;
      return convertSecondsToTime(dur);
    },
    status() {
      return g2StatusMap[this.attachment?.status];
    },
    iconType() {
      return this.attachment?.type == 1 ? "icon-yuyin8" : "icon-shipin8";
    },
  },
};
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
