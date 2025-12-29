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
      <div
        v-else-if="searchRes && searchRes !== 'notFind'"
        class="search-result-content"
      >
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
      <!-- 未找到 -->
      <div v-if="searchRes == 'notFind'" class="empty-content">
        {{ t("searchNoResText") }}
      </div>
    </div>
  </Modal>
</template>

<script>
import Modal from "../../CommonComponents/Modal.vue";
import Input from "../../CommonComponents/Input.vue";
import Avatar from "../../CommonComponents/Avatar.vue";
import Button from "../../CommonComponents/Button.vue";
import { showToast } from "../../utils/toast";
import { t } from "../../utils/i18n";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import { uiKitStore } from "../../utils/init";

export default {
  name: "JoinTeamModal",
  components: { Modal, Input, Avatar, Button },
  props: {
    visible: { type: Boolean, default: false },
    prefix: { type: String, default: "search" },
    commonPrefix: { type: String, default: "common" },
  },
  data() {
    return {
      store: uiKitStore,
      searchValue: "",
      searchRes: undefined,
      searchResEmpty: false,
      adding: false,
      inTeam: false,
    };
  },
  methods: {
    t,
    handleChange(event) {
      this.searchValue =
        event && event.target ? event.target.value : String(event || "");
      this.searchResEmpty = false;
      this.searchRes = undefined;
    },
    async handleSearch() {
      try {
        const team = await this.store?.teamStore.getTeamForceActive(
          this.searchValue
        );
        this.inTeam = !!this.store?.teamStore.teams.get(this.searchValue);
        if (!team) {
          this.searchResEmpty = true;
        } else {
          this.searchRes = team;
        }
      } catch (error) {
        this.searchRes = "notFind";
        showToast({ message: t("searchFailText"), type: "info" });
      }
    },
    async handleAdd() {
      try {
        if (this.searchRes && this.searchRes !== "notFind") {
          if (
            this.searchRes.teamType ===
            V2NIMConst.V2NIMTeamType.V2NIM_TEAM_TYPE_INVALID
          ) {
            showToast({ message: t("notSupportJoinText"), type: "error" });
            return;
          }
          this.adding = true;
          await this.store?.teamStore.applyTeamActive(this.searchRes.teamId);
          showToast({ message: t("joinTeamSuccessText"), type: "success" });
          this.inTeam = true;
        }
        this.adding = false;
      } catch (error) {
        if (error && error.code === 108437) {
          showToast({ message: t("joinTeamLimitText"), type: "error" });
        } else if (error && error.code === 109311) {
          showToast({ message: t("alreadyInTeamText"), type: "warning" });
          this.inTeam = true;
        } else {
          showToast({ message: t("joinTeamFailedText"), type: "error" });
        }
        this.adding = false;
      }
    },
    async handleChat() {
      if (this.searchRes && this.searchRes !== "notFind") {
        if (this.store?.sdkOptions?.enableV2CloudConversation) {
          await this.store?.conversationStore?.insertConversationActive(
            V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM,
            this.searchRes.teamId
          );
        } else {
          await this.store?.localConversationStore?.insertConversationActive(
            V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM,
            this.searchRes.teamId
          );
        }
        this.$emit("goChat");
        this.handleClose();
      }
    },
    handleClose() {
      this.$emit("close");
    },
    handleUpdateVisible(value) {
      this.$emit("update:visible", value);
    },
  },
  mounted() {
    if (this.searchRes && this.searchRes !== "notFind") {
      this.inTeam = !!this.store?.teamStore.teams.has(
        (this.searchRes && this.searchRes.teamId) || ""
      );
    }
  },
};
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
