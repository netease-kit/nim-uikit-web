<template>
  <Modal
    :visible="visible"
    :title="''"
    :showDefaultFooter="true"
    :confirmText="t('saveText')"
    :cancelText="t('cancelText')"
    :width="400"
    :showMask="false"
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
              :account="(myUserInfo && myUserInfo.accountId) || ''"
              size="66"
              :fontSize="14"
            />
            <img
              v-else
              :src="tempAvatarUrl"
              class="temp-avatar"
              alt="临时头像"
            />
          </div>
          <div class="username">
            {{
              (myUserInfo && (myUserInfo.name || myUserInfo.accountId)) || ""
            }}
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
            <Dropdown
              trigger="click"
              :dropdownStyle="{ width: '300px', zIndex: 10000 }"
            >
              <div class="edit-select gender-select-trigger">
                <span class="gender-select-text">{{ genderLabel }}</span>
              </div>
              <template #overlay>
                <div class="gender-dropdown-menu">
                  <div
                    v-for="opt in genderOptions"
                    :key="opt.value"
                    class="gender-dropdown-item"
                    @click="setGender(opt.value)"
                  >
                    {{ opt.label }}
                  </div>
                </div>
              </template>
            </Dropdown>
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
              @input="handleMobileInput"
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

<script>
import Avatar from "../CommonComponents/Avatar.vue";
import Modal from "../CommonComponents/Modal.vue";
import Input from "../CommonComponents/Input.vue";
import Dropdown from "../CommonComponents/Dropdown.vue";
import { t as i18nT } from "../utils/i18n";
import { autorun } from "../utils/store";
import { uiKitStore } from "../utils/init";
import { showToast } from "../utils/toast";

export default {
  name: "MyUserCard",
  components: { Avatar, Modal, Input, Dropdown },
  props: {
    visible: { type: Boolean, default: false },
  },
  data() {
    return {
      myUserInfo: undefined,
      editableUserInfo: {
        name: "",
        accountId: "",
        gender: 0,
        birthday: "",
        mobile: "",
        email: "",
        sign: "",
      },
      tempAvatarUrl: "",
      tempAvatarFile: null,
      uninstallMyUserInfoWatch: null,
    };
  },
  computed: {
    genderOptions() {
      return [
        { value: 0, label: this.t("unknow") },
        { value: 1, label: this.t("man") },
        { value: 2, label: this.t("woman") },
      ];
    },
    genderLabel() {
      const v = Number(this.editableUserInfo.gender);
      const opt = (this.genderOptions || []).find((o) => o.value === v);
      return opt ? opt.label : "";
    },
  },
  watch: {
    myUserInfo: {
      handler(newUserInfo) {
        if (newUserInfo) {
          this.editableUserInfo = {
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
      immediate: true,
    },
  },
  methods: {
    t(key) {
      return i18nT(key);
    },
    setGender(value) {
      this.editableUserInfo.gender = value;
    },
    triggerFileInput() {
      const input = this.$refs.fileInput;
      if (input && input.click) input.click();
    },
    handleMobileInput(payload) {
      const value =
        typeof payload === "string"
          ? payload
          : (payload && payload.target && payload.target.value) || "";
      const numericValue = value.replace(/[^0-9]/g, "");
      this.editableUserInfo.mobile = numericValue;
      if (payload && payload.target) {
        payload.target.value = numericValue;
      }
    },
    async onChangeAvatar(event) {
      const target = event.target;
      const file = target && target.files && target.files[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        showToast({ message: this.t("FailAvatarText"), type: "error" });
        return;
      }
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.tempAvatarUrl =
            e.target && e.target.result ? e.target.result : "";
        };
        reader.readAsDataURL(file);
        this.tempAvatarFile = file;
      } catch (error) {
        showToast({ message: this.t("FailAvatarText"), type: "error" });
      } finally {
        if (this.$refs.fileInput) {
          this.$refs.fileInput.value = "";
        }
      }
    },
    async handleSave() {
      try {
        const store = uiKitStore;
        const profile = {
          ...(this.myUserInfo || {}),
          ...(this.editableUserInfo || {}),
        };
        delete profile.accountId;

        await (store &&
          store.userStore &&
          store.userStore.updateSelfUserProfileActive(
            profile,
            this.tempAvatarFile || undefined
          ));
        showToast({
          message: this.t("saveSuccessText"),
          type: "success",
          duration: 2000,
        });
        this.tempAvatarUrl = "";
        this.tempAvatarFile = null;
        this.$emit("update:visible", false);
      } catch (error) {
        showToast({
          message: this.t("saveFailText"),
          type: "error",
          duration: 2000,
        });
      }
    },
    handleCancel() {
      this.tempAvatarUrl = "";
      this.tempAvatarFile = null;
      this.$emit("update:visible", false);
    },
    handleClose() {
      this.tempAvatarUrl = "";
      this.tempAvatarFile = null;
      this.$emit("update:visible", false);
    },
  },
  mounted() {
    const store = uiKitStore;
    this.uninstallMyUserInfoWatch = autorun(() => {
      this.myUserInfo = store && store.userStore && store.userStore.myUserInfo;
    });
  },
  beforeDestroy() {
    if (this.uninstallMyUserInfoWatch) {
      this.uninstallMyUserInfoWatch();
    }
  },
};
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
  width: 66px;
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
  width: 300px;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  background-color: #fff;
  box-sizing: border-box;
  outline: none;
  cursor: pointer;
  transition: border-color 0.3s;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.gender-select-text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: #000;
}

.gender-dropdown-menu {
  padding: 4px 0px;
}

.gender-dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  box-sizing: border-box;
}

.gender-dropdown-item:hover {
  background-color: #f5f5f5;
}
</style>
