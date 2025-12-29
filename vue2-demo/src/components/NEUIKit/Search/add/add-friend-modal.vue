<template>
  <Modal
    :visible="visible"
    :title="t('addFriendText')"
    :maskClosable="true"
    :width="500"
    :height="280"
    :top="100"
    :bodyStyle="{
      padding: '20px 20px 5px 20px',
    }"
    :destroyOnClose="true"
    @close="handleClose"
    @confirm="handleSearch"
    @cancel="handleClose"
    @update:visible="handleUpdateVisible"
    :confirmText="t('searchButtonText')"
    :cancelText="t('cancelText')"
  >
    <div class="add-friend-wrapper">
      <div class="search-input-wrapper">
        <div class="search-icon">
          <Icon :size="20" color="#A6ADB6" type="icon-sousuo"></Icon>
        </div>
        <!-- 输入框：使用 v-model 绑定到 searchText，按回车触发搜索 -->
        <Input
          class="search-input"
          type="text"
          v-model="searchText"
          @input="onInputValueChange"
          @confirm="handleSearch"
          placeholder-class="placeholder"
          confirm-type="search"
          :placeholder="t('enterAccount')"
          :inputStyle="{
            backgroundColor: '#f1f5f8',
          }"
        />
      </div>

      <div class="search-empty" v-if="searchResState == 'searchEmpty'">
        {{ t("accountNotMatchText") }}
      </div>
      <div class="user-wrapper" v-else-if="searchResState === 'searchResult'">
        <Avatar
          class="user-avatar"
          :account="(userInfo && userInfo.accountId) || ''"
        />
        <div class="user-info">
          <div class="user-nick">
            {{
              (userInfo && userInfo.name) || (userInfo && userInfo.accountId)
            }}
          </div>
          <div class="user-id">{{ userInfo && userInfo.accountId }}</div>
        </div>
        <!-- 如果是好友之间去聊天，如果不是好友，添加好友 -->
        <Button
          v-if="relation !== 'stranger'"
          class="go-chat-button"
          @click="gotoChat"
        >
          {{ t("chatButtonText") }}
        </Button>
        <Button v-else class="go-chat-button" @click="applyFriend">
          {{ t("addText") }}
        </Button>
      </div>
    </div>
  </Modal>
</template>

<script>
import Avatar from "../../CommonComponents/Avatar.vue";
import Modal from "../../CommonComponents/Modal.vue";
import Icon from "../../CommonComponents/Icon.vue";
import { t } from "../../utils/i18n";
import Button from "../../CommonComponents/Button.vue";
import { autorun } from "mobx";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import Input from "../../CommonComponents/Input.vue";
import { showToast } from "../../utils/toast";
import { uiKitStore } from "../../utils/init";

export default {
  name: "AddFriendModal",
  components: { Avatar, Modal, Icon, Button, Input },
  props: {
    visible: { type: Boolean, default: false },
  },
  data() {
    return {
      store: uiKitStore,
      searchResState: "beginSearch",
      userInfo: undefined,
      relation: "stranger",
      searchText: "",
      uninstallRelationWatch: null,
    };
  },
  methods: {
    t,
    // 关闭弹窗：派发关闭事件并同步 v-model:visible
    handleClose() {
      this.$emit("close");
      this.$emit("update:visible", false);
    },
    // 更新弹窗可见性：透传父组件的 v-model:visible 变更
    handleUpdateVisible(value) {
      this.$emit("update:visible", value);
    },
    // 执行搜索：根据输入的账号获取用户信息，并判定关系与结果态
    async handleSearch() {
      try {
        const user = await this.store?.userStore.getUserActive(this.searchText);
        if (!user) {
          this.searchResState = "searchEmpty";
        } else {
          this.userInfo = user;
          this.relation = this.store?.uiStore.getRelation(
            user.accountId
          ).relation;
          this.searchResState = "searchResult";
        }
      } catch (error) {
        showToast({ message: t("searchFailText"), type: "info" });
      }
    },
    // 添加好友：提交好友申请，移除黑名单，并提示结果
    async applyFriend() {
      const account = this.userInfo && this.userInfo.accountId;
      if (account) {
        try {
          await this.store?.friendStore.addFriendActive(account, {
            addMode: V2NIMConst.V2NIMFriendAddMode.V2NIM_FRIEND_MODE_TYPE_APPLY,
            postscript: "",
          });
          await this.store?.relationStore.removeUserFromBlockListActive(
            account
          );
          showToast({ message: t("applyFriendSuccessText"), type: "success" });
        } catch (error) {
          showToast({ message: t("applyFriendFailText"), type: "info" });
        }
      }
    },
    // 去聊天：插入最近会话（云端/本地模式），派发跳转事件并关闭弹窗
    async gotoChat() {
      const to = this.userInfo && this.userInfo.accountId;
      if (to) {
        try {
          if (this.store?.sdkOptions?.enableV2CloudConversation) {
            await this.store?.conversationStore?.insertConversationActive(
              V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P,
              to,
              true
            );
          } else {
            await this.store?.localConversationStore?.insertConversationActive(
              V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P,
              to,
              true
            );
          }
          this.$emit("goChat");
        } catch (error) {
          showToast({ message: t("gotoChatFailText"), type: "info" });
        }
        this.handleClose();
      }
    },
    // 输入变化：当清空输入内容时重置搜索状态为初始态
    onInputValueChange(value) {
      if (value === "") {
        this.searchResState = "beginSearch";
      }
    },
  },
  mounted() {
    // 监听好友列表变化：当用户信息存在时更新双方关系状态
    this.uninstallRelationWatch = autorun(() => {
      this.store?.uiStore.friends;
      if (this.userInfo && this.userInfo.accountId) {
        this.relation = this.store?.uiStore.getRelation(
          this.userInfo.accountId
        ).relation;
      }
    });
  },
  beforeDestroy() {
    // 清理 autorun 监听器，避免内存泄漏
    if (typeof this.uninstallRelationWatch === "function") {
      try {
        this.uninstallRelationWatch();
      } catch (e) {
        console.error("uninstallRelationWatch error", e);
      }
    }
  },
};
</script>

<style scoped>
.add-friend-wrapper {
  background-color: #fff;
  max-height: 130px;
  height: 120px;
  overflow: hidden;
}
.search-input-wrapper {
  display: flex;
  align-items: center;
  background-color: #f1f5f8;
  box-sizing: border-box;
  padding: 3px 5px;
  border-radius: 3px;
  height: 36px;
}
.search-icon {
  color: #a6adb6;
  background-size: 100% 100%;
  width: 20px;
  height: 20px;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-input {
  display: inline-block;
  background-color: #f2f4f5;
  flex: 1;
}

.placeholder {
  color: #a6adb6;
}

.user-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 10px;
  box-sizing: border-box;
}
.user-avatar {
  flex: 0 0 40px;
  height: 40px;
  border-radius: 50%;
  display: inline-block;
}
.go-chat-button {
  height: 30px;
  font-size: 14px;
  line-height: 30px;
  margin: 5px;
  flex: 0 0 70px;
}
.user-info {
  flex: 1;
  margin-left: 15px;
  overflow: hidden;
  color: #000;
}
.user-nick {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.user-id {
  width: 100%;
  font-size: 14px;
  color: #b5b6b8;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.search-empty {
  color: #f24957;
  margin-top: 30px;
  text-align: center;
}
</style>
