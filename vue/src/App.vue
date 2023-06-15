<template>
  <IMApp v-if="uikitInit" />
</template>
<script lang="ts">
import IMApp from "./components/IMApp/index.vue";
import { IMUIKit } from "@xkit-yx/im-kit-ui";
import { app } from "./main";
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
      teamBeInviteMode: 'noVerify' as "noVerify" | "needVerify",
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
    }
    app.config.globalProperties.$uikit = new IMUIKit({
      initOptions,
      singleton: true,
      sdkVersion: 1,
      localOptions
    });
    if (app.config.globalProperties.$uikit) {
      this.uikitInit = true;
    }
  },
};
</script>
