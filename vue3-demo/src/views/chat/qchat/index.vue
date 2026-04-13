<template>
  <div class="qchat-container">
    <QChatProvider>
      <HomeView />
    </QChatProvider>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onActivated, onDeactivated } from "vue";
import HomeView from "../../../components/NEQCHAT/views/HomeView.vue";
import QChatProvider from "./QChatProvider.vue";

// 用于标记是否是首次进入
let isFirstEntry = true;

onMounted(() => {
  console.log("QChat组件已挂载，直接集成QChat应用");
});

// 当组件被激活时（从其他tab切换回来）
onActivated(() => {
  console.log("QChat组件被激活，保持上次选择状态");
  if (isFirstEntry) {
    // 首次进入时，ServerBar的onMounted会处理默认选择
    isFirstEntry = false;
  } else {
    // 非首次进入，保持上次的选择状态，不做任何改变
    console.log("QChat: 维持上次选择的服务器和频道状态");
  }
});

// 当组件被停用时（切换到其他tab）
onDeactivated(() => {
  console.log("QChat组件被停用");
});
</script>

<style scoped>
.qchat-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #ffffff;
}
</style>
