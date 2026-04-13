<template>
  <div v-if="showUiKit" class="app-container">
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { initIMUIKit } from "./components/NEUIKit/utils/init";
import { setGlobalNIMInstance } from "./components/NEQCHAT/utils/v2nim";

export default {
  name: "App",
  methods: {
    initIMUiKit(opts: { appkey: string; account: string; token: string }) {
      const { nim } = initIMUIKit(opts.appkey);

      // 设置全局NIM实例引用，供QChat的store使用, 未使用QChat的项目可以忽略
      setGlobalNIMInstance(nim);

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
