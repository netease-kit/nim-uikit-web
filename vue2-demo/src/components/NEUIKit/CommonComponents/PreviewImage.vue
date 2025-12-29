<template>
  <div v-show="visible" class="preview-image-container" @click="handleClose">
    <div class="preview-image-wrapper">
      <img :src="imageUrl" class="preview-image" @click.stop />
      <div class="close-button" @click="handleClose">×</div>
      <div class="download-button" @click="handleDownload" title="下载图片">
        <Icon type="icon-down-arrow-white"></Icon>
      </div>
    </div>
  </div>
</template>

<script>
import Icon from "./Icon.vue";

export default {
  name: "PreviewImage",
  components: { Icon },
  props: {
    visible: { type: Boolean, default: false },
    downloadFileName: { type: String, default: "" },
    imageUrl: { type: String, required: true },
    onClose: { type: Function, default: undefined },
    appendToBody: { type: Boolean, default: true },
    teleportTo: { type: String, default: "body" },
  },
  methods: {
    handleClose() {
      this.$emit("update:visible", false);
      this.$emit("close");
      if (this.onClose) {
        try {
          this.onClose();
        } catch (e) {
          console.error(e);
        }
      }
    },
    async handleDownload() {
      try {
        const response = await fetch(this.imageUrl, {
          mode: "cors",
          credentials: "omit",
        });
        if (!response.ok) {
          throw new Error("HTTP error: " + response.status);
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = this.downloadFileName || "image.jpg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        try {
          const link = document.createElement("a");
          link.href = this.imageUrl;
          link.download = this.downloadFileName || "image.jpg";
          link.target = "_blank";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (fallbackError) {
          alert("下载失败，请尝试右键保存图片");
        }
      }
    },
  },
  mounted() {
    if (this.appendToBody) {
      try {
        const target = document.querySelector(this.teleportTo) || document.body;
        if (this.$el && target && this.$el.parentNode !== target) {
          target.appendChild(this.$el);
        }
      } catch (e) {
        console.error(e);
      }
    }
  },
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
  z-index: 9999999;
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
