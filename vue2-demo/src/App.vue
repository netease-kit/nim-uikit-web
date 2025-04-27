<template>
  <div id="app">
    <IMApp v-if="uikitInit" />
  </div>
</template>

<script>
import IMApp from "./components/IMApp/index.vue";
import { IMUIKit } from "@xkit-yx/im-kit-ui";
import V2NIM, { V2NIMConst } from "nim-web-sdk-ng";
import "./app.css";
export default {
  name: "App",
  components: {
    IMApp,
  },
  data() {
    return {
      uikitInit: false,
    };
  },
  mounted() {
    const initOptions = {
      appkey: "", // 请填写你的appkey
      account: "", // 请填写你的account
      token: "", // 请填写你的token
    };
    const localOptions = {
      // 添加好友模式，默认需要验证
      addFriendNeedVerify: true,
      // 群组被邀请模式，默认不需要验证
      teamAgreeMode:
        //@ts-ignore
        V2NIMConst.V2NIMTeamAgreeMode.V2NIM_TEAM_AGREE_MODE_NO_AUTH,
      // 单聊消息是否显示已读未读 默认 false
      p2pMsgReceiptVisible: true,
      // 群聊消息是否显示已读未读 默认 false
      teamMsgReceiptVisible: true,
      // 是否需要@消息 默认 true
      needMention: true,
      // 是否显示在线离线状态 默认 true
      loginStateVisible: true,
      // 是否允许转让群主
      allowTransferTeamOwner: true,
      // 是否需要显示群管理员相关主动功能，默认 false
      teamManagerVisible: true,
    };

    // 初始化 IM SDK 实例
    const nim = V2NIM.getInstance({
      appkey: initOptions.appkey,
      account: initOptions.account,
      token: initOptions.token,
      // 是否开启云端会话，默认不开启
      enableV2CloudConversation: false,
      debugLevel: "debug",
      apiVersion: "v2",
    });

    // IM 连接
    nim.V2NIMLoginService.login(initOptions.account, initOptions.token, {
      retryCount: 5,
    });

    // 初始化 UIKit 实例
    window.$uikit = new IMUIKit({
      nim,
      singleton: true,
      localOptions,
    });
    if (window.$uikit) {
      this.uikitInit = true;
    }
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

html {
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
