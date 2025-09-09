<template>
  <Modal
    :visible="visible"
    :title="t('joinTeamText')"
    :width="500"
    :height="260"
    :top="100"
    :showDefaultFooter="!searchRes"
    :confirmText="t('searchButtonText')"
    :cancelText="t('cancelText')"
    :confirmDisabled="!searchValue.trim()"
    @confirm="handleSearch"
    @cancel="handleClose"
    @close="handleClose"
    @update:visible="handleUpdateVisible"
  >
    <div class="join-team-content">
      <!-- 搜索输入框 -->
      <Input
        v-model="searchValue"
        :placeholder="t('teamIdPlaceholder')"
        @input="handleChange"
        :inputStyle="{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #d9d9d9',
          borderRadius: '6px',
        }"
      />

      <!-- 搜索结果为空 -->
      <div v-if="searchResEmpty" class="empty-content">
        {{ t("teamIdNotMatchText") }}
      </div>

      <!-- 搜索结果 -->
      <div v-else-if="searchRes" class="search-result-content">
        <div class="team-info">
          <Avatar
            size="40"
            :avatar="searchRes.avatar"
            :account="searchRes.teamId"
          />
          <div class="team-details">
            <div class="team-name">
              {{ searchRes.name || searchRes.teamId }}
            </div>
            <div class="team-id">
              {{ searchRes.teamId }}
            </div>
          </div>
          <div class="action-button">
            <Button v-if="inTeam" type="primary" @click="handleChat">
              {{ t("chatButtonText") }}
            </Button>
            <Button v-else type="primary" :loading="adding" @click="handleAdd">
              {{ t("addText") }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { ref, computed, getCurrentInstance, watch, onMounted } from "vue";
import Modal from "../../CommonComponents/Modal.vue";
import Input from "../../CommonComponents/Input.vue";
import Avatar from "../../CommonComponents/Avatar.vue";
import Button from "../../CommonComponents/Button.vue";
import { showToast } from "../../utils/toast";
import { t } from "../../utils/i18n";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import type { V2NIMTeam } from "nim-web-sdk-ng/dist/esm/nim/src/V2NIMTeamService";

// Props
interface Props {
  visible: boolean;
  prefix?: string;
  commonPrefix?: string;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  prefix: "search",
  commonPrefix: "common",
});

// Emits
const emit = defineEmits<{
  close: [];
  chat: [teamId: string];
  "update:visible": [value: boolean];
}>();

const { proxy } = getCurrentInstance()!; // 获取组件实例
const store = proxy?.$UIKitStore;
const nim = proxy?.$NIM;

// 响应式数据
const searchValue = ref("");
const searchRes = ref<V2NIMTeam | undefined>(undefined);
const searchResEmpty = ref(false);
const adding = ref(false);

// 计算属性
const inTeam = ref(false);

// 事件处理函数
const handleChange = (event) => {
  searchValue.value = event.target.value;
  searchResEmpty.value = false;
  searchRes.value = undefined;
};

const handleSearch = async () => {
  try {
    const team = await store?.teamStore.getTeamForceActive(searchValue.value);

    if (!team) {
      searchResEmpty.value = true;
    } else {
      searchRes.value = team;
    }
  } catch (error) {
    searchResEmpty.value = true;
  }
};

const handleAdd = async () => {
  try {
    if (searchRes.value) {
      if (
        searchRes.value.teamType ===
        V2NIMConst.V2NIMTeamType.V2NIM_TEAM_TYPE_INVALID
      ) {
        showToast({
          message: t("notSupportJoinText"),
          type: "error",
        });
        return;
      }

      adding.value = true;
      await store?.teamStore.applyTeamActive(searchRes.value.teamId);
      // 加入成功后显示成功提示
      showToast({
        message: t("joinTeamSuccessText"),
        type: "success",
      });
      inTeam.value = true;
    }

    adding.value = false;
  } catch (error) {
    showToast({
      message: t("joinTeamFailedText"),
      type: "error",
    });
    adding.value = false;
  }
};

const handleChat = async () => {
  if (searchRes.value) {
    if (store?.sdkOptions?.enableV2CloudConversation) {
      await store?.conversationStore?.insertConversationActive(
        V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM,
        searchRes.value.teamId
      );
    } else {
      await store?.localConversationStore?.insertConversationActive(
        V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM,
        searchRes.value.teamId
      );
    }

    handleClose();
  }
};

const handleClose = () => {
  emit("close");
};

const handleUpdateVisible = (value: boolean) => {
  emit("update:visible", value);
};

onMounted(() => {
  inTeam.value = !!store?.teamStore.teams.has(searchRes.value?.teamId || "");
});

</script>

<style scoped>
.join-team-content {
  padding: 20px 0 0 0;
}

.empty-content {
  text-align: center;
  color: #f24957;
  margin-top: 20px;
  font-size: 14px;
}

.search-result-content {
  margin-top: 20px;
}

.team-info {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
}

.team-details {
  flex: 1;
  margin: 0 12px;
  overflow: hidden;
  font-size: 14px;
}

.team-name {
  color: #000;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.team-id {
  font-size: 14px;
  color: #666;
  font-size: 14px;
}

.action-button {
  max-width: 80px;
}
</style>
