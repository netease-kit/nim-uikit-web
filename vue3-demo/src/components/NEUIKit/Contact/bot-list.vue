<template>
  <div class="bot-list-container">
    <!-- 顶部操作栏 -->
    <div class="bot-list-header">
      <div class="header-title">{{ t("myRobotsText") }}</div>
      <div class="create-bot-btn" @click="handleCreateBot">
        <Icon
          iconClassName="add-icon"
          :size="16"
          color="#A6ADB6"
          type="icon-tianjiaanniu"
        />
      </div>
    </div>

    <!-- Loading 状态 -->
    <Loading v-if="loading" />

    <!-- 空状态 -->
    <div v-else-if="botList.length === 0" class="empty-state">
      <Empty :text="t('robotEmptyText')" />
      <p class="empty-tip">{{ t("robotEmptyTipText") }}</p>
    </div>

    <!-- 机器人列表 -->
    <div v-else class="bot-list">
      <div
        v-for="bot in botList"
        :key="bot.accid"
        class="bot-item"
        @click="handleBotClick(bot)"
      >
        <Avatar
          size="48"
          :account="bot.accid"
          :avatar="bot.icon"
          :nick="bot.name"
        />
        <div class="bot-info">
          <div class="bot-name">{{ bot.name }}</div>
        </div>
      </div>
    </div>

    <!-- 创建机器人弹窗 -->
    <CreateBotModal
      v-if="showCreateModal"
      :visible="showCreateModal"
      @close="handleCloseCreateModal"
      @success="handleCreateSuccess"
    />

    <!-- 机器人名片弹窗 -->
    <BotCardModal
      v-if="showCardModal"
      :visible="showCardModal"
      :bot="selectedBot"
      @close="handleCloseCardModal"
      @delete="handleDeleteSuccess"
      @updated="handleBotUpdated"
      @afterSendMsgClick="emit('afterSendMsgClick')"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import Avatar from "../CommonComponents/Avatar.vue";
import Loading from "../CommonComponents/Loading.vue";
import Empty from "../CommonComponents/Empty.vue";
import Icon from "../CommonComponents/Icon.vue";
import CreateBotModal from "./bot/create-bot-modal.vue";
import BotCardModal from "./bot/bot-card-modal.vue";
import { t } from "../utils/i18n";
import { nim, store } from "../utils/init";
import { showToast } from "../utils/toast";
import type { V2NIMUserAIBot } from "nim-web-sdk-ng/dist/esm/nim/src/V2NIMAIService";
import { autorun } from "mobx";

const emit = defineEmits<{
  afterSendMsgClick: [];
}>();

// 状态定义
const loading = ref(false);
const botList = ref<V2NIMUserAIBot[]>([]);
const showCreateModal = ref(false);
const showCardModal = ref(false);
const selectedBot = ref<V2NIMUserAIBot | null>(null);

// 获取机器人列表
const fetchBotList = async () => {
  loading.value = true;
  try {
    const result = await store.aiUserStore?.getUserAIBotListActive();
    botList.value = result?.bots || [];
  } catch (error) {
    console.error("获取机器人列表失败:", error);
    showToast(t("searchFailText"));
  } finally {
    loading.value = false;
  }
};

// 点击机器人项
const handleBotClick = (bot: V2NIMUserAIBot) => {
  selectedBot.value = bot;
  showCardModal.value = true;
};

// 创建机器人
const handleCreateBot = () => {
  if (botList.value.length >= 10) {
    showToast(t("robotLimitReachedText"));
    return;
  }
  showCreateModal.value = true;
};

// 关闭创建弹窗
const handleCloseCreateModal = () => {
  showCreateModal.value = false;
};

// 创建成功
const handleCreateSuccess = (bot: V2NIMUserAIBot) => {
  handleCloseCreateModal();
  selectedBot.value = bot;
  showCardModal.value = true;
  fetchBotList(); // 刷新列表
};

// 关闭名片弹窗
const handleCloseCardModal = () => {
  showCardModal.value = false;
  selectedBot.value = null;
};

// 删除成功
const handleDeleteSuccess = () => {
  handleCloseCardModal();
};

// 更新成功：刷新列表，并同步更新当前选中的 bot
const handleBotUpdated = async () => {
  await fetchBotList();
  if (selectedBot.value) {
    const updated = botList.value.find(b => b.accid === selectedBot.value!.accid);
    if (updated) {
      selectedBot.value = updated;
    }
  }
};

let aiBotsWatch = () => {};

// 组件挂载时加载列表
onMounted(() => {
  aiBotsWatch = autorun(() => {

    botList.value = [...store.aiUserStore?.aiBots.values()];
  });
  fetchBotList();
});

onUnmounted(() => {
  aiBotsWatch();
});
</script>

<style scoped>
.bot-list-container {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f6f8fa;
}

.bot-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 66px;
  border-bottom: 1px solid #e9eff5;
  flex-shrink: 0;
}

.header-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
}

.empty-tip {
  margin-top: 10px;
  font-size: 14px;
  color: #666;
}

.bot-list {
  flex: 1;
  overflow: auto;
}

.bot-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  min-height: 60px;
  box-sizing: border-box;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.bot-item:hover {
  background-color: #f8f9fa;
}

.bot-info {
  flex: 1;
  margin-left: 12px;
  overflow: hidden;
}

.bot-name {
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}

.bot-account {
  font-size: 12px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 2px;
}

.create-bot-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: #f1f5f8;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  outline: none;
}

.create-bot-btn:hover {
  background-color: #e3e8ed;
}
</style>
./bot/bot-card-modal.vue./bot/create-bot-modal.vue
