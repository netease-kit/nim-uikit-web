<template>
  <div v-if="showUiKit" class="app-container">
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import RootStore from "@xkit-yx/im-store-v2";
import V2NIM from "nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK";
import type { V2NIMMessage } from "nim-web-sdk-ng/dist/esm/nim/src/V2NIMMessageService";
import { getCurrentInstance } from "vue";

export default {
  name: "App",
  methods: {
    initIMUiKit(opts: { appkey: string; account: string; token: string }) {
      const init = () => {
        //初始化nim
        const nim = V2NIM.getInstance(
          {
            appkey: opts.appkey,
            needReconnect: true,
            debugLevel: "debug",
            apiVersion: "v2",
            enableV2CloudConversation: false,
          },
          {
            V2NIMLoginServiceConfig: {
              lbsUrls: ["https://lbs.netease.im/lbs/webconf.jsp"],
              linkUrl: "weblink.netease.im",
            },
          }
        );
        // 初始化store
        const store = new RootStore(
          // @ts-ignore
          //参数一：NIMSDK，必填
          nim,
          // 本地化配置，必填，详细参数说明请参考全局上下文的底部常见问题
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
            // 发送消息前回调, 可对消息体进行修改，添加自定义参数
            sendMsgBefore: async (options: {
              msg: V2NIMMessage;
              conversationId: string;
              serverExtension?: Record<string, unknown>;
            }) => {
              return { ...options };
            },
          },
          //参数三：平台，可选
          "Web"
        );
        return {
          nim,
          store,
        };
      };

      const { nim, store } = init();
      const app = getCurrentInstance();

      // 将nim和store 挂载，供组件内部访问
      if (app) {
        app.appContext.app.config.globalProperties.$NIM = nim;
        app.appContext.app.config.globalProperties.$UIKitStore = store;
      }

      nim.V2NIMLoginService.login(opts.account, opts.token).then(() => {
        // IM 登录成功后跳转到会话页面
        this.showUiKit = true;
        this.$router.push("/chat");
      });
    },
  },
  data() {
    return {
      showUiKit: false,
    };
  },
  mounted() {
    this.initIMUiKit({
      appkey: "", // 请填写你的appkey
      account: "", // 请填写你的account
      token: "", // 请填写你的token
    });
  },
};
</script>

<style>
.app-container {
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  background-image: url("./assets/bg.png");
}
</style>
