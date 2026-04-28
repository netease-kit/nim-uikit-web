<template>
  <Teleport to="body">
    <div v-if="visible" class="preview-image-container" @click="handleClose">
      <div class="preview-image-wrapper" @click.stop>
        <img
          :src="imageUrl"
          class="preview-image"
          :style="{ transform: `scale(${scale})` }"
        />
      </div>

      <!-- 右上角操作按钮 -->
      <div class="top-actions" @click.stop>
        <div
          class="action-btn"
          @click="zoomOut"
          title="缩小"
          :class="{ disabled: scale <= MIN_SCALE }"
        >
          －
        </div>
        <div class="zoom-scale" @click="resetZoom" title="点击重置">
          {{ Math.round(scale * 100) }}%
        </div>
        <div
          class="action-btn"
          @click="zoomIn"
          title="放大"
          :class="{ disabled: scale >= MAX_SCALE }"
        >
          ＋
        </div>
        <div class="action-divider"></div>
        <div class="action-btn" @click="handleDownload" title="下载图片">
          <Icon type="icon-down-arrow-white" />
        </div>
        <div class="action-btn" @click="handleClose" title="关闭">×</div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import Icon from "./Icon.vue";
import { ref, watch } from "vue";

const MIN_SCALE = 0.1;
const MAX_SCALE = 5.0;
const STEP = 0.25;

const scale = ref(1);

const zoomIn = () => {
  if (scale.value < MAX_SCALE) {
    scale.value = Math.min(
      MAX_SCALE,
      parseFloat((scale.value + STEP).toFixed(2)),
    );
  }
};

const zoomOut = () => {
  if (scale.value > MIN_SCALE) {
    scale.value = Math.max(
      MIN_SCALE,
      parseFloat((scale.value - STEP).toFixed(2)),
    );
  }
};

const resetZoom = () => {
  scale.value = 1;
};

const props = defineProps({
  visible: { type: Boolean, default: false },
  downloadFileName: { type: String, default: "" },
  imageUrl: { type: String, required: true },
  onClose: { type: Function, default: undefined },
});

const emit = defineEmits(["update:visible", "close"]);

watch(
  () => props.visible,
  (val) => {
    if (!val) scale.value = 1;
  },
);

const handleClose = () => {
  scale.value = 1;
  emit("update:visible", false);
  if (props.onClose) props.onClose();
};

const handleDownload = async () => {
  try {
    const response = await fetch(props.imageUrl, {
      mode: "cors",
      credentials: "omit",
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = props.downloadFileName || "image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch {
    try {
      const link = document.createElement("a");
      link.href = props.imageUrl;
      link.download = props.downloadFileName || "image.jpg";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
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
  transition: transform 0.15s ease;
}

/* 右上角工具栏 */
.top-actions {
  position: fixed;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 24px;
  padding: 4px 8px;
  z-index: 10000;
}

.action-btn {
  width: 36px;
  height: 36px;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.action-btn:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.action-btn.disabled {
  opacity: 0.35;
  cursor: not-allowed;
  pointer-events: none;
}

.zoom-scale {
  min-width: 48px;
  text-align: center;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  user-select: none;
  padding: 0 2px;
  line-height: 36px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.zoom-scale:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.action-divider {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.3);
  margin: 0 4px;
}
</style>
