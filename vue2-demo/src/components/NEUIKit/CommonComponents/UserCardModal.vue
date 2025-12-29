<template>
  <Modal
    :visible="visible"
    :title="''"
    :showDefaultFooter="false"
    :width="350"
    :showMask="true"
    :showClose="false"
    :top="80"
    :maskOpacity="0"
    :bodyStyle="{ padding: 0 }"
    @close="handleClose"
    @cancel="handleClose"
    @update:visible="handleUpdateVisible"
  >
    <div class="user-card">
      <!-- 右上角三点菜单 -->
      <div class="menu-container" v-if="relation == 'friend'">
        <Dropdown
          trigger="click"
          placement="bottom"
          :dropdownStyle="{ zIndex: 10000 }"
        >
          <div class="menu-trigger">
            <Icon type="icon-more-white" :size="16" />
          </div>
          <template #overlay>
            <div class="menu-content">
              <div class="menu-item" @click="handleBlacklistFriend">
                <Icon type="icon-lahei" :size="14" />
                <span>{{
                  isInBlacklist
                    ? t("unblacklistText")
                    : t("blacklistFriendText")
                }}</span>
              </div>
              <div class="menu-item" @click="handleDeleteFriend">
                <Icon type="icon-shanchu" :size="14" />
                <span>{{ t("deleteFriendMenuText") }}</span>
              </div>
            </div>
          </template>
        </Dropdown>
      </div>

      <!-- 头部背景和头像 -->
      <div class="header-section">
        <div class="background-image"></div>
      </div>

      <!-- 用户信息 -->
      <div class="user-info">
        <!-- 头像和用户名 -->
        <div class="user-header">
          <div class="avatar-container">
            <Avatar
              :key="userInfo && userInfo.updateTime"
              v-if="account"
              size="60"
              :account="account"
              :fontSize="14"
            />
          </div>
          <div class="username">
            {{ userInfo?.name || userInfo?.accountId }}
          </div>
        </div>
        <div class="user-details">
          <div class="detail-item" v-if="relation !== 'stranger'">
            <span class="label">{{ t("remarkText") }}</span>
            <div class="value-container">
              <Input
                v-model="alias"
                :inputStyle="{
                  backgroundColor: '#F5F7FA',
                }"
                class="alias-input"
                :placeholder="alias ? alias : t('setNicknamePlaceholder')"
                @blur="handleSaveAlias"
                @keyup.enter="handleSaveAlias"
                :maxlength="15"
              />
            </div>
          </div>
          <div class="detail-item">
            <span class="label">{{ t("accountText") }}</span>
            <span class="value">{{ account }}</span>
          </div>
          <div class="detail-item">
            <span class="label">{{ t("genderText") }}</span>
            <span class="value">
              {{
                userInfo && userInfo.gender === 0
                  ? t("unknow")
                  : userInfo && userInfo.gender === 1
                    ? t("man")
                    : t("woman")
              }}
            </span>
          </div>
          <div class="detail-item">
            <span class="label">{{ t("mobile") }}</span>
            <span class="value">{{ (userInfo && userInfo.mobile) || "" }}</span>
          </div>
          <div class="detail-item">
            <span class="label">{{ t("email") }}</span>
            <span class="value">{{ (userInfo && userInfo.email) || "" }}</span>
          </div>
          <div class="detail-item">
            <span class="label">{{ t("sign") }}</span>
            <span class="value">{{ (userInfo && userInfo.sign) || "" }}</span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="actions">
        <template v-if="relation === 'stranger'">
          <button class="action-btn primary" @click="addFriend">
            {{ t("addFriendText") }}
          </button>
        </template>
        <template v-else>
          <button class="action-btn primary" @click="gotoChat">
            {{ t("sendMessageText") }}
          </button>
        </template>
      </div>
    </div>
  </Modal>
</template>

<script>
import Avatar from "./Avatar.vue";
import Icon from "./Icon.vue";
import Modal from "./Modal.vue";
import Dropdown from "./Dropdown.vue";
import { autorun } from "mobx";
import { t } from "../utils/i18n";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import { toast } from "../utils/toast";
import { modal } from "../utils/modal";
import Input from "./Input.vue";
import { uiKitStore } from "../utils/init";

export default {
  name: "UserCardModal",
  components: { Avatar, Icon, Modal, Dropdown, Input },
  props: {
    account: { type: String, default: "" },
    visible: { type: Boolean, default: false },
  },
  data() {
    return {
      userInfo: null,
      relation: "stranger",
      isInBlacklist: false,
      alias: "",
      uninstallFriendsWatch: null,
      uninstallFriendWatch: null,
      uninstallRelationWatch: null,
    };
  },
  computed: {
    store() {
      return uiKitStore;
    },
  },
  created() {
    const account = this.account;
    this.uninstallFriendsWatch = autorun(() => {
      const friend = {
        ...(this.store?.friendStore.friends.get(account) || {}),
      };
      this.alias = friend ? friend.alias || "" : "";
    });

    this.store?.userStore.getUserListFromCloudActive([account]).then((res) => {
      if (res && res.length) {
        this.userInfo = res[0];
      }
    });

    this.uninstallFriendWatch = autorun(() => {
      this.store?.friendStore.getFriendByIdsActive([account]).then((res) => {
        if (res && res.length) {
          this.alias = res[0].alias || "";
        }
      });
    });

    this.uninstallRelationWatch = autorun(() => {
      const rel = this.store?.uiStore.getRelation(account) || {
        relation: "stranger",
        isInBlacklist: false,
      };
      this.relation = rel.relation;
      this.isInBlacklist = rel.isInBlacklist;
    });
  },
  beforeDestroy() {
    if (this.uninstallFriendsWatch) this.uninstallFriendsWatch();
    if (this.uninstallFriendWatch) this.uninstallFriendWatch();
    if (this.uninstallRelationWatch) this.uninstallRelationWatch();
  },
  methods: {
    t,
    handleClose() {
      this.$emit("close");
      this.$emit("update:visible", false);
    },
    handleUpdateVisible(value) {
      this.$emit("update:visible", value);
    },
    async addFriend() {
      try {
        await this.store?.friendStore.addFriendActive(this.account, {
          addMode: V2NIMConst.V2NIMFriendAddMode.V2NIM_FRIEND_MODE_TYPE_APPLY,
          postscript: "",
        });
        await this.store?.relationStore.removeUserFromBlockListActive(
          this.account
        );
        toast.success(t("applyFriendSuccessText"));
      } catch (error) {
        toast.error(t("applyFriendFailText"));
      }
    },
    async gotoChat() {
      const account = (this.userInfo && this.userInfo.accountId) || "";
      if (this.store?.sdkOptions?.enableV2CloudConversation) {
        await this.store.conversationStore?.insertConversationActive(
          V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P,
          account,
          true
        );
      } else {
        await this.store?.localConversationStore?.insertConversationActive(
          V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P,
          account,
          true
        );
      }
      this.$emit("footClick");
      this.handleClose();
    },
    /**
     * 处理用户黑名单状态切换
     *
     * 根据当前黑名单状态(isInBlacklist)执行添加或移除黑名单操作：
     * 1. 如果用户已在黑名单中，则将其移出黑名单
     * 2. 如果用户不在黑名单中，则将其加入黑名单并同时从好友列表中移除
     *
     * @async
     * @throws {Error} 当黑名单操作失败时抛出错误
     * @emits toast.success 操作成功时显示成功提示
     * @emits toast.error 操作失败时显示错误提示
     * @listens this.account 监听当前用户账号
     * @listens this.isInBlacklist 监听当前黑名单状态
     */
    async handleBlacklistFriend() {
      try {
        if (this.isInBlacklist) {
          await this.store?.relationStore.removeUserFromBlockListActive(
            this.account
          );
          this.isInBlacklist = false;
          toast.success(t("unblacklistSuccessText"));
        } else {
          await this.store?.relationStore.addUserToBlockListActive(
            this.account
          );
          this.isInBlacklist = true;
          toast.success(t("blacklistSuccessText"));
        }
      } catch (error) {
        toast.error(
          this.isInBlacklist ? t("unblacklistFailText") : t("blacklistFailText")
        );
      }
    },
    handleDeleteFriend() {
      const name =
        this.store?.uiStore.getAppellation({ account: this.account }) || "";
      modal.confirm({
        title: t("deleteFriendText"),
        content: `${t("deleteFriendConfirmText")}"${name}"?`,
        onConfirm: async () => {
          try {
            await this.store?.friendStore.deleteFriendActive(this.account);
            toast.success(t("deleteFriendSuccessText"));
            this.handleClose();
          } catch (error) {
            toast.info(t("deleteFriendFailText"));
          }
        },
      });
    },
    async handleSaveAlias() {
      try {
        const newAlias = (this.alias || "").trim();
        this.alias = newAlias || "";
        await this.store?.friendStore.setFriendInfoActive(this.account, {
          alias: this.alias,
        });
        toast.success(t("updateTeamSuccessText"));
      } catch (error) {
        toast.error(t("updateTeamFailedText"));
      }
    },
  },
};
</script>

<style scoped>
.user-card {
  position: relative;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
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
  padding: 20px;
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
}

.avatar-container {
  border: 3px solid #fff;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.username {
  font-size: 18px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #333;
  flex: 1;
}

/* 三点菜单样式 */
.menu-container {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 100;
}

.menu-trigger {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #666;
}

.menu-trigger:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #333;
}

.menu-content {
  width: 110px;
  padding: 4px;
  background: #fff;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 5px 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 14px;
  color: #333;
}

.menu-item:hover {
  background-color: #f5f5f5;
}

.menu-item span {
  margin-left: 8px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
}

.detail-item:last-child {
  border-bottom: none;
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
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.value-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  max-width: 180px;
}

.alias-input {
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 14px;
  color: #333;
  background-color: #f5f7fa;
  outline: none;
  width: 100%;
  max-width: 200px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.alias-input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

/* 操作按钮区域 */
.actions {
  padding: 0 20px 20px;
}

.action-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.action-btn {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background-color: #1890ff;
  color: #fff;
  width: 100%;
}

.action-btn.primary:hover {
  background-color: #40a9ff;
}

.action-btn.secondary {
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #d9d9d9;
}

.action-btn.secondary:hover {
  background-color: #e6f7ff;
  border-color: #91d5ff;
  color: #1890ff;
}
</style>
