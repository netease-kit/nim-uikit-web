<template>
  <div class="team-info-form" v-if="team">
    <!-- 表单内容 -->
    <div class="form-content">
      <!-- 群头像 -->
      <div class="form-item team-avatar">
        <div class="form-label">{{ t("teamAvatar") }}</div>
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
                  <img :src="avatar" alt="群头像" class="avatar-img" />
                </div>
              </div>
            </div>
          </template>
        </Popover>
      </div>

      <!-- 群ID -->
      <div class="form-item">
        <div class="form-label">{{ t("teamIdText") }}</div>
        <input
          type="text"
          class="form-input readonly"
          :value="team.teamId"
          readonly
        />
      </div>

      <!-- 群名称 -->
      <div class="form-item">
        <div class="form-label">{{ t("teamTitle") }}</div>
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
      <div class="form-item last-item">
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

<script lang="ts" setup>
/** 群设置组件 */
import { ref, onUnmounted, getCurrentInstance, onMounted, computed } from "vue";
import { autorun } from "mobx";
import { t } from "../../../utils/i18n";
import type {
  V2NIMTeam,
  V2NIMTeamMember,
} from "nim-web-sdk-ng/dist/esm/nim/src/V2NIMTeamService";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import type {
  V2NIMConversationForUI,
  V2NIMLocalConversationForUI,
} from "@xkit-yx/im-store-v2/dist/types/types";
import Input from "../../../CommonComponents/Input.vue";
import RootStore from "@xkit-yx/im-store-v2";
import { toast } from "../../../utils/toast";
import Popover from "../../../CommonComponents/Popover.vue";
import Avatar from "../../../CommonComponents/Avatar.vue";

interface Props {
  teamId: string;
}

const { proxy } = getCurrentInstance()!;
const store = proxy?.$UIKitStore as RootStore;
const nim = proxy?.$NIM;

const props = defineProps<Props>();

const emit = defineEmits(["onChangeSubPath"]);

// 群名称
const teamName = ref("");
// 群介绍
const teamIntro = ref("");
// 群
const team = ref<V2NIMTeam>();
// 当前会话
const conversation = ref<
  V2NIMConversationForUI | V2NIMLocalConversationForUI
>();

/**是否是云端会话 */
const enableV2CloudConversation = store?.sdkOptions?.enableV2CloudConversation;
const myInfoInTeam = ref<V2NIMTeamMember>();

// 权限检查计算属性
const canEditTeamInfo = computed(() => {
  if (!myInfoInTeam.value) return false;
  const memberRole = myInfoInTeam.value.memberRole;
  // 只有群主和管理员可以编辑群信息
  return (
    memberRole ===
      V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_OWNER ||
    memberRole === V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER
  );
});

// 群头像选项
const teamAvatarOptions = [
  "https://yx-web-nosdn.netease.im/common/2425b4cc058e5788867d63c322feb7ac/groupAvatar1.png",
  "https://yx-web-nosdn.netease.im/common/62c45692c9771ab388d43fea1c9d2758/groupAvatar2.png",
  "https://yx-web-nosdn.netease.im/common/d1ed3c21d3f87a41568d17197760e663/groupAvatar3.png",
  "https://yx-web-nosdn.netease.im/common/e677d8551deb96723af2b40b821c766a/groupAvatar4.png",
  "https://yx-web-nosdn.netease.im/common/fd6c75bb6abca9c810d1292e66d5d87e/groupAvatar5.png",
];

// 选中的头像
const selectedAvatar = ref();

// 选中头像
const selectAvatar = (value: string) => {
  selectedAvatar.value = value;
};

// 保存群名称/介绍
const handleSave = () => {
  if (!teamName.value) {
    toast.info(t("teamTitleConfirmText"));
    return;
  }

  // 检查是否有变更
  const originalName = team.value?.name || "";
  const originalIntro = team.value?.intro || "";
  const originalAvatar = team.value?.avatar || "";
  const hasNameChanged = teamName.value !== originalName;
  const hasIntroChanged = teamIntro.value !== originalIntro;
  const hasAvatarChanged = selectedAvatar.value !== originalAvatar;

  // 如果没有任何变更，直接返回
  if (!hasNameChanged && !hasIntroChanged && !hasAvatarChanged) {
    return;
  }

  // 构建更新信息，只包含变更的字段
  const updateInfo: {
    name?: string;
    intro?: string;
    avatar?: string;
  } = {};
  if (hasNameChanged) {
    updateInfo.name = teamName.value;
  }
  if (hasIntroChanged) {
    updateInfo.intro = teamIntro.value;
  }
  if (hasAvatarChanged) {
    updateInfo.avatar = selectedAvatar.value;
  }

  store.teamStore
    .updateTeamActive({
      teamId: props.teamId,
      info: updateInfo,
    })
    .then(() => {
      toast.info(t("updateTeamSuccessText"));
    })
    .catch((err: any) => {
      switch (err?.code) {
        case 109432:
          toast.info(t("noPermission"));
          break;
        default:
          toast.info(t("updateTeamFailedText"));
          break;
      }
    });
};

let teamWatch = () => {};
let teamMembersWatch = () => {};
let conversationWatch = () => {};

onMounted(() => {
  const conversationId = nim.V2NIMConversationIdUtil.teamConversationId(
    props.teamId
  );
  teamWatch = autorun(() => {
    if (props.teamId) {
      team.value = store.teamStore.teams.get(props.teamId);
      // 初始化表单数据
      if (team.value) {
        teamName.value = team.value.name || "";
        teamIntro.value = team.value.intro || "";
        selectedAvatar.value = team.value.avatar || "";
      }
    }
    teamMembersWatch = autorun(() => {
      myInfoInTeam.value = store?.teamMemberStore.getTeamMember(props.teamId, [
        store?.userStore.myUserInfo.accountId,
      ])?.[0];
    });
  });

  conversationWatch = autorun(() => {
    conversation.value = enableV2CloudConversation
      ? store.conversationStore?.conversations.get(conversationId)
      : store.localConversationStore?.conversations.get(conversationId);
  });
});

onUnmounted(() => {
  teamWatch();
  conversationWatch();
  teamMembersWatch();
});
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
