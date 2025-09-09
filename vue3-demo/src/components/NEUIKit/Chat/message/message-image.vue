<template>
  <div class="message-image-container" @click="handleImageClick">
    <div
      class="msg-image loading-container"
      v-if="
        msg.sendingState ==
        V2NIMConst.V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_SENDING
      "
    >
      <img
        class="msg-image"
        :lazy-load="true"
        mode="aspectFill"
        :src="msg.previewImg"
      />
    </div>
    <img
      v-else-if="
        msg.sendingState ==
        V2NIMConst.V2NIMMessageSendingState
          .V2NIM_MESSAGE_SENDING_STATE_SUCCEEDED
      "
      class="msg-image"
      :lazy-load="true"
      mode="aspectFill"
      :src="thumbImageUrl"
    />
    <img
      v-else-if="
        msg.sendingState ==
        V2NIMConst.V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_FAILED
      "
      class="msg-image"
      :lazy-load="true"
      mode="aspectFill"
      :src="msg.previewImg"
    />
  </div>

  <!-- 图片预览组件 -->
  <PreviewImage
    v-if="isPreviewVisible"
    v-model:visible="isPreviewVisible"
    :imageUrl="currentPreviewUrl"
    :onClose="handlePreviewClose"
    :downloadFileName="downloadFileName"
  />
</template>

<script lang="ts" setup>
/** 图片消息 */
import { ref, computed, watch, getCurrentInstance, onMounted } from "vue";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import PreviewImage from "../../CommonComponents/PreviewImage.vue";
import type { V2NIMMessageImageAttachment } from "nim-web-sdk-ng/dist/esm/nim/src/V2NIMMessageService";
import type { V2NIMMessageForUI } from "@xkit-yx/im-store-v2/dist/types/types";

const props = withDefaults(
  defineProps<{
    msg: V2NIMMessageForUI;
  }>(),
  {}
);

const { proxy } = getCurrentInstance()!;
const nim = proxy?.$NIM;

// 预览状态
const isPreviewVisible = ref(false);
// 当前预览的图片URL
const currentPreviewUrl = ref("");

// 图片URL计算属性
const imageUrl = computed(() => {
  // 被拉黑
  if (props.msg.messageStatus.errorCode == 102426) {
    return "https://yx-web-nosdn.netease.im/common/c1f278b963b18667ecba4ee9a6e68047/img-fail.png";
  }

  //@ts-ignore
  return props.msg?.attachment?.url || props.msg.attachment?.file;
});

// 缩略图URL
const thumbImageUrl = ref("");

// 点击图片处理
const handleImageClick = () => {
  //@ts-ignore
  const url = props.msg.attachment?.url;
  if (url) {
    currentPreviewUrl.value = url;
    isPreviewVisible.value = true;
  }
};

// 关闭预览
const handlePreviewClose = () => {
  currentPreviewUrl.value = "";
};

// 生成下载文件名
const downloadFileName = computed(() => {
  const timestamp = props.msg.createTime || Date.now();
  const extension = getImageExtension(imageUrl.value);

  return `image_${timestamp}${extension}`;
});

// 获取图片扩展名
const getImageExtension = (url: string) => {
  // 尝试从URL中提取扩展名
  const urlMatch = url.match(/\.(jpg|jpeg|png|gif|webp|bmp)($|\?)/i);
  if (urlMatch) {
    return `.${urlMatch[1].toLowerCase()}`;
  }

  // 从attachment中获取扩展名
  //@ts-ignore
  const fileName = props.msg.attachment?.name;
  //@ts-ignore
  const fileExt = props.msg.attachment?.ext;
  if (fileName) {
    const fileMatch = fileExt.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i);
    if (fileMatch) {
      return `.${fileMatch[1].toLowerCase()}`;
    }
  }

  // 默认使用jpg
  return ".jpg";
};

// 获取缩略图URL
const handleImageThumbUrl = (attachment: V2NIMMessageImageAttachment) => {
  const size = attachment?.size || 0;

  const imgSizeConstant = 1024 * 1024 * 20;

  const width = attachment?.width;
  const height = attachment?.height;

  // 小于20M 才能使用缩略图功能，大于20M，建议以文件消息进行发送
  if (size < imgSizeConstant) {
    if (width && height) {
      nim.V2NIMStorageService.getImageThumbUrl(attachment, {
        height: 200,
        width: Math.floor((200 * width) / height),
      })
        .then((res) => {
          thumbImageUrl.value = res.url;
        })
        .catch((err) => {});
    }
  } else {
    thumbImageUrl.value = attachment?.url;
  }
};

onMounted(() => {
  const attachment = props.msg.attachment as V2NIMMessageImageAttachment;
  handleImageThumbUrl(attachment);
});

// 本端发送图片消息，发送成功后触发
watch(
  () => props.msg,
  () => {
    const attachment = props.msg.attachment as V2NIMMessageImageAttachment;
    handleImageThumbUrl(attachment);
  }
);
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
