<template>
  <div class="qchat-provider">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide, onMounted, getCurrentInstance, nextTick } from "vue";
import { createStore } from "vuex";
import { useI18n } from "vue-i18n";

// 导入QChat的store和locale
import global from "../../../components/NEQCHAT/store/global.ts";
import sdk from "../../../components/NEQCHAT/store/sdk.ts";
import server from "../../../components/NEQCHAT/store/server.ts";
import channel from "../../../components/NEQCHAT/store/channel.ts";
import user from "../../../components/NEQCHAT/store/user.ts";
import en from "../../../components/NEQCHAT/locales/en.json";

// 导入V2NIM实例设置函数和事件绑定
import {
  setGlobalNIMInstance,
  isV2NIMInitialized,
} from "../../../components/NEQCHAT/utils/v2nim";
import { qchatAttachEvents } from "../../../components/NEQCHAT/utils/events";

// 创建QChat专用的store
const qchatStore = createStore({
  ...global,
  modules: {
    sdk,
    server,
    channel,
    user,
  },
});

// 获取全局i18n实例并添加QChat的翻译
const { mergeLocaleMessage } = useI18n();
const { proxy } = getCurrentInstance()!;

// 检查NIM实例是否准备就绪并绑定事件
const checkNIMReady = () => {
  if (proxy?.$NIM) {
    setGlobalNIMInstance(proxy.$NIM);
    // 绑定QChat事件监听
    qchatAttachEvents(proxy.$NIM as any, qchatStore);
    console.log("QChat Provider: V2NIM实例已就绪，事件监听已绑定");
    return true;
  }
  return false;
};

// 等待NIM实例初始化的函数
const waitForNIM = async (maxRetries = 50, retryInterval = 100) => {
  for (let i = 0; i < maxRetries; i++) {
    if (checkNIMReady()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, retryInterval));
  }
  console.warn("QChat Provider: 等待V2NIM实例初始化超时");
};

onMounted(async () => {
  // 将QChat的翻译文件合并到全局i18n实例中
  mergeLocaleMessage("zh", en);
  mergeLocaleMessage("en", en);

  // 等待下一个tick确保组件完全挂载
  await nextTick();

  // 首先尝试直接检查
  if (!checkNIMReady()) {
    // 如果不成功，则等待NIM实例初始化
    console.log("QChat Provider: 等待V2NIM实例初始化...");
    await waitForNIM();
  }

  console.log("QChat Provider初始化完成，V2NIM实例状态:", isV2NIMInitialized());
});

// 为QChat子组件提供store
provide("store", qchatStore);
</script>

<style scoped>
.qchat-provider {
  width: 100%;
  height: 100%;
}
</style>
../../../components/NEQCHAT/store/global.ts../../../components/NEQCHAT/store/sdk.ts../../../components/NEQCHAT/store/server.ts../../../components/NEQCHAT/store/channel.ts../../../components/NEQCHAT/store/user.ts../../../components/NEQCHAT/locales/en.json../../../components/NEQCHAT/utils/v2nim.ts../../../components/NEQCHAT/utils/events.ts
