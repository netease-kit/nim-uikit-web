<template>
  <div v-if="showUiKit" class="app-container">
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { initIMUIKit } from "./components/NEUIKit/utils/init";
import { setLanguage } from "./components/NEUIKit/utils/i18n";
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
    init(opts: {
      account: string;
      token: string;
      appkey: string;
      linkUrl: string;
      lbsUrls: string;
    }) {
      setLanguage(
        localStorage.getItem("switchToEnglishFlag") == "en" ? "en" : "zh",
      );

      const { nim } = initIMUIKit(opts.appkey, opts.lbsUrls, opts.linkUrl);

      nim.V2NIMLoginService.login(opts.account, opts.token)
        .then(() => {
          // IM 登录成功后跳转到会话页面
          this.$router.push("/chat");
          this.showUiKit = true;
        })
        .catch((error) => {
          if (error.code === 102422) {
            // 账号被封禁
            showToast({
              message: "当前账号已被封禁",
              type: "info",
            });
            // 登录信息无效，清除并跳转到登录页
            localStorage.removeItem(STORAGE_KEY);
            this.$router.push("/login");
            this.showUiKit = true;
          } else {
            console.error("登录失败", error);

            this.$router.push("/login");
            this.showUiKit = true;
          }
        });
    },
    checkLoginStatus() {
      // 首先检查 localStorage 中的配置信息
      const configInfo =
        localStorage.getItem(STORAGE_KEY) || localStorage.getItem("nimConfig");

      if (!configInfo) {
        // 没有配置信息，跳转到登录页面进行配置
        this.$router.push("/login");
        this.showUiKit = true;
        return;
      }

      try {
        const config = JSON.parse(configInfo);
        const { appkey, account, token, lbsUrls, linkUrl } = config;

        if (!appkey || !account || !token) {
          // 配置信息不完整，跳转到登录页面重新配置
          this.$router.push("/login");
          this.showUiKit = true;
          return;
        }

        console.log("配置信息", configInfo);

        // 配置信息完整，直接初始化 IM
        this.init({
          appkey,
          account,
          token,
          lbsUrls,
          linkUrl,
        });
      } catch (error) {
        console.error("解析配置信息失败", error);
        // 配置信息无效，清除并跳转到登录页
        localStorage.removeItem(STORAGE_KEY);
        this.$router.push("/login");
        this.showUiKit = true;
      }
    },
  },
  mounted() {
    // 检查登录状态
    this.checkLoginStatus();
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
