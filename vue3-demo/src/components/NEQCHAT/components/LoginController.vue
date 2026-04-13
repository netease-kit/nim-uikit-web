<template>
  <!-- QChat集成版本：不显示登录相关UI，直接使用UIKit的登录状态 -->
  <div style="display: none">
    <!-- 隐藏原有的登录控制器 -->
  </div>
</template>

<script lang="ts">
import { ref, onMounted, computed, inject } from "vue";

// 导出原来LoginController需要的常量和函数
export const NIM_CONFIG_KEY = "__yx_im_options_pc_vue3";

export const memoryFuncCreator = (memoryMode: string) => {
  return {
    get: (key: string) => {
      if (memoryMode === "localStorage") {
        return localStorage.getItem(key);
      }
      return null;
    },
    set: (key: string, value: string) => {
      if (memoryMode === "localStorage") {
        localStorage.setItem(key, value);
      }
    },
    remove: (key: string) => {
      if (memoryMode === "localStorage") {
        localStorage.removeItem(key);
      }
    },
  };
};

export const afterLogout = (memoryMode?: string) => {
  console.log("QChat afterLogout called, memoryMode:", memoryMode);

  // 清理本地存储
  if (memoryMode === "localStorage") {
    localStorage.removeItem(NIM_CONFIG_KEY);
  }

  // 由于现在是集成到UIKit中，不需要重新加载页面
  // 只需要清理相关状态即可
  console.log("QChat logout completed");
};

export default {
  name: "LoginController",
  props: {
    autoLogin: {
      type: Boolean,
      default: true,
    },
    memoryMode: {
      type: String,
      default: "localStorage",
    },
    onLogin: {
      type: Function,
      default: () => Promise.resolve(true),
    },
  },
  setup(props: any) {
    const isLoggedIn = ref(false);
    const store = inject("store");

    // 模拟登录成功（因为UIKit已经处理了登录）
    onMounted(async () => {
      console.log(
        "QChat LoginController: 检测到UIKit已登录，直接设置为已登录状态",
      );

      // 模拟登录成功
      if (props.onLogin) {
        try {
          // 这里不需要真正的SDK登录，因为UIKit已经做了
          // 只是调用onLogin回调表示"登录成功"
          await props.onLogin({
            appkey: "uikit-provided",
            token: "uikit-provided",
            account: "uikit-provided",
          });
          isLoggedIn.value = true;
          console.log("QChat LoginController: 登录状态设置完成");
        } catch (error) {
          console.error("QChat LoginController: 登录回调执行失败", error);
        }
      } else {
        // 如果没有onLogin回调，直接设置为已登录
        isLoggedIn.value = true;
      }
    });

    return {
      isLoggedIn,
    };
  },
};
</script>

<style scoped>
/* 隐藏的登录控制器不需要样式 */
</style>
