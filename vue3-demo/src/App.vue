<template>
  <div v-if="showUiKit" class="app-container">
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { initIMUIKit } from "./components/NEUIKit/utils/init";

export default {
  name: "App",
  methods: {
    initIMUiKit(opts: { appkey: string; account: string; token: string }) {
      const { nim } = initIMUIKit(opts.appkey);

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
      appkey: "", //您在云信控制台注册的appkey
      account: "", //云信控制台上的account
      token: "",
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
