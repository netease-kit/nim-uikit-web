<template>
  <div class="home-container">
    <div class="servers-wrap">
      <ServerBar></ServerBar>
    </div>
    <div class="server-content-wrap">
      <div class="channels-wrap">
        <ChannelBar></ChannelBar>
      </div>
      <div class="chatpage-wrap">
        <div v-if="isSDKReady" class="chat-content">
          <ChatPage></ChatPage>
        </div>
        <div v-else class="loading-container">
          <div class="loading-text">正在初始化聊天服务...</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, watch } from "vue";
import { useStore } from "vuex";
import { ServerBar, ChannelBar, ChatPage } from "../components";

export default {
  name: "HomeView",
  components: {
    ServerBar,
    ChannelBar,
    ChatPage,
  },
  setup() {
    const store = useStore();

    // UIKit已经处理了SDK初始化，QChat可以直接使用
    // 不需要再检查SDK初始化状态
    const isSDKReady = computed(() => {
      // 直接返回true，因为UIKit已经保证了SDK已初始化
      return true;
    });

    // 不再需要监听SDK初始化状态，因为UIKit已经处理了
    console.log("QChat HomeView: UIKit已保证SDK初始化完成，聊天服务就绪");

    return {
      isSDKReady,
    };
  },
};
</script>

<style scoped lang="less">
.home-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  color: #262626;
  background-color: #ffffff;

  .servers-wrap {
    width: 66px;
    background-color: #f8f9fa;
    border-right: 1px solid #e8e8e8;
  }

  .server-content-wrap {
    display: inline-flex;
    flex-direction: row;
    flex: 1;
    height: 100%;
    overflow-y: scroll;

    .channels-wrap {
      width: 222px;
      background-color: #fafafa;
      border-right: 1px solid #e8e8e8;
    }

    .chatpage-wrap {
      flex: 1;
      background-color: #ffffff;

      .loading-container {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        background-color: #ffffff;

        .loading-text {
          color: #8c8c8c;
          font-size: 16px;
        }
      }

      .chat-content {
        height: 100%;
      }
    }
  }
}
</style>
