import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import RootStore from "@xkit-yx/im-store-v2";
// import RootStore from "./store.js";
import V2NIM from "nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK";
import type { V2NIMMessage } from "nim-web-sdk-ng/dist/esm/nim/src/V2NIMMessageService";
import {
  computed,
  createApp,
  defineComponent,
  h,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  type App,
} from "vue";
import { CallViewProvider } from "@xkit-yx/call-kit-vue3-ui";
import "@xkit-yx/call-kit-vue3-ui/es/assets/index.css";
// 是否开启云端会话，实际根据您的业务调整
const enableV2CloudConversation =
  localStorage.getItem("enableV2CloudConversation") === "on";
const teamManagerVisible = localStorage.getItem("teamManagerVisible") !== "off";

let store: RootStore;
let nim: V2NIM;

const CALL_VIEW_WIDTH = 375;
const CALL_VIEW_HEIGHT = 606;
const CALL_PROVIDER_CONTAINER_ID = "ne-uikit-call-kit-provider";

let callProviderApp: App<Element> | null = null;
let callProviderContainer: HTMLDivElement | null = null;

const getCenteredCallViewPosition = () => {
  if (typeof window === "undefined") {
    return { x: 0, y: 0 };
  }

  return {
    x: Math.max(0, Math.round((window.innerWidth - CALL_VIEW_WIDTH) / 2)),
    y: Math.max(0, Math.round((window.innerHeight - CALL_VIEW_HEIGHT) / 2)),
  };
};

// callkit 相关逻辑
const CallKitProviderHost = defineComponent({
  name: "NEUIKitCallKitProviderHost",
  setup() {
    const callViewProviderRef = ref<any>(null);
    const callViewPosition = ref(getCenteredCallViewPosition());
    const neCallConfig = computed(() => ({
      nim,
      appkey: nim?.options?.appkey || "",
      debug: true,
    }));

    let callKitEventsBound = false;
    let callKitBindTimer: number | undefined;

    const handleCallViewResize = () => {
      callViewPosition.value = getCenteredCallViewPosition();
    };

    const pauseAllAudio = () => {
      const audio = document.getElementById(
        "yx-audio-message",
      ) as HTMLAudioElement | null;
      audio?.pause();
    };

    const pauseAllVideo = () => {
      document.querySelectorAll<HTMLVideoElement>("video").forEach((video) => {
        if (!video.paused) {
          video.pause();
        }
      });
    };

    const handleCallRecordSend = (options: any) => {
      if (options?.conversationId) {
        store.msgStore.addMsg(options.conversationId, [options]);
      }
    };

    const handleCallConnected = () => {
      pauseAllAudio();
      pauseAllVideo();
    };

    const bindCallKitEvents = () => {
      const neCall = callViewProviderRef.value?.neCall;
      if (!neCall || callKitEventsBound) {
        return;
      }

      neCall.on("onRecordSend", handleCallRecordSend);
      neCall.on("onCallConnected", handleCallConnected);
      neCall.setTimeout(30);
      callKitEventsBound = true;
    };

    const unbindCallKitEvents = () => {
      const neCall = callViewProviderRef.value?.neCall;
      if (!neCall || !callKitEventsBound) {
        return;
      }

      neCall.off("onRecordSend", handleCallRecordSend);
      neCall.off("onCallConnected", handleCallConnected);
      callKitEventsBound = false;
    };

    onMounted(() => {
      handleCallViewResize();
      window.addEventListener("resize", handleCallViewResize);

      nextTick(() => {
        callKitBindTimer = window.setTimeout(bindCallKitEvents, 0);
      });
    });

    onUnmounted(() => {
      window.removeEventListener("resize", handleCallViewResize);

      if (callKitBindTimer) {
        window.clearTimeout(callKitBindTimer);
      }

      unbindCallKitEvents();
    });

    return () =>
      h(CallViewProvider as any, {
        ref: callViewProviderRef,
        neCallConfig: neCallConfig.value,
        position: callViewPosition.value,
      });
  },
});

const mountCallKitProvider = () => {
  if (typeof document === "undefined") {
    return;
  }

  if (callProviderApp) {
    callProviderApp.unmount();
    callProviderApp = null;
  }

  if (callProviderContainer?.parentNode) {
    callProviderContainer.parentNode.removeChild(callProviderContainer);
  }

  callProviderContainer = document.createElement("div");
  callProviderContainer.id = CALL_PROVIDER_CONTAINER_ID;
  document.body.appendChild(callProviderContainer);

  callProviderApp = createApp(CallKitProviderHost);
  callProviderApp.mount(callProviderContainer);
};

export const initIMUIKit = (
  appkey: string,
  lbsUrls?: string,
  linkUrl?: string,
) => {
  nim = V2NIM.getInstance(
    {
      appkey: appkey,
      needReconnect: true,
      debugLevel: "debug",
      apiVersion: "v2",
      enableV2CloudConversation: enableV2CloudConversation,
    },
    {
      V2NIMLoginServiceConfig: {
        lbsUrls: lbsUrls
          ? [lbsUrls]
          : ["https://lbs.netease.im/lbs/webconf.jsp"],
        linkUrl: linkUrl || "weblink.netease.im",
      },
    },
  );

  store = new RootStore(
    // @ts-ignore
    nim,
    {
      // 添加好友是否需要验证
      addFriendNeedVerify: false,
      // 是否需要显示 p2p 消息、p2p会话列表消息已读未读，默认 false
      p2pMsgReceiptVisible: true,
      // 是否需要显示群组消息已读未读，默认 false
      teamMsgReceiptVisible: true,
      // 群组被邀请模式，默认需要验证
      teamAgreeMode:
        V2NIMConst.V2NIMTeamAgreeMode.V2NIM_TEAM_AGREE_MODE_NO_AUTH,
      // 是否展示群管理员
      teamManagerVisible,
      // 发送消息前回调, 可对消息体进行修改，添加自定义参数
      aiVisible: true,
      loginStateVisible: true,
      sendMsgBefore: async (options: {
        msg: V2NIMMessage;
        conversationId: string;
        serverExtension?: Record<string, unknown>;
      }) => {
        return {
          ...options,
        };
      },
    },
    "Web",
  );
  mountCallKitProvider();
  return {
    nim,
    store,
  };
};

export { store, nim };
