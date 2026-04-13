<template>
  <div class="servers-home-container">
    <div class="header-bg">
      <img
        src="https://images.pexels.com/photos/10540135/pexels-photo-10540135.jpeg"
        alt="header_bg"
      />
    </div>
    <div class="servers-wrap">
      <div
        class="server-item"
        v-for="server in serverConfigs"
        :key="server.id"
        @click="handleServerClick(server.id)"
      >
        <img class="header" :src="server.bg" />
        <div class="content">
          <img class="avatar" :src="server.avatar" />
          <div class="title">
            <Text
              :style="{ maxWidth: '240px', color: '#fff' }"
              :content="server.title"
              :ellipsis="{ tooltip: server.title }"
            >
            </Text>
          </div>
          <div class="id">
            <Text
              :style="{
                maxWidth: '240px',
                color: '#6E6F74',
                fontSize: '12px',
                lineHeight: '14px',
              }"
              :content="'ID：' + server.id"
              :ellipsis="{ tooltip: 'ID：' + server.id }"
            >
            </Text>
          </div>
          <div class="desc">
            <Paragraph
              :style="{
                maxWidth: '240px',
                color: '#A3A4A9',
                fontSize: '14px',
                lineHeight: '18px',
              }"
              :content="server.desc"
              :ellipsis="{ tooltip: server.desc, rows: 3 }"
            >
            </Paragraph>
          </div>
        </div>
      </div>
    </div>
    <div class="mask" v-if="maskVisible" @click="handleMaskClick"></div>
    <LoginController
      v-if="loginVisible"
      :autoLogin="true"
      :memoryMode="memoryMode"
      :onLogin="onLoginSdk"
      @closeLoginDialog="closeLoginDialog"
    />
  </div>
</template>

<script lang="ts">
import { computed, ref } from "vue";
import { Typography } from "ant-design-vue";
import { useStore } from "vuex";
import LoginController, {
  memoryFuncCreator,
  NIM_CONFIG_KEY,
} from "./LoginController.vue";
import logger from "../utils/logger";

const Text = Typography.Text;
const Paragraph = Typography.Paragraph;

const serverConfigs: {
  bg: string;
  avatar: string;
  title: string;
  id: string;
  desc: string;
}[] = [
  {
    id: "3488544",
    title: "兴趣组集中营",
    bg: "",
    avatar: "",
    desc: "该广场可以提供给用户互相交流彼此爱好，发现与你志同道合的好友",
  },
  {
    id: "33434344",
    title: "游戏交友社区",
    bg: "",
    avatar: "",
    desc: "游戏交流、游戏资讯、游戏邀约，一应俱全。一起游戏，一起享受生活",
  },
  {
    id: "234534",
    title: "天气正好，相约一起玩耍",
    bg: "",
    avatar: "",
    desc: "该广场可以提供给用户互相交流彼此爱好，发现与你志同道合的好友",
  },
  {
    id: "45556454",
    title: "一起 High",
    bg: "",
    avatar: "",
    desc: "该广场可以提供给用户互相交流彼此爱好，发现与你志同道合的好友",
  },
];

export default {
  name: "ServersHome",
  components: {
    Text,
    Paragraph,
    LoginController,
  },

  setup() {
    const maskVisibleRef = ref<boolean>(true);
    const loginVisible = ref<boolean>(false);
    const store = useStore();
    const storage = memoryFuncCreator(process.env.VUE_APP_MEMORY_MODE);

    // 检查是否存在配置
    const nimConfig = localStorage.getItem(NIM_CONFIG_KEY);
    if (nimConfig) {
      try {
        const config = JSON.parse(nimConfig);
        if (config.account && config.appkey && config.token) {
          maskVisibleRef.value = false;
          loginVisible.value = true;
        } else {
          maskVisibleRef.value = true;
          loginVisible.value = false;
        }
      } catch (error) {
        console.error("解析 nimConfig 失败:", error);
        maskVisibleRef.value = true;
        loginVisible.value = false;
      }
    } else {
      maskVisibleRef.value = true;
      loginVisible.value = false;
    }

    return {
      serverConfigs,
      loginVisible,
      maskVisible: computed(() => maskVisibleRef.value),
      handleMaskClick: () => {
        loginVisible.value = true;
        maskVisibleRef.value = !maskVisibleRef.value;
      },
      handleServerClick: (serverId: string) => {
        store.commit("server/setSearchServerId", serverId);
      },
      closeLoginDialog: () => {
        loginVisible.value = false;
        maskVisibleRef.value = !maskVisibleRef.value;
      },
      appkey: process.env.VUE_APP_APPKEY,
      baseDomain: process.env.VUE_APP_BASE_DOMAIN,
      scope: process.env.VUE_APP_SCOPE,
      parentScope: process.env.VUE_APP_PARENT_SCOPE,
      memoryMode: process.env.VUE_APP_MEMORY_MODE,
      onLoginSdk: async (nimConfig: any) => {
        try {
          // 使用从 localStorage 读取的 nimConfig
          await store.dispatch("sdk/nimLogin", {
            appkey: nimConfig.appkey,
            token: nimConfig.token,
            account: nimConfig.account,
            debugLevel: "debug",
            lbsUrls: JSON.parse(process.env.VUE_APP_IM_LBS_URL),
            defaultLink: process.env.VUE_APP_IM_DEFAULT_LINK,
            store,
          });
        } catch (err) {
          console.error("nim login failed", err);
          return false;
        }

        let linkAddresses = [];
        try {
          linkAddresses = await store.dispatch("sdk/nimGetQChatAddress");
        } catch (err) {
          console.error("nim getQChatAddress failed", err);
          return false;
        }

        logger.log("Get linkAddresses success", linkAddresses);
        try {
          await store.dispatch("sdk/qchatLogin", {
            appkey: nimConfig.appkey,
            token: nimConfig.token,
            account: nimConfig.account,
            linkAddresses: linkAddresses,
            debugLevel: "debug",
            authType: 0,
            store,
          });
          loginVisible.value = false;
          maskVisibleRef.value = false;
          return true;
        } catch (err) {
          console.error("qchat login failed", err);
          return false;
        }
      },
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.servers-home-container {
  display: inline-flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 680px;

  .header-bg {
    width: 100%;
    height: 340px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .servers-wrap {
    display: inline-flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    flex: 1;
    width: 100%;
    padding: 80px 0 0;
    background: #ffffff;

    .server-item {
      display: inline-flex;
      flex-direction: column;
      width: 280px;
      height: 320px;
      padding-bottom: 32px;
      border-radius: 12px;
      background: #ffffff;
      margin-right: 16px;
      cursor: pointer;

      &:last-of-type {
        margin-right: 0;
      }

      .header {
        width: 100%;
        height: 136px;
        margin-bottom: 40px;
        border-radius: 12px 12px 0 0;
        object-fit: cover;
      }

      .content {
        position: relative;
        width: 100%;
        flex: 1;
        padding: 0 20px;
        text-align: left;

        .avatar {
          position: absolute;
          width: 50px;
          height: 50px;
          left: 20px;
          top: -65px;
          border: 2px solid #ffffff;
          border-radius: 9px;
        }

        .title {
          font-size: 16px;
          line-height: 18px;
        }

        .id {
          margin-top: 8px;
          font-size: 12px;
          line-height: 14px;
          color: #6e6f74;
        }

        .desc {
          margin-top: 16px;
          font-size: 14px;
          line-height: 18px;
          color: #a3a4a9;
        }
      }
    }
  }

  .mask {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
}
</style>
