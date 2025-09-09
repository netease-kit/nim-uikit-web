<template>
  <Modal
    :visible="visible"
    :title="''"
    :showDefaultFooter="true"
    :confirmText="t('saveText')"
    :cancelText="t('cancelText')"
    :width="400"
    :showMask="true"
    :showClose="false"
    :top="80"
    :maskOpacity="0.3"
    :bodyStyle="{ padding: 0 }"
    @confirm="handleSave"
    @cancel="handleCancel"
    @close="handleClose"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="wrapper">
      <!-- 头部背景和头像 -->
      <div class="header-section">
        <div class="background-image"></div>
      </div>

      <!-- 用户信息 -->
      <div class="user-info">
        <!-- 头像和用户名 -->
        <div class="user-header" @click="triggerFileInput">
          <div class="avatar-container">
            <Avatar
              v-if="!tempAvatarUrl"
              :avatar="myUserInfo && myUserInfo.avatar"
              :account="myUserInfo?.accountId || ''"
              size="60"
            />
            <img
              v-else
              :src="tempAvatarUrl"
              class="temp-avatar"
              alt="临时头像"
            />
          </div>
          <div class="username">
            {{ myUserInfo?.name || myUserInfo?.accountId }}
          </div>
          <input
            type="file"
            ref="fileInput"
            style="display: none"
            accept="image/*"
            @change="onChangeAvatar"
          />
        </div>
      </div>

      <div class="userInfo-item-wrapper">
        <div class="userInfo-item">
          <div class="item-left">{{ t("name") }}</div>
          <div class="item-right">
            <Input
              v-model="editableUserInfo.name"
              :placeholder="t('nickPlaceholderText')"
              :inputStyle="{ background: '#f1f5f8', padding: '10px' }"
              :maxlength="15"
            />
          </div>
        </div>
        <div class="userInfo-item">
          <div class="item-left">{{ t("accountText") }}</div>
          <div class="item-right">
            <Input
              v-model="editableUserInfo.accountId"
              :placeholder="t('accountText')"
              :disabled="true"
              :inputStyle="{ background: '#f1f5f8', padding: '10px' }"
            />
          </div>
        </div>
        <div class="userInfo-item">
          <div class="item-left">{{ t("genderText") }}</div>
          <div class="item-right">
            <select v-model="editableUserInfo.gender" class="edit-select">
              <option :value="0">{{ t("unknow") }}</option>
              <option :value="1">{{ t("man") }}</option>
              <option :value="2">{{ t("woman") }}</option>
            </select>
          </div>
        </div>

        <div class="userInfo-item">
          <div class="item-left">{{ t("mobile") }}</div>
          <div class="item-right">
            <Input
              v-model="editableUserInfo.mobile"
              :placeholder="t('mobilePlaceholderText')"
              :inputStyle="{ background: '#f1f5f8', padding: '10px' }"
              :maxlength="11"
              type="tel"
            />
          </div>
        </div>
        <div class="userInfo-item">
          <div class="item-left">{{ t("email") }}</div>
          <div class="item-right">
            <Input
              v-model="editableUserInfo.email"
              type="email"
              :placeholder="t('emailPlaceholderText')"
              :inputStyle="{ background: '#f1f5f8', padding: '10px' }"
              :maxlength="30"
            />
          </div>
        </div>
        <div class="userInfo-item">
          <div class="item-left">{{ t("sign") }}</div>
          <div class="item-right">
            <Input
              v-model="editableUserInfo.sign"
              :placeholder="t('signPlaceholderText')"
              :inputStyle="{ background: '#f1f5f8', padding: '10px' }"
              :maxlength="50"
            />
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import Avatar from "../CommonComponents/Avatar.vue";
import { onUnmounted, ref, getCurrentInstance, watch } from "vue";
import Modal from "../CommonComponents/Modal.vue";
import Input from "../CommonComponents/Input.vue";
import { t } from "../utils/i18n";
import { autorun } from "mobx";
import type { V2NIMUser } from "nim-web-sdk-ng/dist/esm/nim/src/V2NIMUserService";
import RootStore from "@xkit-yx/im-store-v2";
import { loading } from "../utils/loading";
import { showToast } from "../utils/toast";

interface Props {
  visible: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
});

const emit = defineEmits<{
  "update:visible": [value: boolean];
  save: [userInfo: any];
}>();

const myUserInfo = ref<V2NIMUser>();

const { proxy } = getCurrentInstance()!;

const store = proxy?.$UIKitStore as RootStore;

const editableUserInfo = ref({
  name: "",
  accountId: "",
  gender: 0,
  birthday: "",
  mobile: "",
  email: "",
  sign: "",
});

// 添加临时头像状态
const tempAvatarUrl = ref<string>("");
const tempAvatarFile = ref<File | null>(null);

const uninstallMyUserInfoWatch = autorun(() => {
  myUserInfo.value = store?.userStore.myUserInfo;
});

// 监听myUserInfo变化，初始化editableUserInfo
watch(
  myUserInfo,
  (newUserInfo) => {
    if (newUserInfo) {
      editableUserInfo.value = {
        name: newUserInfo.name || newUserInfo.accountId || "",
        accountId: newUserInfo.accountId || "",
        gender: newUserInfo.gender || 0,
        birthday: newUserInfo.birthday || "",
        mobile: newUserInfo.mobile || "",
        email: newUserInfo.email || "",
        sign: newUserInfo.sign || "",
      };
    }
  },
  { immediate: true }
);

const fileInput = ref<HTMLInputElement | null>(null);

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value?.click();
};

// 头像更改处理
const onChangeAvatar = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  // 检查文件类型
  if (!file.type.startsWith("image/")) {
    showToast({
      message: t("FailAvatarText"),
      type: "error",
    });
    return;
  }

  try {
    // 创建临时预览URL
    const reader = new FileReader();
    reader.onload = (e) => {
      tempAvatarUrl.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    // 保存文件引用，等待用户点击保存
    tempAvatarFile.value = file;
  } catch (error) {
    showToast({
      message: t("FailAvatarText"),
      type: "error",
    });
  } finally {
    // 清空 input 值，允许选择相同文件
    if (fileInput.value) {
      fileInput.value.value = "";
    }
  }
};

const handleSave = async () => {
  try {
    // 如果有临时头像文件，先上传头像
    if (tempAvatarFile.value) {
      await store?.userStore.updateSelfUserProfileActive(
        {
          ...myUserInfo.value,
        },
        tempAvatarFile.value
      );
    }

    // 更新其他用户信息
    await store.userStore.updateSelfUserProfileActive({
      ...editableUserInfo.value,
    });

    showToast({
      message: t("saveSuccessText"),
      type: "success",
      duration: 2000,
    });

    // 清理临时状态
    tempAvatarUrl.value = "";
    tempAvatarFile.value = null;

    emit("update:visible", false);
  } catch (error) {
    showToast({
      message: t("saveFailText"),
      type: "error",
      duration: 2000,
    });
  }
};

const handleCancel = () => {
  // 取消时清理临时头像状态
  tempAvatarUrl.value = "";
  tempAvatarFile.value = null;
  emit("update:visible", false);
};

const handleClose = () => {
  // 关闭时清理临时头像状态
  tempAvatarUrl.value = "";
  tempAvatarFile.value = null;
  emit("update:visible", false);
};

onUnmounted(() => {
  uninstallMyUserInfoWatch();
});
</script>

<style scoped>
/* 主容器 */
.wrapper {
  box-sizing: border-box;
  border-radius: 8px;
}

/* 头部区域 */
.header-section {
  position: relative;
  height: 90px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.background-image {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 用户信息区域 */
.user-info {
  padding: 20px 20px 0px 20px;
  position: relative;
}

/* 用户头部（头像+用户名） */
.user-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  gap: 15px;
  position: relative;
  z-index: 2;
  margin-top: -50px;
  padding-top: 10px;
  cursor: pointer;
}

.avatar-container {
  border: 3px solid #fff;
  border-radius: 50%;
  height: 66px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.temp-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
}
.username {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  flex: 1;
}

/* 用户信息项容器 */
.userInfo-item-wrapper {
  margin: 10px 15px;
  overflow: hidden;
  border-radius: 5px;
}

/* 用户信息项 */
.userInfo-item {
  display: flex;
  height: 50px;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  background-color: #fff;
}

/* 用户信息项左侧 */
.item-left {
  font-size: 16px;
  flex: 0 0 50px;
  color: #000;
}

/* 用户信息项右侧 */
.item-right {
  flex: 1;
  text-align: right;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: #a6adb6;
  overflow: hidden;
}

/* 邮箱文本 */
.email {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: right;
}

/* 昵称文本 */
.nick {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: #a6adb6;
}

/* 箭头图标 */
.arrow {
  margin-left: 15px;
  line-height: 0;
}

/* 分隔线 */
.box-shadow {
  height: 1px;
  background: none;
  box-shadow: 0 1px 0 rgb(233, 231, 231);
}

/* 签名容器 */
.signature {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  margin: 10px 15px;
  background-color: #fff;
  border-radius: 5px;
  box-sizing: border-box;
}

/* 签名标题 */
.signature-key {
  flex: 0 0 80px;
  color: #000;
  font-size: 16px;
}

/* 签名输入框容器 */
.signature-input {
  flex: 1;
  margin-left: 20px;
}

/* 签名文本 */
.signature-text {
  text-align: right;
  font-size: 15px;
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: #a6adb6;
}

/* 签名箭头 */
.signature .arrow {
  margin-left: 15px;
  flex: 0 0 10px;
  color: #a6adb6;
  font-size: 15px;
}

/* 输入框样式 */
.edit-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  background-color: #fff;
  outline: none;
  transition: border-color 0.3s;
}

.edit-input:focus {
  border-color: #337eff;
}

.edit-input[readonly] {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

/* 选择框样式 */
.edit-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  background-color: #fff;
  outline: none;
  cursor: pointer;
  transition: border-color 0.3s;
}
</style>
