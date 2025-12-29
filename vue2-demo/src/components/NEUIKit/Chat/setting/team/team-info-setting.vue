<template>
  <div class="team-info-form" v-if="team">
    <!-- 表单内容 -->
    <div class="form-content">
      <!-- 群头像 -->
      <div class="form-item team-avatar">
        <div class="form-label">
          {{ isDiscussion ? t("discussionAvatarText") : t("teamAvatar") }}
        </div>
        <Popover trigger="click" width="300px" placement="bottom">
          <div class="avatar-container">
            <Avatar
              :account="team && team.teamId"
              :avatar="selectedAvatar"
              size="36"
            />
          </div>
          <template #content>
            <div class="team-avatar-section">
              <div class="avatar-selector">
                <div
                  class="avatar-option"
                  v-for="(avatar, index) in teamAvatarOptions"
                  :key="index"
                  @click="selectAvatar(avatar)"
                >
                  <img :src="avatar" class="avatar-img" />
                </div>
              </div>
            </div>
          </template>
        </Popover>
      </div>

      <!-- 群ID -->
      <div class="form-item">
        <div class="form-label">
          {{ isDiscussion ? t("discussionIdText") : t("teamIdText") }}
        </div>
        <input
          type="text"
          class="form-input readonly"
          :value="team.teamId"
          readonly
        />
      </div>

      <!-- 群名称 -->
      <div class="form-item">
        <div class="form-label">
          {{ isDiscussion ? t("discussionTitle") : t("teamTitle") }}
        </div>
        <div
          class="input-container"
          :class="{ 'input-container-disabled': !canEditTeamInfo }"
        >
          <Input
            type="text"
            class="form-input"
            v-model="teamName"
            :maxlength="30"
            :disabled="!canEditTeamInfo"
            :input-wrapper-style="{
              backgroundColor: '#fff',
            }"
          />
          <span class="char-count">{{ teamName.length }} / 30</span>
        </div>
      </div>

      <!-- 群介绍 -->
      <div v-if="!isDiscussion" class="form-item last-item">
        <div class="form-label">{{ t("teamIntro") }}</div>
        <div class="textarea-container">
          <textarea
            class="form-textarea"
            v-model="teamIntro"
            :placeholder="t('placeHolderText')"
            :maxlength="100"
            :disabled="!canEditTeamInfo"
          ></textarea>
          <span class="char-count">{{ teamIntro.length }} / 100</span>
        </div>
      </div>

      <!-- 保存按钮 -->
      <div class="form-actions" v-if="canEditTeamInfo">
        <button class="save-btn" @click="handleSave">
          {{ t("saveText") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { t } from "../../../utils/i18n";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import Input from "../../../CommonComponents/Input.vue";
import { toast } from "../../../utils/toast";
import Popover from "../../../CommonComponents/Popover.vue";
import Avatar from "../../../CommonComponents/Avatar.vue";
import { uiKitStore } from "../../../utils/init";

export default {
  name: "TeamInfoSetting",
  components: { Input, Popover, Avatar },
  props: {
    teamId: { type: String, required: true },
    isTeamOwner: { type: Boolean, default: false },
    isTeamManager: { type: Boolean, default: false },
    team: { type: Object, default: null },
    teamMembers: { type: Array, default: () => [] },
    isDiscussion: { type: Boolean, default: false },
  },
  data() {
    return {
      teamName: "",
      teamIntro: "",
      selectedAvatar: "",
      teamAvatarOptions: [
        "https://yx-web-nosdn.netease.im/common/2425b4cc058e5788867d63c322feb7ac/groupAvatar1.png",
        "https://yx-web-nosdn.netease.im/common/62c45692c9771ab388d43fea1c9d2758/groupAvatar2.png",
        "https://yx-web-nosdn.netease.im/common/d1ed3c21d3f87a41568d17197760e663/groupAvatar3.png",
        "https://yx-web-nosdn.netease.im/common/e677d8551deb96723af2b40b821c766a/groupAvatar4.png",
        "https://yx-web-nosdn.netease.im/common/fd6c75bb6abca9c810d1292e66d5d87e/groupAvatar5.png",
      ],
    };
  },
  computed: {
    store() {
      return uiKitStore;
    },
    canEditTeamInfo() {
      if (this.isDiscussion) {
        return true;
      }
      if (this.isTeamOwner) {
        return true;
      }
      if (
        (this.team && this.team.updateInfoMode) ===
          V2NIMConst.V2NIMTeamUpdateInfoMode.V2NIM_TEAM_UPDATE_INFO_MODE_MANAGER &&
        this.isTeamManager
      ) {
        return true;
      }
      return (
        (this.team && this.team.updateInfoMode) ===
        V2NIMConst.V2NIMTeamUpdateInfoMode.V2NIM_TEAM_UPDATE_INFO_MODE_ALL
      );
    },
  },
  mounted() {
    this.teamName = (this.team && this.team.name) || "";
    this.teamIntro = (this.team && this.team.intro) || "";
    this.selectedAvatar = (this.team && this.team.avatar) || "";
  },
  methods: {
    t,
    selectAvatar(value) {
      this.selectedAvatar = value;
    },
    handleSave() {
      if (!this.teamName) {
        toast.info(t("teamTitleConfirmText"));
        return;
      }

      const originalName = (this.team && this.team.name) || "";
      const originalIntro = (this.team && this.team.intro) || "";
      const originalAvatar = (this.team && this.team.avatar) || "";

      const hasNameChanged = this.teamName !== originalName;
      const hasIntroChanged = this.teamIntro !== originalIntro;
      const hasAvatarChanged = this.selectedAvatar !== originalAvatar;

      if (!hasNameChanged && !hasIntroChanged && !hasAvatarChanged) {
        return;
      }

      const updateInfo = {};
      if (hasNameChanged) {
        updateInfo.name = this.teamName;
      }
      if (hasIntroChanged) {
        updateInfo.intro = this.teamIntro;
      }
      if (hasAvatarChanged) {
        updateInfo.avatar = this.selectedAvatar;
      }

      this.store.teamStore
        .updateTeamActive({
          teamId: this.teamId,
          info: updateInfo,
        })
        .then(() => {
          toast.success(t("updateTeamSuccessText"));
        })
        .catch((err) => {
          switch (err && err.code) {
            case 109432:
              toast.info(t("noPermission"));
              break;
            default:
              toast.info(t("updateTeamFailedText"));
              break;
          }
        });
    },
  },
};
</script>

<style scoped>
.team-info-form {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #fff;
  border-bottom: 1px solid #e5e5e5;
}

.header-title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.back-icon,
.close-icon {
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.form-content {
  flex: 1;
  padding: 20px 16px;
  overflow-y: auto;
}

.form-content .team-avatar {
  margin-top: 0px;
}

.form-item {
  margin: 20px 0;
  border-bottom: 1px solid #e4e9f2;
  padding-bottom: 14px;
}

.form-item.last-item {
  border-bottom: none;
  margin-bottom: 0;
}

.form-label {
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
  font-weight: bolder;
}

.avatar-container {
  overflow: hidden;
  cursor: pointer;
}

.form-input {
  width: 100%;
  height: 32px;
  padding: 0 60px 0 12px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #1890ff;
}

.form-input.readonly {
  background-color: #f5f5f5;
  color: #999;
  height: 32px;
}

.form-input:disabled {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
  border-color: #d9d9d9;
}

.input-container {
  position: relative;
}

.input-container-disabled {
  background-color: #f5f5f5;
}

.char-count {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #999;
}

.textarea-container {
  position: relative;
}

.form-textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  background-color: #fff;
  resize: vertical;
  box-sizing: border-box;
  font-family: inherit;
}

.form-textarea:focus {
  outline: none;
  border-color: #1890ff;
}

.form-textarea::placeholder {
  color: #ccc;
}

.form-textarea:disabled {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
  border-color: #d9d9d9;
}

.form-textarea:disabled::placeholder {
  color: #bbb;
}

.textarea-container .char-count {
  position: absolute;
  right: 12px;
  bottom: 12px;
  top: auto;
  transform: none;
}

.form-actions {
  margin-top: 0px;
  text-align: center;
}

.save-btn {
  width: 120px;
  height: 40px;
  background-color: #1890ff;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.save-btn:hover {
  background-color: #40a9ff;
}

.save-btn:active {
  background-color: #096dd9;
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

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
</style>
