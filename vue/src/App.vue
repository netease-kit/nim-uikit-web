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
    app.config.globalProperties.$uikit = new IMUIKit({
      initOptions,
      singleton: true,
      sdkVersion: 1,
    });
    if (app.config.globalProperties.$uikit) {
      this.uikitInit = true;
    }
  },
};
</script>
