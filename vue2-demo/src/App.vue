<template>
  <div v-if="showUiKit" class="app-container">
    <router-view></router-view>
  </div>
</template>

<script>
import { initIMUIKit } from "./components/NEUIKit/utils/init.js";
import { STORAGE_KEY } from "./components/NEUIKit/utils/constants";
import { showToast } from "./components/NEUIKit/utils/toast";
export default {
  name: "App",
  components: {},
  data() {
    return {
      showUiKit: false,
    };
  },

  methods: {
    init(opts) {
      const { nim } = initIMUIKit(opts.appkey);

      nim.V2NIMLoginService.login(opts.account, opts.token)
        .then(() => {
          if (this.$route.path !== "/chat") {
            this.$router.push("/chat");
          }
          this.showUiKit = true;
        })
        .catch((error) => {
          if (error.code === 102422) {
            // 账号被封禁
            showToast({
              message: "当前账号已被封禁",
              type: "info",
            });
          }
          // 登录信息无效，清除并跳转到登录页
          sessionStorage.removeItem(STORAGE_KEY);
          if (this.$route.path !== "/login") {
            this.$router.push("/login");
          }
        });
    },
    checkLoginStatus() {
      const loginInfo = sessionStorage.getItem(STORAGE_KEY);
      if (!loginInfo) {
        // 未登录，跳转到登录页
        if (this.$route.path !== "/login") {
          this.$router.push("/login");
        }
        this.showUiKit = true;
        return;
      }

      try {
        const { account, token } = JSON.parse(loginInfo);
        // 重新初始化 IM
        this.init({
          account,
          token,
        });
      } catch (error) {
        console.error("解析登录信息失败", error);
        // 登录信息无效，清除并跳转到登录页
        sessionStorage.removeItem(STORAGE_KEY);
        if (this.$route.path !== "/login") {
          this.$router.push("/login");
        }
      }
    },
  },
  mounted() {
    this.init({
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
