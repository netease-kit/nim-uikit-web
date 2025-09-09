<template>
  <Modal
    :visible="visible"
    :title="t('addMemberText')"
    :confirmText="t('okText')"
    :cancelText="t('cancelText')"
    :width="800"
    :height="600"
    :showDefaultFooter="true"
    @confirm="addTeamMember"
    @cancel="handleClose"
    @update:visible="handleUpdateVisible"
  >
    <div class="add-member-content">
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
                @checkboxChange="checkboxChange"
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
/** 添加群成员弹窗 */
import Modal from "../../../CommonComponents/Modal.vue";
import PersonSelect, {
  type PersonSelectItem,
} from "../../../CommonComponents/PersonSelect.vue";
import Avatar from "../../../CommonComponents/Avatar.vue";
import Appellation from "../../../CommonComponents/Appellation.vue";
import { ref, computed, onMounted, getCurrentInstance, watch } from "vue";
import { t } from "../../../utils/i18n";
import { toast } from "../../../utils/toast";
import { debounce } from "@xkit-yx/utils";

// Props
interface Props {
  visible: boolean;
  teamId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  teamId: "",
});

// Emits
interface Emits {
  (e: "update:visible", visible: boolean): void;
  (e: "close"): void;
}

const emit = defineEmits<Emits>();

const { proxy } = getCurrentInstance()!;
const store = proxy?.$UIKitStore;

// 响应式数据
const friendList = ref<PersonSelectItem[]>([]);
// 群成员
const teamMembers = computed(() => {
  return friendList.value
    .filter((item) => item.checked)
    .map((item) => item.accountId);
});

// 事件处理
const handleClose = () => {
  emit("close");
  emit("update:visible", false);
};

// 更新可见性
const handleUpdateVisible = (visible: boolean) => {
  emit("update:visible", visible);
  if (!visible) {
    emit("close");
  }
};

// 复选框变化处理
const checkboxChange = (selectList) => {
  friendList.value = friendList.value.map((item) => {
    return {
      accountId: item.accountId,
      checked: selectList.includes(item.accountId),
    };
  });

  if (selectList.length >= 200) {
    toast.info(t("maxSelectedText"));
    return;
  }
};

// 添加群成员
const addTeamMember = debounce(() => {
  // 群成员数量存在限制
  if (teamMembers.value.length > 200) {
    toast.info(t("maxSelectedText"));
    return;
  }
  if (teamMembers.value.length == 0) {
    toast.info(t("pleaseSelectMember"));
    return;
  }

  store?.teamMemberStore
    .addTeamMemberActive({ teamId: props.teamId, accounts: teamMembers.value })
    .then(async () => {
      toast.success(t("addTeamMemberSuccessText"));
    })
    .catch((err: any) => {
      switch (err ? err.code : "") {
        case 109306:
          toast.error(t("noPermission"));
          break;
        default:
          toast.error(t("addTeamMemberFailText"));
          break;
      }
    })
    .finally(() => {
      handleClose();
    });
}, 800);

onMounted(() => {
  const list =
    store?.uiStore.friends.filter(
      (item) => !store?.relationStore.blacklist.includes(item.accountId)
    ) || [];

  // 获取当前群成员列表
  const currentTeamMembers =
    store?.teamMemberStore.getTeamMember(props.teamId) || [];
  const teamMemberIds = currentTeamMembers.map((member) => member.accountId);

  friendList.value = list.map((item) => ({
    accountId: item.accountId,
    disabled: teamMemberIds.includes(item.accountId), // 已在群中的好友设为禁用状态
  }));
});
</script>

<style scoped>
.add-member-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 440px;
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
