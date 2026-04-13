<template>
  <Modal
    :visible="visible"
    :title="''"
    :show-default-footer="false"
    :width="350"
    :showClose="false"
    :top="80"
    :maskOpacity="0"
    :bodyStyle="{ padding: 0 }"
    @close="handleClose"
  >
    <div v-if="bot" class="bot-card">
      <!-- 顶部渐变 banner -->
      <div class="header-section"></div>

      <!-- 头像 + 名称 -->
      <div class="user-info">
        <div class="user-header">
          <div class="avatar-wrapper" @click="handleAvatarClick">
            <Avatar
              size="84"
              fontSize="18"
              :account="bot.accid"
              :avatar="avatarPreview || bot.icon"
              :nick="bot.name"
            />
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleFileChange"
            />
          </div>
          <div class="username-wrapper">
            <input
              ref="nameInputRef"
              v-model="editName"
              class="bot-name-input"
              :class="{ editing: isEditingName }"
              :readonly="!isEditingName"
              :maxlength="ROBOT_NAME_MAX_LENGTH"
              @click="startEditName"
              @input="handleNameInput"
              @blur="stopEditName"
              @keydown.enter="stopEditName"
            />
          </div>
        </div>

        <!-- 详情信息 -->
        <div class="user-details">
          <div class="detail-item">
            <span class="label">{{ t("robotAccountIdText") }}</span>
            <span class="value">{{ bot.accid }}</span>
          </div>
        </div>
      </div>

      <!-- 操作列表 -->
      <div class="bot-actions">
        <div class="action-item" @click="handleSendMessage">
          <span>{{ t("sendMessageText") }}</span>
          <Icon type="icon-jiantou" :size="14" color="#999" />
        </div>
        <div class="action-item" @click="handleViewConfig">
          <span>{{ t("viewRobotConfigText") }}</span>
          <Icon type="icon-jiantou" :size="14" color="#999" />
        </div>
        <div class="action-item" @click="handleRefreshToken">
          <span>{{ t("refreshRobotTokenText") }}</span>
          <Icon type="icon-jiantou" :size="14" color="#999" />
        </div>
        <div class="action-item danger" @click="handleDelete">
          <span>{{ t("deleteRobotText") }}</span>
          <Icon type="icon-jiantou" :size="14" color="#ff4d4f" />
        </div>
      </div>

      <!-- 保存/取消按钮 -->
      <div class="actions">
        <button class="action-btn default" @click="handleCancel">
          {{ t("cancelText") }}
        </button>
        <button
          class="action-btn primary"
          :disabled="saveLoading"
          @click="handleSave"
        >
          {{ saveLoading ? "..." : t("saveText") }}
        </button>
      </div>
    </div>

    <!-- 配置串弹窗 -->
    <Modal
      v-if="showConfigModal"
      :visible="showConfigModal"
      :title="t('robotConfigText')"
      :show-default-footer="false"
      :width="400"
      @close="showConfigModal = false"
    >
      <div class="config-content">
        <div class="config-item">
          <div class="config-value">{{ displayConfigText }}</div>
        </div>
        <div class="config-tip">{{ t("robotConfigWarningText") }}</div>
        <div class="config-actions">
          <Button type="primary" @click="handleCopyFullConfig">
            {{ t("copyFullConfigText") }}
          </Button>
        </div>
      </div>
    </Modal>

    <!-- 删除确认弹窗 -->
    <Modal
      v-if="showDeleteConfirm"
      :visible="showDeleteConfirm"
      :title="t('deleteRobotText')"
      :confirmText="t('deleteText')"
      :cancelText="t('cancelText')"
      :confirm-disabled="deleteLoading"
      @confirm="handleConfirmDelete"
      @cancel="showDeleteConfirm = false"
      @close="showDeleteConfirm = false"
    >
      <div class="delete-confirm-content">
        <p>{{ t("deleteRobotConfirmText") }}</p>
      </div>
    </Modal>

    <Modal
      v-if="showRefreshTokenConfirm"
      :visible="showRefreshTokenConfirm"
      :title="t('refreshRobotTokenText')"
      :confirmText="t('confirmText')"
      :cancelText="t('cancelText')"
      @confirm="handleConfirmRefreshToken"
      @cancel="showRefreshTokenConfirm = false"
      @close="showRefreshTokenConfirm = false"
    >
      <div class="delete-confirm-content">
        <p>{{ t("refreshTokenConfirmText") }}</p>
      </div>
    </Modal>
  </Modal>
</template>

<script lang="ts" setup>
import { computed, ref, watch, nextTick } from "vue";
import Modal from "../../CommonComponents/Modal.vue";
import Avatar from "../../CommonComponents/Avatar.vue";
import Button from "../../CommonComponents/Button.vue";
import Icon from "../../CommonComponents/Icon.vue";
import { t } from "../../utils/i18n";
import { nim, store } from "../../utils/init";
import { showToast, toast } from "../../utils/toast";
import type { V2NIMUserAIBot } from "nim-web-sdk-ng/dist/esm/nim/src/V2NIMAIService";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import type { V2NIMConversationType } from "nim-web-sdk-ng/dist/esm/nim/src/V2NIMConversationService";

interface Props {
  visible: boolean;
  bot: V2NIMUserAIBot | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  delete: [];
  updated: [];
  afterSendMsgClick: [];
}>();

// 状态
const showConfigModal = ref(false);
const showDeleteConfirm = ref(false);
const showRefreshTokenConfirm = ref(false);
const ROBOT_NAME_MAX_LENGTH = 15;
// token 保留完整值，用于弹窗展示和复制
const tokenInfo = ref("");
const deleteLoading = ref(false);
const saveLoading = ref(false);

// 编辑态
const isEditingName = ref(false);
const editName = ref("");
const nameInputRef = ref<HTMLInputElement>();

// 头像
const fileInputRef = ref<HTMLInputElement>();
const avatarPreview = ref("");
const selectedFile = ref<File | null>(null);
const uploadingAvatar = ref(false);
const configAppkey = computed(() => nim?.options?.appkey || "");
const fullConfigText = computed(() =>
  [configAppkey.value, props.bot?.accid || "", tokenInfo.value].join("|"),
);
const displayConfigText = computed(() => {
  const text = fullConfigText.value;
  if (!text) return "";
  const visibleLength = Math.ceil(text.length / 3);
  return visibleLength >= text.length
    ? text
    : `${text.slice(0, visibleLength)}...`;
});

watch(
  () => props.bot,
  (bot) => {
    editName.value = bot?.name || "";
    avatarPreview.value = "";
    selectedFile.value = null;
  },
  { immediate: true },
);

const startEditName = async () => {
  if (isEditingName.value) return;
  isEditingName.value = true;
  await nextTick();
  nameInputRef.value?.focus();
  nameInputRef.value?.select();
};

const stopEditName = () => {
  isEditingName.value = false;
};

const handleAvatarClick = () => {
  fileInputRef.value?.click();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    showToast(t("selectImageText"));
    return;
  }
  selectedFile.value = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    avatarPreview.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
  target.value = "";
};

const uploadAvatar = async (fileObj: File): Promise<string> => {
  uploadingAvatar.value = true;
  try {
    const task = nim?.V2NIMStorageService?.createUploadFileTask({ fileObj });
    const url = await nim?.V2NIMStorageService?.uploadFile(task, () => {});
    return url || "";
  } catch (error) {
    console.error("上传头像失败:", error);
    throw error;
  } finally {
    uploadingAvatar.value = false;
  }
};

const handleNameInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.value.length > ROBOT_NAME_MAX_LENGTH) {
    target.value = target.value.slice(0, ROBOT_NAME_MAX_LENGTH);
  }
  editName.value = target.value;
};

const handleSave = async () => {
  if (!props.bot) return;
  const name = editName.value.trim();
  if (!name) {
    showToast(t("robotNameRequiredText"));
    return;
  }
  saveLoading.value = true;
  try {
    let iconUrl = props.bot.icon;
    if (selectedFile.value) {
      iconUrl = await uploadAvatar(selectedFile.value);
    }
    await store.aiUserStore?.updateUserAIBotActive({
      accid: props.bot.accid,
      name,
      icon: iconUrl,
    });
    toast.success(t("saveRobotSuccessText"));
    emit("updated");
  } catch (error) {
    console.error("保存机器人失败:", error);
    toast.error(t("saveRobotFailedText"));
  } finally {
    saveLoading.value = false;
  }
};

const handleCancel = () => {
  editName.value = props.bot?.name || "";
  avatarPreview.value = "";
  selectedFile.value = null;
  emit("close");
};

const handleSendMessage = async () => {
  if (!props.bot) return;
  const account = props.bot.accid;
  if (store?.sdkOptions?.enableV2CloudConversation) {
    await store.conversationStore?.insertConversationActive(
      V2NIMConst.V2NIMConversationType
        .V2NIM_CONVERSATION_TYPE_P2P as V2NIMConversationType,
      account,
      true,
    );
  } else {
    await store?.localConversationStore?.insertConversationActive(
      V2NIMConst.V2NIMConversationType
        .V2NIM_CONVERSATION_TYPE_P2P as V2NIMConversationType,
      account,
      true,
    );
  }
  emit("afterSendMsgClick");
};

const handleViewConfig = async () => {
  if (!props.bot) return;
  try {
    // 查看配置串时直接读取当前 bot 配置，不触发 token 刷新
    const result = await store.aiUserStore?.getUserAIBotActive({
      accid: props.bot.accid,
    });
    showConfigModal.value = true;
    tokenInfo.value = result?.token || "";
  } catch (error) {
    console.error("获取配置失败:", error);
    tokenInfo.value = "";
    showToast(t("viewConfigFailedText"));
  }
};

const handleCopyFullConfig = async () => {
  try {
    await navigator.clipboard.writeText(fullConfigText.value);
    toast.success(t("copySuccessText"));
  } catch (error) {
    console.error("复制失败:", error);
  }
};

const handleRefreshToken = async () => {
  showRefreshTokenConfirm.value = true;
};

const handleConfirmRefreshToken = async () => {
  if (!props.bot) return;
  showRefreshTokenConfirm.value = false;
  try {
    // 单独刷新 token 时只更新内存态并提示成功，不自动打开配置串弹窗
    const result = await store.aiUserStore?.refreshUserAIBotTokenActive({
      accid: props.bot.accid,
    });
    tokenInfo.value = result?.token || "";
    toast.success(t("refreshTokenSuccessText"));
  } catch (error) {
    console.error("刷新Token失败:", error);
    showToast(t("refreshTokenFailedText"));
  }
};

const handleDelete = () => {
  showDeleteConfirm.value = true;
};

const handleConfirmDelete = async () => {
  if (!props.bot) return;
  deleteLoading.value = true;
  try {
    await store.aiUserStore?.deleteUserAIBotActive({ accid: props.bot.accid });
    toast.success(t("deleteRobotSuccessText"));
    showDeleteConfirm.value = false;
    emit("delete");
  } catch (error) {
    console.error("删除机器人失败:", error);
    showToast(t("deleteRobotFailedText"));
  } finally {
    deleteLoading.value = false;
  }
};

const handleClose = () => {
  emit("close");
};
</script>

<style scoped>
.bot-card {
  position: relative;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
}

/* 顶部渐变 banner */
.header-section {
  height: 90px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 用户信息区域 */
.user-info {
  padding: 0 20px 10px;
  position: relative;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: -40px;
  margin-bottom: 10px;
  position: relative;
  z-index: 2;
}

/* 头像 */
.avatar-wrapper {
  position: relative;
  width: 84px;
  height: 84px;
  flex-shrink: 0;
  cursor: pointer;
  border-radius: 50%;
  border: 3px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: #fff;
  overflow: hidden;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  color: #fff;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

/* 名称输入框 */
.username-wrapper {
  flex: 1;
  padding-top: 54px;
}

.bot-name-input {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  background: #f1f5f8;
  border: none;
  outline: none;
  padding: 4px 8px;
  width: 100%;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.bot-name-input.editing {
  cursor: text;
}

/* 详情信息 */
.user-details {
  margin-top: 4px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.value {
  font-size: 14px;
  color: #333;
  text-align: right;
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: monospace;
}

/* 操作列表 */
.bot-actions {
  padding: 4px 20px;
}

.action-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 0;
  cursor: pointer;
  border-radius: 6px;
  transition: color 0.2s ease;
  font-size: 14px;
  color: #333;
}

.action-item:hover {
  color: #537ff4;
}

.action-item.danger {
  color: #ff4d4f;
}

.action-item.danger:hover {
  color: #ff2d2f;
}

/* 底部按钮 */
.actions {
  padding: 10px 20px 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 10px;
}

.action-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-btn.primary {
  background-color: #537ff4;
  color: #fff;
}

.action-btn.primary:hover:not(:disabled) {
  background-color: #3d6de0;
}

.action-btn.default {
  background-color: #f0f0f0;
  color: #333;
}

.action-btn.default:hover {
  background-color: #e3e3e3;
}

/* 配置弹窗 */
.config-content {
  padding: 20px 0;
}

.config-item {
  margin-bottom: 20px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.config-actions {
  display: flex;
  justify-content: center;
}

.config-value {
  font-size: 14px;
  color: #333;
  font-family: monospace;
  word-break: break-all;
  margin-bottom: 12px;
  padding: 8px;
  background-color: #fff;
  border-radius: 4px;
}

.config-tip {
  margin-bottom: 16px;
  font-size: 12px;
  line-height: 1.5;
  color: #faad14;
}

/* 删除确认弹窗 */
.delete-confirm-content {
  padding: 20px 0;
}

.delete-confirm-content p {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
}
</style>
