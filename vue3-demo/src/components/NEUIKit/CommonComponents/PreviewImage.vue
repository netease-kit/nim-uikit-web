<template>
  <Teleport to="body">
    <div v-if="visible" class="preview-image-container" @click="handleClose">
      <div class="preview-image-wrapper">
        <img :src="imageUrl" class="preview-image" @click.stop />
        <div class="close-button" @click="handleClose">×</div>
        <div class="download-button" @click="handleDownload" title="下载图片">
          <Icon type="icon-down-arrow-white"></Icon>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import Icon from "./Icon.vue";
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  downloadFileName: {
    type: String,
    default: "",
  },
  imageUrl: {
    type: String,
    required: true,
  },
  onClose: {
    type: Function,
    default: undefined,
  },
});

const emit = defineEmits(["update:visible", "close"]);

const handleClose = () => {
  emit("update:visible", false);
  if (props.onClose) {
    props.onClose();
  }
};

// 下载图片功能
const handleDownload = async () => {
  try {
    // 使用fetch获取图片数据
    const response = await fetch(props.imageUrl, {
      mode: "cors",
      credentials: "omit",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();

    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = props.downloadFileName || "image.jpg";

    // 添加到DOM并触发下载
    document.body.appendChild(link);
    link.click();

    // 清理
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    // 如果fetch失败，尝试直接打开链接
    try {
      const link = document.createElement("a");
      link.href = props.imageUrl;
      link.download = props.downloadFileName || "image.jpg";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (fallbackError) {
      alert("下载失败，请尝试右键保存图片");
    }
  }
};
</script>

<style scoped>
.preview-image-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.preview-image-wrapper {
  position: relative;
}

.preview-image {
  height: 650px;
  object-fit: contain;
}

.close-button {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  z-index: 10000;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: rgba(0, 0, 0, 0.7);
}

.download-button {
  position: fixed;
  top: 20px;
  right: 80px;
  width: 40px;
  height: 40px;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  z-index: 10000;
  transition: background-color 0.2s;
}

.download-button:hover {
  background-color: rgba(0, 0, 0, 0.7);
}
</style>
