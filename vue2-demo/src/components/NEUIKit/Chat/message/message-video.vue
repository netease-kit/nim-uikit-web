<template>
  <div class="message-video-container" @click="handleVideoClick">
    <!-- 发送中状态 -->
    <div
      class="msg-video-frame loading-container"
      v-if="
        msg.sendingState == sendingStateEnum.V2NIM_MESSAGE_SENDING_STATE_SENDING
      "
    >
      <img class="msg-video-frame" :src="msg.previewImg" />
    </div>

    <!-- 发送成功状态/未知状态（收藏消息统一为未知状态） -->
    <div
      v-else-if="
        msg.sendingState ==
          sendingStateEnum.V2NIM_MESSAGE_SENDING_STATE_SUCCEEDED ||
        msg.sendingState == sendingStateEnum.V2NIM_MESSAGE_SENDING_STATE_UNKNOWN
      "
      class="video-frame-wrapper"
    >
      <img
        class="msg-video-frame"
        v-if="videoFirstFrameDataUrl"
        :src="videoFirstFrameDataUrl"
      />
      <!-- 播放按钮覆盖层 -->
      <div class="play-button-overlay">
        <div class="play-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </div>

    <!-- 发送失败状态 -->
    <div
      v-else-if="
        msg.sendingState == sendingStateEnum.V2NIM_MESSAGE_SENDING_STATE_FAILED
      "
      class="video-frame-wrapper"
    >
      <img
        class="msg-video-frame"
        :src="msg.previewImg || videoFirstFrameDataUrl"
      />
      <!-- 播放按钮覆盖层 -->
      <div class="play-button-overlay">
        <div class="play-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </div>
    <!-- 视频播放 Modal -->
    <Modal
      :visible="isVideoModalVisible"
      @update:visible="(v) => (isVideoModalVisible = v)"
      :title="t('videoPlayText')"
      :width="800"
      :height="600"
      :showDefaultFooter="false"
      :maskClosable="true"
      :bodyStyle="{
        padding: '0 16px 16px 16px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }"
    >
      <div class="video-modal-content">
        <video
          ref="videoRef"
          class="modal-video"
          controls
          autoplay
          :src="videoUrl"
          @loadedmetadata="handleVideoLoaded"
        >
          您的浏览器不支持视频播放。
        </video>
      </div>
    </Modal>
  </div>
</template>

<script>
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import Modal from "../../CommonComponents/Modal.vue";
import { t } from "../../utils/i18n";
const { V2NIMMessageSendingState } = V2NIMConst;

export default {
  name: "MessageVideo",
  components: { Modal },
  props: {
    msg: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isVideoModalVisible: false,
    };
  },
  computed: {
    videoFirstFrameDataUrl() {
      const att = (this.msg && this.msg.attachment) || {};
      const url = att.url || "";
      return url
        ? `${url}${url.indexOf("?") >= 0 ? "&" : "?"}vframe&offset=1`
        : "";
    },
    videoUrl() {
      const att = (this.msg && this.msg.attachment) || {};
      const baseUrl = att.url || "";
      const fileName = `${(this.msg && this.msg.messageClientId) || ""}-video-${
        att.ext || ""
      }`;
      if (baseUrl && !baseUrl.match(/\.(mp4|webm|ogg|avi|mov)$/i)) {
        const separator = baseUrl.indexOf("?") >= 0 ? "&" : "?";
        return `${baseUrl}${separator}filename=${encodeURIComponent(fileName)}`;
      }
      return baseUrl;
    },
    sendingStateEnum() {
      return V2NIMMessageSendingState;
    },
  },
  methods: {
    t,
    handleVideoClick() {
      const audio = document.getElementById("yx-audio-message");
      if (audio && audio.pause) audio.pause();

      if (
        this.msg.sendingState ===
          V2NIMConst.V2NIMMessageSendingState
            .V2NIM_MESSAGE_SENDING_STATE_SUCCEEDED ||
        this.msg.sendingState ===
          V2NIMConst.V2NIMMessageSendingState
            .V2NIM_MESSAGE_SENDING_STATE_UNKNOWN
      ) {
        this.isVideoModalVisible = true;
      }
    },
    handleVideoLoaded() {},
  },
};
</script>

<style scoped>
.message-video-container {
  cursor: pointer;
  position: relative;
  height: 200px;
}

.video-frame-wrapper {
  position: relative;
  display: inline-block;
  height: 200px;
  min-width: 80px;
  max-width: 300px;
}

.msg-video-frame {
  height: 200px;
  min-width: 80px;
  max-width: 300px;
  width: auto;
  display: block;
  border-radius: 8px;
  object-fit: cover;
}

.msg-video-frame.failed {
  opacity: 0.6;
}

.loading-container {
  height: 200px;
  min-width: 80px;
  max-width: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.play-button-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.play-button-overlay:hover {
  background-color: rgba(0, 0, 0, 0.5);
}

.play-button {
  width: 48px;
  height: 48px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.play-button:hover {
  background-color: rgba(0, 0, 0, 0.8);
  transform: scale(1.3);
}

.failed-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 0, 0, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.video-modal-content {
  width: fit-content;
  height: 520px;
  max-width: 800px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-video {
  max-width: 100%;
  max-height: 100%;
  border-radius: 8px;
  outline: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .msg-video-frame {
    max-width: 250px;
  }

  .play-button {
    width: 40px;
    height: 40px;
  }

  .play-button svg {
    width: 20px;
    height: 20px;
  }
}
</style>
