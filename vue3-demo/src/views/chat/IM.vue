<template>
  <div class="container-wrapper">
    <div class="container">
      <!-- IMUIKIT 相关内容 -->
      <div class="header">
        <div class="search">
          <Search />
        </div>
      </div>
      <div class="content">
        <div class="left">
          <UserAvatar />
          <div
            :class="{
              'chat-icon': true,
              active: model === 'chat',
            }"
            @click="() => (model = 'chat')"
          >
            <i
              :class="{
                iconfont: true,
                'icon-im': true,
              }"
            />
            <!-- 小红点显示 -->
            <div v-if="totalUnreadCount > 0" class="red-dot"></div>
            <div class="icon-label">{{ t("session") }}</div>
          </div>
          <div
            :class="{
              'contact-icon': true,
              active: model === 'contact',
            }"
            @click="() => (model = 'contact')"
          >
            <i
              :class="{
                iconfont: true,
                'icon-tongxunlu-weixuanzhong': true,
              }"
            />
            <!-- 通讯录未读数小红点显示 -->
            <div v-if="totalSysMsgUnreadCount > 0" class="red-dot"></div>
            <div class="icon-label">{{ t("addressText") }}</div>
          </div>
        </div>
        <div class="right">
          <!-- 网络连接提示 && 安全提示横幅 -->
          <Tip />
          <div v-if="model === 'chat'">
            <div class="right-list" ref="conversation">
              <ConversationList />
            </div>
            <div class="right-content">
              <MessageList />
            </div>
          </div>
          <div v-if="model === 'contact'">
            <Concat
              @afterSendMsgClick="() => (model = 'chat')"
              @onGroupItemClick="() => (model = 'chat')"
              @onBlackItemClick="() => (model = 'chat')"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ConversationList from "../../components/NEUIKit/Conversation/conversation-list.vue";
import MessageList from "../../components/NEUIKit/Chat/index.vue";
import Search from "../../components/NEUIKit/Search/index.vue";
import Concat from "../../components/NEUIKit/Contact/index.vue";
import UserAvatar from "../../components/NEUIKit/User/index.vue";
import { t } from "../../components/NEUIKit/utils/i18n";
import "./iconfont.css";
import { ref, getCurrentInstance, onMounted, onUnmounted } from "vue";
import { autorun } from "mobx";
import SettingsMenu from "./components/setting.vue";
import Tip from "./components/tip.vue";

// 获取组件实例和store
const { proxy } = getCurrentInstance()!;
const store = proxy?.$UIKitStore;

// 响应式数据
const model = ref("chat");
const totalUnreadCount = ref(0);
const totalSysMsgUnreadCount = ref(0);

const conversation = ref<HTMLElement | null>(null);

// 是否启用云端会话
const enableV2CloudConversation = store?.sdkOptions?.enableV2CloudConversation;

// autorun监听器
let totalUnreadCountWatch = () => {};
let totalSysMsgUnreadCountWatch = () => {};

// 生命周期钩子
onMounted(() => {
  // autorun监听未读消息数量变化
  totalUnreadCountWatch = autorun(() => {
    if (enableV2CloudConversation) {
      // 云端会话
      totalUnreadCount.value = store?.conversationStore?.totalUnreadCount || 0;
    } else {
      // 本地会话
      totalUnreadCount.value =
        store?.localConversationStore?.totalUnreadCount || 0;
    }
  });
  // autorun监听系统消息未读数量变化
  totalSysMsgUnreadCountWatch = autorun(() => {
    totalSysMsgUnreadCount.value =
      store?.sysMsgStore?.getTotalUnreadMsgsCount() || 0;
  });
});

onUnmounted(() => {
  // 清理autorun监听
  totalUnreadCountWatch();
  totalSysMsgUnreadCountWatch();
});
</script>

<style scoped>
.container-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.container {
  width: 1120px;
  height: 700px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  overflow: hidden;
}

.header {
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #e8e8e8;
}

.search {
  width: 600px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add {
  margin-left: 20px;
}

.content {
  width: 100%;
  height: 640px;
  display: flex;
}

.left {
  width: 60px;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  box-sizing: border-box;
  min-width: 60px;
}

.iconfont {
  font-size: 24px;
}

.chat-icon,
.contact-icon {
  margin: 0 0 25px 0;
  font-size: 22px;
  color: rgba(0, 0, 0, 0.6);
  height: 45px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  width: 36px;
  position: relative;
}

.active {
  color: #2a6bf2;
}

/* 小红点样式 */
.red-dot {
  position: absolute;
  top: 2px;
  right: -4px;
  width: 8px;
  height: 8px;
  background-color: #ff4d4f;
  border-radius: 50%;
  border: 1px solid #fff;
  z-index: 10;
}

/* setting-menu-icon 样式已移到 SettingsMenu 组件中 */

.icon-label {
  font-size: 12px;
  text-align: center;
}

.right {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.right > div:not(.tip) {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.right-list {
  width: 200px;
  border-right: 1px solid #e8e8e8;
}

.right-content {
  flex: 1;
  width: 0;
}
.collect {
  width: 100%;
  height: 100%;
}
.collect-right {
  width: 100%;
  height: 100%;
}
</style>
