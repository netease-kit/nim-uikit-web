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

<script>
import Icon from "../../CommonComponents/Icon.vue";

export default {
  name: "MessageAudio",
  components: { Icon },
  props: {
    msg: { type: Object, required: true },
  },
  data() {
    return {
      audioIconType: "icon-yuyin3",
      animationFlag: false,
    };
  },
  computed: {
    audioContainerWidth() {
      const dur = this.formatDuration(
        (this.msg && this.msg.attachment && this.msg.attachment.duration) || 0
      );
      const maxWidth = 180;
      const w = 50 + 8 * (dur - 1);
      return w > maxWidth ? maxWidth : w;
    },
    duration() {
      return this.formatDuration(
        (this.msg && this.msg.attachment && this.msg.attachment.duration) || 0
      );
    },
  },
  methods: {
    formatDuration(duration) {
      return Math.round(duration / 1000) || 1;
    },
    playAudioAnimation() {
      try {
        this.animationFlag = true;
        let audioIcons = ["icon-yuyin1", "icon-yuyin2", "icon-yuyin3"];
        const handler = () => {
          const icon = audioIcons.shift();
          if (icon) {
            this.audioIconType = icon;
            if (!audioIcons.length && this.animationFlag) {
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
    },
    togglePlay(e) {
      e.stopPropagation();
      const oldAudio = this.pauseAllAudio();
      const msgId = oldAudio && oldAudio.getAttribute("msgId");
      const attachment = this.msg && this.msg.attachment;
      const msg = this.msg;
      if (msgId === msg.messageClientId) {
        this.animationFlag = false;
        return;
      }
      const audio = new Audio((attachment && attachment.url) || "");
      audio.id = "yx-audio-message";
      audio.setAttribute("msgId", msg.messageClientId);
      audio.play();
      if (this.$refs.audioContainerRef) {
        this.$refs.audioContainerRef.appendChild(audio);
      }
      audio.addEventListener("ended", () => {
        this.animationFlag = false;
        if (audio.parentNode) audio.parentNode.removeChild(audio);
      });
      audio.addEventListener("pause", () => {
        this.animationFlag = false;
        if (audio.parentNode) audio.parentNode.removeChild(audio);
      });
      this.playAudioAnimation();
    },
    pauseAllAudio() {
      const audio = document.getElementById("yx-audio-message");
      if (audio && audio.pause) audio.pause();
      return audio;
    },
  },
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
