<template>
  <Modal
    v-if="visible"
    :visible="visible"
    :title="t('createTeamText')"
    :confirmText="t('createButtonText')"
    :cancelText="t('cancelText')"
    :width="900"
    :height="610"
    :showDefaultFooter="true"
    @confirm="createTeam"
    @cancel="handleClose"
    @close="handleClose"
  >
    <div class="create-team-content">
      <!-- 群名称输入 -->
      <div class="team-name-section">
        <div class="section-div team-name-label">{{ t("teamTitle") }}</div>
        <Input
          v-model="teamName"
          :inputStyle="{
            backgroundColor: '#f1f5f8',
          }"
          type="text"
          class="team-name-input"
          :placeholder="t('teamTitlePlaceholder')"
          :maxlength="30"
        />
      </div>

      <!-- 群头像选择 -->
      <div class="team-avatar-section">
        <div class="section-div team-name-label">{{ t("teamAvatar") }}</div>
        <div class="avatar-selector">
          <div
            class="avatar-option"
            :class="{ selected: selectedAvatarIndex === index }"
            v-for="(avatar, index) in teamAvatarOptions"
            :key="index"
            @click="selectAvatar(index)"
          >
            <img :src="avatar" alt="群头像" class="avatar-img" />
          </div>
        </div>
      </div>

      <!-- 主要内容区域：左右分栏 -->
      <div class="main-content">
        <!-- 左侧：好友选择 -->
        <div class="left-panel">
          <div class="friends-section">
            <div class="section-header">
              <span class="section-div friend-select-text">{{
                t("friendSelectText")
              }}</span>
            </div>
            <div class="person-select-container">
              <PersonSelect
                :personList="friendList"
                :selected="selectedAccounts"
                @update:selected="onSelectedUpdate"
                :radio="false"
                :showBtn="false"
                avatarSize="32"
              />
            </div>
          </div>
        </div>

        <!-- 右侧：已选择的好友 -->
        <div class="right-panel">
          <div class="selected-friends-section">
            <div class="selected-header">
              <span class="selected-count"
                >{{ t("selectedText") }}: {{ teamMembers.length }}
                {{ t("personUnit") }}</span
              >
            </div>
            <div class="selected-friends-container">
              <div class="selected-friends-list">
                <div
                  v-for="accountId in teamMembers"
                  :key="accountId"
                  class="selected-friend-item"
                >
                  <Avatar
                    class="selected-avatar"
                    size="32"
                    :account="accountId"
                  />
                  <div class="selected-friend-info">
                    <Appellation
                      class="selected-friend-name"
                      :account="accountId"
                      :fontSize="14"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script>
import Modal from "../../CommonComponents/Modal.vue";
import PersonSelect from "../../CommonComponents/PersonSelect.vue";
import Avatar from "../../CommonComponents/Avatar.vue";
import Appellation from "../../CommonComponents/Appellation.vue";
import { t } from "../../utils/i18n";
import { toast } from "../../utils/toast";
import Input from "../../CommonComponents/Input.vue";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import { uiKitStore } from "../../utils/init";

export default {
  name: "CreateTeamModal",
  components: { Modal, PersonSelect, Avatar, Appellation, Input },
  props: {
    visible: { type: Boolean, default: false },
    p2pAccountId: { type: String, default: "" },
  },
  data() {
    return {
      friendList: [],
      teamName: "",
      selectedAvatarIndex: 0,
      selectedAccounts: [],
      teamAvatarOptions: [
        "https://yx-web-nosdn.netease.im/common/2425b4cc058e5788867d63c322feb7ac/groupAvatar1.png",
        "https://yx-web-nosdn.netease.im/common/62c45692c9771ab388d43fea1c9d2758/groupAvatar2.png",
        "https://yx-web-nosdn.netease.im/common/d1ed3c21d3f87a41568d17197760e663/groupAvatar3.png",
        "https://yx-web-nosdn.netease.im/common/e677d8551deb96723af2b40b821c766a/groupAvatar4.png",
        "https://yx-web-nosdn.netease.im/common/fd6c75bb6abca9c810d1292e66d5d87e/groupAvatar5.png",
      ],
      creating: false,
    };
  },
  computed: {
    store() {
      return uiKitStore;
    },
    teamMembers() {
      return this.selectedAccounts;
    },
  },
  watch: {
    visible(newVisible, oldVisible) {
      if (oldVisible && !newVisible) {
        setTimeout(this.resetState, 300);
      }
    },
  },
  created() {
    const p2p = this.p2pAccountId;
    const list = (this.store?.uiStore.friends || []).filter(
      (item) =>
        !(this.store?.relationStore.blacklist || []).includes(item.accountId)
    );

    this.friendList = list
      .map((item) => ({ accountId: item.accountId }))
      .filter((item) => item.accountId !== p2p);

    if (p2p) {
      this.friendList.push({ accountId: p2p, checked: true, disabled: true });
      this.selectedAccounts = [p2p];
    }
  },
  methods: {
    t,
    handleClose() {
      this.$emit("close");
    },
    selectAvatar(index) {
      this.selectedAvatarIndex = index;
    },
    onSelectedUpdate(next) {
      if ((next || []).length > 200) {
        toast.info(t("maxSelectedText"));
        return;
      }
      this.selectedAccounts = next;
    },
    createTeamName(teamMembers) {
      if ((this.teamName || "").trim()) {
        return this.teamName.trim();
      }
      const _memberNickArr = [];
      (teamMembers || []).forEach((item) => {
        const appellation = this.store?.uiStore.getAppellation({
          account: item,
        });
        if (appellation) {
          _memberNickArr.push(appellation);
        }
      });
      const _ownerName =
        (this.store?.userStore.myUserInfo &&
          this.store.userStore.myUserInfo.name) ||
        (this.store?.userStore.myUserInfo &&
          this.store.userStore.myUserInfo.accountId);
      const _teamName = (
        String(_ownerName || "") +
        "、" +
        _memberNickArr.join("、")
      ).slice(0, 30);
      return _teamName;
    },
    async createTeam() {
      try {
        if (this.creating) return;
        if ((this.teamMembers || []).length === 0) {
          toast.info(t("friendSelect"));
          return;
        }
        if ((this.teamMembers || []).length > 200) {
          toast.info(t("maxSelectedText"));
          return;
        }
        this.creating = true;

        const team = await this.store?.teamStore.createTeamActive({
          accounts: [...this.teamMembers],
          avatar: this.teamAvatarOptions[this.selectedAvatarIndex],
          name: this.createTeamName(this.teamMembers),
        });

        const teamId = team && team.teamId;
        if (teamId) {
          if (this.store?.sdkOptions?.enableV2CloudConversation) {
            await this.store.conversationStore?.insertConversationActive(
              V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM,
              teamId,
              true
            );
          } else {
            await this.store?.localConversationStore?.insertConversationActive(
              V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM,
              teamId,
              true
            );
          }
        }

        toast.success(t("createTeamSuccessText"));
        this.$emit("goChat");
        this.handleClose();
      } catch (error) {
        toast.error(t("createTeamFailedText"));
      } finally {
        this.creating = false;
      }
    },
    resetState() {
      this.teamName = "";
      this.selectedAvatarIndex = 0;
      this.selectedAccounts = this.p2pAccountId ? [this.p2pAccountId] : [];
    },
  },
};
</script>

<style scoped>
.create-team-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 480px;
  overflow-y: hidden;
}

.section-div {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.friend-select-text {
  margin-left: 18px;
}

.team-name-label {
  font-size: 14px;
  width: 80px;
  text-align: right;
  margin-right: 12px;
  white-space: nowrap;
}

.team-name-section {
  display: flex;
  align-items: center;
  height: 32px;
  margin-top: 12px;
}

.team-name-input {
  width: 100%;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  height: 36px;
  width: 500px;
  transition: border-color 0.2s;
  background-color: #f1f5f8;
  box-sizing: border-box;
}

.team-name-input:focus {
  outline: none;
  border-color: #1492d1;
  background-color: #fff;
}

.team-name-input::placeholder {
  color: #a6adb6;
}

.team-avatar-section {
  display: flex;
  align-items: center;
  height: 32px;
  margin-top: 12px;
}

.avatar-selector {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.avatar-option {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
}

.avatar-option:hover {
  border-color: #1492d1;
  transform: scale(1.05);
}

.avatar-option.selected {
  border-color: #1492d1;
  box-shadow: 0 0 0 2px rgba(20, 146, 209, 0.2);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

/* 主要内容区域：左右分栏 */
.main-content {
  display: flex;
  gap: 20px;
  flex: 1;
  min-height: 300px;
  padding: 0 20px;
}

/* 左侧面板 */
.left-panel {
  flex: 1;
  min-width: 0;
}

.friends-section {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  background-color: #fff;
  z-index: 10;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.person-select-container {
  flex: 1;
  overflow-y: auto;
  max-height: calc(100% - 60px);
}

.selected-count {
  font-size: 12px;
  color: #666;
  background-color: #f0f0f0;
  padding: 2px 8px;
  border-radius: 8px;
  white-space: nowrap;
}

/* 右侧面板 */
.right-panel {
  flex: 1;
  border-left: 1px solid #f0f0f0;
  padding-left: 20px;
}

.selected-friends-section {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.selected-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.selected-count-badge {
  background-color: #1492d1;
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.selected-friends-container {
  flex: 1;
  overflow-y: auto;
}

.empty-selected {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
}

.selected-friends-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selected-friend-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s;
  position: relative;
}

.selected-friend-item:hover {
  background-color: #e9ecef;
}

.selected-avatar {
  margin-right: 12px;
  flex-shrink: 0;
}

.selected-friend-info {
  flex: 1;
  min-width: 0;
}

.selected-friend-name {
  font-size: 14px;
  color: #333;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-btn {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #ff4757;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.2s;
  flex-shrink: 0;
}

.remove-btn:hover {
  background-color: #ff3742;
  transform: scale(1.1);
}
</style>
