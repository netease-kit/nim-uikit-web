<template>
  <Modal
    v-if="visible"
    :visible="visible"
    :title="t('teamManagerSelect')"
    :confirmText="t('okText')"
    :cancelText="t('cancelText')"
    :width="800"
    :height="600"
    :showDefaultFooter="true"
    @confirm="onOk"
    @cancel="handleClose"
    @close="handleClose"
  >
    <div class="add-manager-content">
      <!-- 左右分栏主内容 -->
      <div class="main-content">
        <!-- 左侧：群成员选择 + 搜索 -->
        <div class="left-panel">
          <div class="section-header">
            <Input
              :modelValue="searchKey"
              :placeholder="t('searchTitleText')"
              :showClear="searchKey.length > 0"
              @update:modelValue="onSearchChange"
              :inputStyle="{
                backgroundColor: '#F5F7FA',
                padding: '7px',
              }"
            />
          </div>
          <div class="person-select-container">
            <PersonSelect
              :personList="personListToRender"
              :selected="selectedAccounts"
              :max="10"
              @update:selected="onSelectedUpdate"
              @checkboxChange="onSelectedUpdate"
              :radio="false"
              :showBtn="false"
              avatarSize="32"
              :emptyText="t('searchNoResText')"
            />
          </div>
        </div>

        <!-- 右侧：已选成员列表 -->
        <div class="right-panel">
          <div class="selected-friends-section">
            <div class="selected-header">
              <span class="selected-count">
                {{ t("selectedText") }}: {{ selectedAccounts.length }}
                {{ t("personUnit") }}
              </span>
            </div>
            <div class="selected-friends-container">
              <div class="selected-friends-list">
                <div
                  v-for="accountId in selectedAccounts"
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
                      :teamId="teamId"
                      :fontSize="14"
                    />
                  </div>
                  <div class="remove-btn" @click="removeSelected(accountId)">
                    ×
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
import Modal from "../../../../CommonComponents/Modal.vue";
import PersonSelect, {
  type PersonSelectItem,
} from "../../../../CommonComponents/PersonSelect.vue";
import Input from "../../../../CommonComponents/Input.vue";
import Avatar from "../../../../CommonComponents/Avatar.vue";
import Appellation from "../../../../CommonComponents/Appellation.vue";
import { ref, computed, onMounted, onUnmounted, getCurrentInstance } from "vue";
import { autorun } from "mobx";
import { debounce } from "@xkit-yx/utils";
import { t } from "../../../../utils/i18n";
import { toast } from "../../../../utils/toast";
import RootStore from "@xkit-yx/im-store-v2";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import type { V2NIMTeamMember } from "nim-web-sdk-ng/dist/esm/nim/src/V2NIMTeamService";

interface Props {
  visible: boolean;
  teamId: string;
}
const props = defineProps<Props>();

const emit = defineEmits<{
  "update:visible": [visible: boolean];
  close: [];
  success: [];
}>();

const { proxy } = getCurrentInstance()!;
const store = proxy?.$UIKitStore as RootStore;

// 原始成员列表（不含 checked）
const personListRaw = ref<PersonSelectItem[]>([]);
// 搜索关键字
const searchKey = ref<string>("");
// 已选成员
const selectedAccounts = ref<string[]>([]);

// 过滤后的成员列表
const filteredPersonList = computed(() => {
  const key = searchKey.value.trim().toLowerCase();
  if (!key) return personListRaw.value;
  return personListRaw.value.filter((p) => {
    const name = (
      store?.uiStore.getAppellation({
        account: p.accountId,
        teamId: props.teamId,
      }) || ""
    ).toLowerCase();
    return name.includes(key);
  });
});

// 传给 PersonSelect 的最终列表（包含 checked）
const personListToRender = computed<PersonSelectItem[]>(() =>
  filteredPersonList.value.map((p) => ({
    ...p,
    checked: selectedAccounts.value.includes(p.accountId),
  }))
);

let uninstallTeamMemberWatch = () => {};

const handleClose = () => {
  emit("close");
  emit("update:visible", false);
};

const onSearchChange = (val: string) => {
  searchKey.value = val;
};

// 统一受控更新入口
const onSelectedUpdate = (next: string[]) => {
  // 局部合并：只替换当前搜索范围内的选中，保留范围外
  const visibleIds = new Set(filteredPersonList.value.map((p) => p.accountId));
  const preserved = selectedAccounts.value.filter((id) => !visibleIds.has(id));
  selectedAccounts.value = Array.from(new Set([...preserved, ...next]));
};

const removeSelected = (accountId: string) => {
  selectedAccounts.value = selectedAccounts.value.filter(
    (id) => id !== accountId
  );
};

const onOk = debounce(async () => {
  // 当前选中的目标管理员
  const selected = [...selectedAccounts.value];

  // 现有管理员列表
  const members = store.teamMemberStore.getTeamMember(props.teamId) || [];
  const teamManagerAccounts = members
    .filter(
      (item) =>
        item.memberRole ===
        V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER
    )
    .map((item) => item.accountId);

  // 需要新增为管理员的账号（选中但当前不是管理员）
  const add = selected.filter((acc) => !teamManagerAccounts.includes(acc));
  // 需要移除管理员的账号（当前是管理员但未选中）
  const remove = teamManagerAccounts.filter((acc) => !selected.includes(acc));

  // 无变更直接关闭
  if (add.length === 0 && remove.length === 0) {
    handleClose();
    return;
  }

  try {
    if (add.length) {
      await store.teamStore.updateTeamMemberRoleActive({
        teamId: props.teamId,
        accounts: add,
        role: V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER,
      });
    }
    if (remove.length) {
      await store.teamStore.updateTeamMemberRoleActive({
        teamId: props.teamId,
        accounts: remove,
        role: V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_NORMAL,
      });
    }
    toast.success(t("updateTeamManagerSuccessText"));
    emit("success");
    handleClose();
  } catch (error: any) {
    switch (error?.code) {
      case 191004:
        toast.error(t("userNotInTeam"));
        break;
      case 109432:
        toast.error(t("noPermission"));
        break;
      default:
        toast.error(t("updateTeamFailedText"));
        break;
    }
  }
}, 500);

onMounted(() => {
  // 同步当前群成员，并禁用已是管理员的成员
  uninstallTeamMemberWatch = autorun(() => {
    const members = store.teamMemberStore.getTeamMember(props.teamId) || [];
    // 过滤掉群主，只显示普通成员和管理员
    const items: PersonSelectItem[] = members
      .filter(
        (m: V2NIMTeamMember) =>
          m.memberRole !==
          V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_OWNER
      )
      .map((m: V2NIMTeamMember) => {
        return {
          accountId: m.accountId,
          teamId: props.teamId,
          checked:
            m.memberRole ===
            V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER,
        };
      });

    selectedAccounts.value = items
      .filter((item) => item.checked)
      .map((item) => item.accountId);

    personListRaw.value = items;
  });
});

onUnmounted(() => {
  uninstallTeamMemberWatch();
});
</script>

<style scoped>
.add-manager-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 470px;
  overflow-y: hidden;
}

/* 主内容：左右分栏 */
.main-content {
  display: flex;
  gap: 20px;
  flex: 1;
  min-height: 450px;
  padding: 0 20px;
}

/* 左侧 */
.left-panel {
  flex: 1;
  min-width: 0;
}

.left-panel :deep(.empty-wrapper) {
  margin-top: 50px;
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

/* 右侧 */
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

.selected-friends-container {
  flex: 1;
  overflow-y: auto;
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
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.remove-btn:hover {
  transform: scale(1.2);
}
</style>
