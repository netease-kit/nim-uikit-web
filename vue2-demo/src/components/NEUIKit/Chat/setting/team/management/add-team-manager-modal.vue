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
              :value="searchKey"
              :placeholder="t('searchTitleText')"
              :showClear="searchKey.length > 0"
              @input="onSearchChange"
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
                      :font-size="14"
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

<script>
import Modal from "../../../../CommonComponents/Modal.vue";
import PersonSelect from "../../../../CommonComponents/PersonSelect.vue";
import Input from "../../../../CommonComponents/Input.vue";
import Avatar from "../../../../CommonComponents/Avatar.vue";
import Appellation from "../../../../CommonComponents/Appellation.vue";
import { autorun } from "mobx";
import { debounce } from "@xkit-yx/utils";
import { t } from "../../../../utils/i18n";
import { toast } from "../../../../utils/toast";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import { uiKitStore } from "../../../../utils/init";

export default {
  name: "AddTeamManagerModal",
  components: { Modal, PersonSelect, Input, Avatar, Appellation },
  props: {
    visible: { type: Boolean, default: false },
    teamId: { type: String, required: true },
  },
  data() {
    return {
      personListRaw: [],
      searchKey: "",
      selectedAccounts: [],
      uninstallTeamMemberWatch: null,
    };
  },
  computed: {
    filteredPersonList() {
      const key = (this.searchKey || "").trim().toLowerCase();
      if (!key) return this.personListRaw;
      return this.personListRaw.filter((p) => {
        const name = (
          uiKitStore?.uiStore.getAppellation({
            account: p.accountId,
            teamId: this.teamId,
          }) || ""
        ).toLowerCase();
        return name.includes(key);
      });
    },
    personListToRender() {
      return this.filteredPersonList || [];
    },
  },
  methods: {
    t,
    handleClose() {
      this.$emit("close");
      this.$emit("update:visible", false);
    },
    onSearchChange(val) {
      this.searchKey = val;
    },
    onSelectedUpdate(next) {
      const visibleIds = new Set(
        (this.filteredPersonList || []).map((p) => p.accountId)
      );
      const preserved = this.selectedAccounts.filter(
        (id) => !visibleIds.has(id)
      );
      this.selectedAccounts = Array.from(
        new Set([...preserved, ...(next || [])])
      );
    },
    removeSelected(accountId) {
      this.selectedAccounts = this.selectedAccounts.filter(
        (id) => id !== accountId
      );
    },
    onOk: debounce(async function () {
      const selected = [...this.selectedAccounts];
      const members =
        (uiKitStore && uiKitStore.teamMemberStore.getTeamMember(this.teamId)) ||
        [];
      const teamManagerAccounts = members
        .filter(
          (item) =>
            item.memberRole ===
            V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER
        )
        .map((item) => item.accountId);

      const add = selected.filter((acc) => !teamManagerAccounts.includes(acc));
      const remove = teamManagerAccounts.filter(
        (acc) => !selected.includes(acc)
      );

      if (add.length === 0 && remove.length === 0) {
        this.handleClose();
        return;
      }

      try {
        if (add.length) {
          await uiKitStore.teamStore.updateTeamMemberRoleActive({
            teamId: this.teamId,
            accounts: add,
            role: V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER,
          });
        }
        if (remove.length) {
          await uiKitStore.teamStore.updateTeamMemberRoleActive({
            teamId: this.teamId,
            accounts: remove,
            role: V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_NORMAL,
          });
        }
        toast.success(t("updateTeamManagerSuccessText"));
        this.$emit("success");
        this.handleClose();
      } catch (error) {
        const code = error && error.code;
        if (code === 191004) {
          toast.error(t("userNotInTeam"));
        } else if (code === 109432) {
          toast.error(t("noPermission"));
        } else {
          toast.error(t("updateTeamFailedText"));
        }
      }
    }, 500),
  },
  mounted() {
    this.uninstallTeamMemberWatch = autorun(() => {
      const members =
        (uiKitStore && uiKitStore.teamMemberStore.getTeamMember(this.teamId)) ||
        [];
      const items = members
        .filter(
          (m) =>
            m.memberRole !==
            V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_OWNER
        )
        .map((m) => ({
          accountId: m.accountId,
          teamId: this.teamId,
          checked:
            m.memberRole ===
            V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER,
        }));

      this.selectedAccounts = items
        .filter((i) => i.checked)
        .map((i) => i.accountId);
      this.personListRaw = items;
    });
  },
  beforeDestroy() {
    if (this.uninstallTeamMemberWatch) {
      this.uninstallTeamMemberWatch();
      this.uninstallTeamMemberWatch = null;
    }
  },
};
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
  max-width: 300px;
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
