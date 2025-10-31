<template>
  <div
    :class="!msg.isSelf ? 'audio-in' : 'audio-out'"
    :style="{ width: audioContainerWidth + 'px' }"
    @click="togglePlay"
    ref="audioContainerRef"
  >
    <div class="audio-dur">{{ duration }}s</div>
    <div
      class="audio-icon-wrapper"
      :class="!msg.isSelf ? 'audio-icon-in' : 'audio-icon-out'"
    >
      <Icon :size="24" :key="audioIconType" :type="audioIconType" />
    </div>
  </div>
</template>

<script lang="ts" setup>
/** 音频消息 */
import { ref, computed } from "vue";
import Icon from "../../CommonComponents/Icon.vue";
import type { V2NIMMessageForUI } from "@xkit-yx/im-store-v2/dist/types/types";
import type { V2NIMMessageAudioAttachment } from "nim-web-sdk-ng/dist/esm/nim/src/V2NIMMessageService";

const props = withDefaults(
  defineProps<{
    msg: V2NIMMessageForUI;
  }>(),
  {}
);

// 音频图标类型 用于音频动态播放
const audioIconType = ref("icon-yuyin3");
// 动画标志
const animationFlag = ref(false);

// 音频容器
const audioContainerRef = ref<HTMLElement | null>(null);

// 格式化音频时长
const formatDuration = (duration: number) => {
  return Math.round(duration / 1000) || 1;
};

// 音频消息宽度
const audioContainerWidth = computed(() => {
  //@ts-ignore
  const duration = formatDuration(props.msg.attachment?.duration);
  const maxWidth = 180;
  return 50 + 8 * (duration - 1) > maxWidth
    ? maxWidth
    : 50 + 8 * (duration - 1);
});

// 音频时长
const duration = computed(() => {
  return formatDuration(
    (props.msg.attachment as V2NIMMessageAudioAttachment)?.duration
  );
});

// 播放音频动画
const playAudioAnimation = () => {
  try {
    animationFlag.value = true;
    let audioIcons = ["icon-yuyin1", "icon-yuyin2", "icon-yuyin3"];
    const handler = () => {
      const icon = audioIcons.shift();
      if (icon) {
        audioIconType.value = icon;
        if (!audioIcons.length && animationFlag.value) {
          audioIcons = ["icon-yuyin1", "icon-yuyin2", "icon-yuyin3"];
        }
        if (audioIcons.length) {
          setTimeout(handler, 300);
        }
      }
    };
    handler();
  } catch (error) {
    console.log("动画播放出错:", error);
  }
};

// 切换播放状态
const togglePlay = (e) => {
  e.stopPropagation();
  const oldAudio = pauseAllAudio();
  const msgId = oldAudio?.getAttribute("msgId");
  const attachment = props.msg.attachment as V2NIMMessageAudioAttachment;
  const msg = props.msg;

  // 如果是自己，暂停动画
  if (msgId === msg.messageClientId) {
    animationFlag.value = false;
    return;
  }

  const audio = new Audio(attachment?.url);

  // 播放音频，并开始动画
  audio.id = "yx-audio-message";
  audio.setAttribute("msgId", msg.messageClientId);
  audio.play();
  audioContainerRef.value?.appendChild(audio);
  audio.addEventListener("ended", () => {
    animationFlag.value = false;
    audio.parentNode?.removeChild(audio);
  });
  audio.addEventListener("pause", () => {
    animationFlag.value = false;
    audio.parentNode?.removeChild(audio);
  });
  playAudioAnimation();
};

// 暂停所有音频播放
const pauseAllAudio = (): HTMLAudioElement => {
  const audio = document.getElementById("yx-audio-message") as HTMLAudioElement;
  audio?.pause();
  return audio;
};
</script>

<style scoped>
.audio-dur {
  height: 24px;
  line-height: 24px;
  color: #000;
  font-size: 14px;
  margin: 0 10px;
}
.audio-in,
.audio-out {
  width: 50px;
  display: flex;
  cursor: pointer;
  justify-content: flex-end;
  align-items: center;
  background-color: #d6e5f6;
  border-radius: 4px;
}

.collection-item-content-top-msg > .audio-in,
.collection-item-content-top-msg > .audio-out {
  padding: 5px;
}

.audio-in {
  flex-direction: row-reverse;
  background-color: #e8eaed;
}

.audio-icon-wrapper {
  height: 24px;
  display: flex;
  align-items: center;
}

.audio-icon-in {
  transform: rotateY(180deg);
}

.popover-message-content > .audio-in {
  padding: 5px;
}

.popover-message-content > .audio-out {
  padding: 5px;
}
</style>
