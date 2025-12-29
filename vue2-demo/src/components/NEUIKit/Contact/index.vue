<template>
  <div
    :style="{
      backgroundColor: activeTab ? '#f6f8fa' : '#fff',
    }"
    class="contact-container"
  >
    <!-- 左侧导航栏 -->
    <div class="sidebar">
      <div class="sidebar-menu">
        <div
          class="menu-item"
          :class="{ active: activeTab === 'validMsg' }"
          @click="setActiveTab('validMsg')"
        >
          <Icon iconClassName="menu-icon" :size="36" type="icon-yanzheng" />
          <span class="menu-text">{{ t("validMsgText") }}</span>
          <Badge
            v-if="unreadSysMsgCount > 0"
            :num="unreadSysMsgCount"
            :style="{ marginLeft: 'auto' }"
          />
        </div>
        <div
          class="menu-item"
          :class="{ active: activeTab === 'blacklist' }"
          @click="setActiveTab('blacklist')"
        >
          <Icon iconClassName="menu-icon" :size="36" type="icon-lahei2" />
          <span class="menu-text">{{ t("blacklistText") }}</span>
        </div>
        <div
          class="menu-item"
          :class="{ active: activeTab === 'friends' }"
          @click="setActiveTab('friends')"
        >
          <div class="menu-icon-friend">
            <Icon :size="21" type="icon-friend" />
          </div>
          <span class="menu-text">{{ t("myFriendsText") }}</span>
        </div>
        <div
          class="menu-item"
          :class="{ active: activeTab === 'groups' }"
          @click="setActiveTab('groups')"
        >
          <Icon iconClassName="menu-icon" :size="36" type="icon-team2" />
          <span class="menu-text">{{ t("teamMenuText") }}</span>
        </div>
      </div>
    </div>

    <!-- 右侧内容区域 -->
    <div class="content-area">
      <div v-if="getContentTitle()" class="content-header">
        <h3>{{ getContentTitle() }}</h3>
        <span class="black-list-sub-title" v-if="activeTab === 'blacklist'">
          {{ "(" + t("blacklistSubTitle") + ")" }}
        </span>
      </div>
      <div class="content-body">
        <!-- 验证消息 -->
        <ValidList v-if="activeTab === 'validMsg'" />
        <!-- 黑名单 -->
        <BlackList
          v-else-if="activeTab === 'blacklist'"
          @onBlackItemClick="$emit('onBlackItemClick')"
        />
        <!-- 我的好友 -->
        <FriendList
          v-else-if="activeTab === 'friends'"
          @afterSendMsgClick="$emit('afterSendMsgClick')"
        />
        <!-- 我的群组 -->
        <TeamList
          v-else-if="activeTab === 'groups'"
          @onGroupItemClick="$emit('onGroupItemClick')"
        />
        <!-- 默认欢迎页面 -->
        <div v-else class="welcome-content">
          <Welcome />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Icon from "../CommonComponents/Icon.vue";
import Badge from "../CommonComponents/Badge.vue";
import FriendList from "./friend-list.vue";
import TeamList from "./team-list.vue";
import BlackList from "./black-list.vue";
import ValidList from "./valid-list.vue";
import { autorun } from "mobx";
import { t } from "../utils/i18n";
import { trackInit } from "../utils/reporter";
import Welcome from "../CommonComponents/Welcome.vue";
import { nim, uiKitStore } from "../utils/init";

export default {
  name: "ContactUIKit",
  components: {
    Icon,
    Badge,
    FriendList,
    TeamList,
    BlackList,
    ValidList,
    Welcome,
  },
  props: {},
  data() {
    return {
      store: uiKitStore,
      unreadSysMsgCount: 0,
      activeTab: "",
      uninstallUnreadWatch: null,
    };
  },
  created() {
    trackInit("ContactUIKit", nim && nim.options ? nim.options.appkey : "");
  },
  mounted() {
    this.activeTab = this.store.uiStore.selectedContactType;
    this.uninstallUnreadWatch = autorun(() => {
      this.unreadSysMsgCount =
        this.store?.sysMsgStore.getTotalUnreadMsgsCount();
    });
  },
  beforeDestroy() {
    if (typeof this.uninstallUnreadWatch === "function") {
      try {
        this.uninstallUnreadWatch();
      } catch (e) {
        console.error("uninstallUnreadWatch error", e);
      }
      this.uninstallUnreadWatch = null;
    }
  },
  methods: {
    t,
    setActiveTab(tab) {
      this.activeTab = tab;
      this.store.uiStore.selectContactType(tab);
      if (tab === "validMsg") {
        this.store?.sysMsgStore.setAllApplyMsgRead();
      }
    },
    getContentTitle() {
      const titleMap = {
        validMsg: t("validMsgText"),
        blacklist: t("blacklistText"),
        friends: t("myFriendsText"),
        groups: t("teamMenuText"),
      };
      return titleMap[this.activeTab];
    },
  },
};
</script>

<style scoped>
/* 主容器 */
.contact-container {
  height: 100%;
  width: 100%;
  display: flex;
  background-color: #f5f5f5;
}

/* 左侧边栏 */
.sidebar {
  width: 200px;
  background-color: #fff;
  border-right: 1px solid #e9eff5;
  display: flex;
  flex-direction: column;
}

/* 侧边栏头部 */
.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e9eff5;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

/* 侧边栏菜单 */
.sidebar-menu {
  flex: 1;
  padding: 4px 0;
}

/* 菜单项 */
.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 0;
  margin: 2px 4px;
  border-radius: 6px;
  box-sizing: border-box;
}

.menu-item:hover {
  background-color: #f8f9fa;
}

.menu-item.active {
  background-color: #e3f2fd;
  color: #1976d2;
}

.menu-item.active .menu-text {
  color: #1976d2;
  font-weight: 500;
}

/* 菜单图标 */
.menu-icon {
  margin-right: 12px;
  flex-shrink: 0;
}

/* 菜单文字 */
.menu-text {
  flex: 1;
  font-size: 14px;
  color: #000;
  white-space: nowrap;
}

/* 右侧内容区域 */
.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  /* background-color: #f6f8fa; */
}

/* 内容头部 */
.content-header {
  padding: 20px;
  border-bottom: 1px solid #e9eff5;
  display: flex;
  align-items: center;
}

.content-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  height: 26px;
  line-height: 26px;
}

/* 内容主体 */
.content-body {
  flex: 1;
  overflow: auto;
}

/* 欢迎内容 */
.welcome-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  width: 100%;
}

.welcome-illustration {
  margin-bottom: 20px;
}

.welcome-text {
  font-size: 16px;
  margin: 0;
}

.menu-icon-friend {
  background-color: #537ff4;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-right: 12px;
}

.black-list-sub-title {
  color: #666666;
  margin-left: 10px;
  display: block;
  font-size: 14px;
  height: 26px;
  line-height: 26px;
}
</style>
