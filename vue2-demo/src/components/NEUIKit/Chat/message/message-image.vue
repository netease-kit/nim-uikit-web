<template>
  <div class="message-image-container" @click="handleImageClick">
    <div
      class="msg-image loading-container"
      v-if="
        msg.sendingState ==
        V2NIMMessageSendingStateEnum.V2NIM_MESSAGE_SENDING_STATE_SENDING
      "
    >
      <img
        class="msg-image"
        :lazy-load="true"
        mode="aspectFill"
        :src="msg.previewImg || thumbImageUrl || imageUrl"
      />
    </div>
    <div
      class="msg-image"
      v-else-if="
        msg.sendingState ==
        V2NIMMessageSendingStateEnum.V2NIM_MESSAGE_SENDING_STATE_UNKNOWN
      "
    >
      <img
        class="msg-image"
        :lazy-load="true"
        mode="aspectFill"
        :src="msg.previewImg || thumbImageUrl || imageUrl"
      />
    </div>
    <div
      v-else-if="
        msg.sendingState ==
        V2NIMMessageSendingStateEnum.V2NIM_MESSAGE_SENDING_STATE_SUCCEEDED
      "
    >
      <img
        v-if="thumbImageUrl || imageUrl"
        class="msg-image"
        :lazy-load="true"
        mode="aspectFill"
        :src="thumbImageUrl || imageUrl"
      />
    </div>
    <img
      v-else-if="
        msg.sendingState ==
        V2NIMMessageSendingStateEnum.V2NIM_MESSAGE_SENDING_STATE_FAILED
      "
      class="msg-image"
      :lazy-load="true"
      mode="aspectFill"
      :src="msg.previewImg || thumbImageUrl || imageUrl"
    />
    <!-- 图片预览组件 -->
    <PreviewImage
      v-if="isPreviewVisible"
      :visible="isPreviewVisible"
      @update:visible="(v) => (isPreviewVisible = v)"
      @close="handlePreviewClose"
      :imageUrl="currentPreviewUrl"
      :onClose="handlePreviewClose"
      :downloadFileName="downloadFileName"
    />
  </div>
</template>

<script>
import PreviewImage from "../../CommonComponents/PreviewImage.vue";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import { nim, uiKitStore } from "../../utils/init";

export default {
  name: "MessageImage",
  components: { PreviewImage },
  props: {
    msg: { type: Object, required: true },
  },
  data() {
    return {
      isPreviewVisible: false,
      currentPreviewUrl: "",
      thumbImageUrl: "",
      store: uiKitStore,
      V2NIMMessageSendingStateEnum: V2NIMConst.V2NIMMessageSendingState,
    };
  },
  computed: {
    imageUrl() {
      if (
        this.msg &&
        this.msg.messageStatus &&
        this.msg.messageStatus.errorCode == 102426
      ) {
        return "https://yx-web-nosdn.netease.im/common/c1f278b963b18667ecba4ee9a6e68047/img-fail.png";
      }
      const att = (this.msg && this.msg.attachment) || {};
      return att.url || att.file;
    },
    downloadFileName() {
      const timestamp = (this.msg && this.msg.createTime) || Date.now();
      const extension = this.getImageExtension(this.imageUrl || "");
      return `image_${timestamp}${extension}`;
    },
  },
  mounted() {
    const attachment = (this.msg && this.msg.attachment) || {};
    this.handleImageThumbUrl(attachment);
  },
  watch: {
    msg: {
      handler() {
        const attachment = (this.msg && this.msg.attachment) || {};
        this.handleImageThumbUrl(attachment);
      },
      deep: true,
    },
  },
  methods: {
    handleImageClick() {
      const url =
        (this.msg && this.msg.attachment && this.msg.attachment.url) || "";
      if (url) {
        this.currentPreviewUrl = url;
        this.isPreviewVisible = true;
      }
    },
    handlePreviewClose() {
      this.currentPreviewUrl = "";
    },
    getImageExtension(url) {
      const urlMatch = (url || "").match(
        /\.(jpg|jpeg|png|gif|webp|bmp)($|\?)/i
      );
      if (urlMatch) {
        return `.${urlMatch[1].toLowerCase()}`;
      }
      const att = (this.msg && this.msg.attachment) || {};
      const fileName = att.name;
      const fileExt = att.ext;
      if (fileName) {
        const fileMatch = (fileExt || "").match(
          /\.(jpg|jpeg|png|gif|webp|bmp)$/i
        );
        if (fileMatch) {
          return `.${fileMatch[1].toLowerCase()}`;
        }
      }
      return ".jpg";
    },
    handleImageThumbUrl(attachment) {
      const size = attachment && attachment.size ? attachment.size : 0;
      const imgSizeConstant = 1024 * 1024 * 20;
      const width = attachment && attachment.width;
      const height = attachment && attachment.height;
      if (size < imgSizeConstant) {
        if (width && height) {
          nim.V2NIMStorageService.getImageThumbUrl(attachment, {
            height: 400,
            width: Math.floor((400 * width) / (height || 1)),
          })
            .then((res) => {
              this.thumbImageUrl = res.url;
            })
            .catch(() => {});
        }
      } else {
        this.thumbImageUrl = attachment && attachment.url;
      }
    },
  },
};
</script>

<style scoped>
.message-image-container {
  cursor: pointer;
}
.message-image-container:hover {
  opacity: 0.8;
}

.msg-image {
  max-width: 100%;
  min-width: 80px;
  height: 200px;
  display: block;
}

.loading-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.msg-failed-image {
  margin: 20px;
}
</style>
