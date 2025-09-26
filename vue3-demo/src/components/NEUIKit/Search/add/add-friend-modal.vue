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

<script lang="ts" setup>
import { onUnmounted, ref, getCurrentInstance } from "vue";
import Avatar from "../../CommonComponents/Avatar.vue";
import Modal from "../../CommonComponents/Modal.vue";
import Icon from "../../CommonComponents/Icon.vue";
import { t } from "../../utils/i18n";
import Button from "../../CommonComponents/Button.vue";
import { autorun } from "mobx";
import type { Relation } from "@xkit-yx/im-store-v2";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import type { V2NIMUser } from "nim-web-sdk-ng/dist/esm/nim/src/V2NIMUserService";
import Input from "../../CommonComponents/Input.vue";
import { showToast } from "../../utils/toast";

// 添加 Modal 相关的 props
interface Props {
  visible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
});

// 添加 Modal 相关的 emits
const emit = defineEmits<{
  close: [];
  goChat: [];
  "update:visible": [value: boolean];
}>();

// Modal 事件处理
const handleClose = () => {
  emit("close");
  emit("update:visible", false);
};

const handleUpdateVisible = (value: boolean) => {
  emit("update:visible", value);
};

const { proxy } = getCurrentInstance()!; // 获取组件实例
const store = proxy?.$UIKitStore;

// 搜索结果状态
const searchResState = ref<"beginSearch" | "searchEmpty" | "searchResult">(
  "beginSearch"
);
const userInfo = ref<V2NIMUser>();
const relation = ref<Relation | undefined>("stranger");
const searchText = ref("");
const uninstallRelationWatch = autorun(() => {
  store?.uiStore.friends;
  if (userInfo.value?.accountId) {
    relation.value = store?.uiStore.getRelation(
      userInfo.value?.accountId
    ).relation;
  }
});

// 搜索好友
const handleSearch = async () => {
  try {
    const user = await store?.userStore.getUserActive(searchText.value);

    if (!user) {
      searchResState.value = "searchEmpty";
    } else {
      userInfo.value = user;

      relation.value = store?.uiStore.getRelation(user.accountId).relation;
      searchResState.value = "searchResult";
    }
  } catch (error) {
    showToast({
      message: t("searchFailText"),
      type: "info",
    });
  }
};

// 添加好友
const applyFriend = async () => {
  const account = userInfo.value?.accountId;
  if (account) {
    try {
      await store?.friendStore.addFriendActive(account, {
        addMode: V2NIMConst.V2NIMFriendAddMode.V2NIM_FRIEND_MODE_TYPE_APPLY,
        postscript: "",
      });

      // 发送申请成功后解除黑名单
      await store?.relationStore.removeUserFromBlockListActive(account);

      showToast({
        message: t("applyFriendSuccessText"),
        type: "success",
      });
    } catch (error) {
      showToast({
        message: t("applyFriendFailText"),
        type: "info",
      });
    }
  }
};

// 去聊天
const gotoChat = async () => {
  const to = userInfo.value?.accountId;
  if (to) {
    try {
      if (store?.sdkOptions?.enableV2CloudConversation) {
        await store?.conversationStore?.insertConversationActive(
          V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P,
          to,
          true
        );
      } else {
        await store?.localConversationStore?.insertConversationActive(
          V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P,
          to,
          true
        );
      }
      emit("goChat");
    } catch (error) {
      showToast({
        message: t("gotoChatFailText"),
        type: "info",
      });
    }
    handleClose();
  }
};

const onInputValueChange = (value) => {
  //删除搜索内容,页面回到最原始状态，搜索结果都清空
  if (value === "") {
    searchResState.value = "beginSearch";
  }
};

onUnmounted(() => {
  uninstallRelationWatch();
});
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
