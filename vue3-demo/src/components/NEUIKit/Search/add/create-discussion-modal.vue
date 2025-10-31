<template>
  <Modal
    v-if="visible"
    :visible="visible"
    :title="t('createDiscussionText')"
    :confirmText="t('createButtonText')"
    :cancelText="t('cancelText')"
    :width="900"
    :height="610"
    :showDefaultFooter="true"
    @confirm="createDiscussion"
    @cancel="handleClose"
    @close="handleClose"
  >
    <div class="create-discussion-content">
      <!-- 主要内容区域：左右分栏 -->
      <div class="main-content">
        <!-- 左侧：好友选择 -->
        <div class="left-panel">
          <div class="friends-section">
            <div class="section-header">
              <span class="section-div friend-select-text">{{
                t("friendText")
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

<script lang="ts" setup>
import Modal from "../../CommonComponents/Modal.vue";
import PersonSelect, {
  type PersonSelectItem,
} from "../../CommonComponents/PersonSelect.vue";
import Avatar from "../../CommonComponents/Avatar.vue";
import Appellation from "../../CommonComponents/Appellation.vue";
import { ref, computed, onMounted, getCurrentInstance, watch } from "vue";
import { t } from "../../utils/i18n";
import { toast } from "../../utils/toast";
import Input from "../../CommonComponents/Input.vue";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";

// Props
interface Props {
  visible: boolean;
  p2pAccountId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  p2pAccountId: "",
});

const emit = defineEmits<{
  close: [];
  goChat: [];
  "update:visible": [value: boolean];
}>();

const { proxy } = getCurrentInstance()!;
const store = proxy?.$UIKitStore;

// 响应式数据
const friendList = ref<PersonSelectItem[]>([]);
const teamName = ref("");
const selectedAvatarIndex = ref(0);
const selectedAccounts = ref<string[]>([]);

const teamMembers = computed(() => {
  return selectedAccounts.value;
});

let p2pAccountId = "";
let flag = false;

// 事件处理
const handleClose = () => {
  emit("close");
};

const onSelectedUpdate = (next: string[]) => {
  if (next.length > 200) {
    toast.info(t("maxSelectedText"));
    return;
  }
  selectedAccounts.value = next;
};

// 群头像
const createTeamAvatar = () => {
  const teamAvatarArr = [
    "https://yx-web-nosdn.netease.im/common/2425b4cc058e5788867d63c322feb7ac/groupAvatar1.png",
    "https://yx-web-nosdn.netease.im/common/62c45692c9771ab388d43fea1c9d2758/groupAvatar2.png",
    "https://yx-web-nosdn.netease.im/common/d1ed3c21d3f87a41568d17197760e663/groupAvatar3.png",
    "https://yx-web-nosdn.netease.im/common/e677d8551deb96723af2b40b821c766a/groupAvatar4.png",
    "https://yx-web-nosdn.netease.im/common/fd6c75bb6abca9c810d1292e66d5d87e/groupAvatar5.png",
  ];
  const _index = Math.floor(Math.random() * 5);
  return teamAvatarArr[_index];
};

const createTeamName = (teamMembers: string[]) => {
  if (teamName.value.trim()) {
    return teamName.value.trim();
  }

  const _memberNickArr: string[] = [];
  teamMembers.map((item) => {
    let appellation = store?.uiStore.getAppellation({ account: item });
    if (appellation) {
      _memberNickArr.push(appellation);
    }
  });

  const _ownerName =
    store?.userStore.myUserInfo.name || store?.userStore.myUserInfo.accountId;
  const _teamName = (_ownerName + "、" + _memberNickArr.join("、")).slice(
    0,
    30
  );
  return _teamName;
};
// 创建讨论组和创建群聊本质调用的都是创建群的接口，仅在创建群接口时，群扩展字段添加im_ui_kit_group参数区分，讨论组本质也是群，只是少了群的一些能力，旨在于快速创建讨论
const createDiscussion = async () => {
  try {
    if (flag) return;
    if (teamMembers?.value?.length == 0) {
      toast.info(t("friendSelect"));
      return;
    }

    if (teamMembers?.value?.length > 200) {
      toast.info(t("maxSelectedText"));
      return;
    }
    flag = true;

    const team = await store?.teamStore.createTeamActive({
      type: V2NIMConst.V2NIMTeamType.V2NIM_TEAM_TYPE_ADVANCED,
      accounts: [...teamMembers.value],
      avatar: createTeamAvatar(),
      name: createTeamName(teamMembers.value),
      joinMode: V2NIMConst.V2NIMTeamJoinMode.V2NIM_TEAM_JOIN_MODE_FREE,
      agreeMode: V2NIMConst.V2NIMTeamAgreeMode.V2NIM_TEAM_AGREE_MODE_NO_AUTH,
      inviteMode: V2NIMConst.V2NIMTeamInviteMode.V2NIM_TEAM_INVITE_MODE_ALL,
      updateInfoMode:
        V2NIMConst.V2NIMTeamUpdateInfoMode.V2NIM_TEAM_UPDATE_INFO_MODE_ALL,
      updateExtensionMode:
        V2NIMConst.V2NIMTeamUpdateExtensionMode
          .V2NIM_TEAM_UPDATE_EXTENSION_MODE_ALL,
      serverExtension: JSON.stringify({
        im_ui_kit_group: true,
      }),
    });

    let teamId = team?.teamId;
    if (teamId) {
      if (store?.sdkOptions?.enableV2CloudConversation) {
        await store.conversationStore?.insertConversationActive(
          V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM,
          teamId,
          true
        );
      } else {
        await store?.localConversationStore?.insertConversationActive(
          V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM,
          teamId,
          true
        );
      }
    }

    toast.success(t("createDiscussionSuccessText"));
    emit("goChat");

    // 创建成功后关闭弹窗
    handleClose();
  } catch (error) {
    toast.error(t("createDiscussionFailedText"));
  } finally {
    flag = false;
  }
};

// 重置状态
const resetState = () => {
  teamName.value = "";
  selectedAvatarIndex.value = 0;
  selectedAccounts.value = p2pAccountId ? [p2pAccountId] : [];
};

// 监听弹窗显示状态，关闭时重置
watch(
  () => props.visible,
  (newVisible, oldVisible) => {
    if (oldVisible && !newVisible) {
      // 延迟重置，等待动画完成
      setTimeout(resetState, 300);
    }
  }
);

onMounted(() => {
  p2pAccountId = props.p2pAccountId;

  const list =
    store?.uiStore.friends.filter(
      (item) => !store?.relationStore.blacklist.includes(item.accountId)
    ) || [];

  friendList.value = list
    .map((item) => ({ accountId: item.accountId }))
    .filter((item) => {
      return item.accountId !== p2pAccountId;
    });

  if (p2pAccountId) {
    friendList.value.push({
      accountId: p2pAccountId,
      checked: true,
      disabled: true,
    });
    selectedAccounts.value = [p2pAccountId];
  }
});
</script>

<style scoped>
.create-discussion-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 480px;
  height: 100%;
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
