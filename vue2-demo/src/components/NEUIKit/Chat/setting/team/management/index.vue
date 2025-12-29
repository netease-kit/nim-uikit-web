<template>
  <div class="team-set-container">
    <div v-if="teamManagerVisible" class="team-set-card">
      <div class="team-manager-title">
        <div>{{ t("teamManager") }}</div>
        <div
          v-if="isTeamOwner"
          class="team-manager-subtitle"
          @click="openAddManagerModal"
        >
          {{ t("teamManagerSelect") + " >" }}
        </div>
      </div>
      <div v-if="teamManagerList.length" class="team-manager-list">
        <div
          class="team-manager-item"
          v-for="item in teamManagerList"
          :key="item.accountId"
          @click="selectedAccount = item.accountId"
        >
          <Avatar :account="item.accountId" :team-id="item.teamId" size="36" />
        </div>
      </div>
      <Empty :text="t('noTeamManager')" v-else />
    </div>
    <div class="team-set-card">
      <div class="team-set-item">
        <div class="team-set-item-label">
          {{ t("teamManagerEditInfoText") }}
        </div>
        <Picker
          :value="updateTeamMode.value"
          :range="rangeArr"
          @change="onUpdateTeamMode"
        />
      </div>

      <div class="team-set-item">
        <div class="team-set-item-label">{{ t("updateTeamInviteText") }}</div>
        <Picker
          :value="inviteMode.value"
          :range="rangeArr"
          @change="onUpdateInviteMode"
        />
      </div>

      <div class="team-set-item">
        <div class="team-set-item-label">{{ t("updateTeamAtText") }}</div>
        <Picker
          :value="teamAtMode.value"
          :range="rangeArr"
          @change="onUpdateExt"
        />
      </div>
      <div class="team-set-item team-set-item-flex">
        <div class="team-set-item-label">{{ t("teamBannedText") }}</div>
        <NEUIKitSwitch
          :checked="
            team?.chatBannedMode !==
            V2NIMTeamChatBannedModeEnum.V2NIM_TEAM_CHAT_BANNED_MODE_UNBAN
          "
          :disabled="!(isTeamOwner || isTeamManager)"
          @change="setTeamChatBanned"
        />
      </div>
    </div>
    <!-- 添加管理员弹窗 -->
    <AddTeamManagerModal
      v-if="addManagerModalVisible"
      :visible="addManagerModalVisible"
      :teamId="teamId"
      @update:visible="(v) => (addManagerModalVisible = v)"
      @success="refreshTeamMembers"
    />
    <UserCardModal
      v-if="!!selectedAccount"
      :visible="!!selectedAccount"
      :account="selectedAccount"
      @close="selectedAccount = ''"
    />
  </div>
</template>

<script>
import Empty from "../../../../CommonComponents/Empty.vue";
import Avatar from "../../../../CommonComponents/Avatar.vue";
import Picker from "../../../../CommonComponents/Picker.vue";
import NEUIKitSwitch from "../../../../CommonComponents/Switch.vue";
import UserCardModal from "../../../../CommonComponents/UserCardModal.vue";
import { showToast } from "../../../../utils/toast";
import { autorun } from "mobx";
import { t } from "../../../../utils/i18n";
import { ALLOW_AT } from "../../../../utils/constants";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import AddTeamManagerModal from "./add-team-manager-modal.vue";
import { toast } from "../../../../utils/toast";
import { uiKitStore } from "../../../../utils/init";
const { V2NIMTeamChatBannedMode } = V2NIMConst;
export default {
  name: "TeamManagementSetting",
  components: {
    Empty,
    Avatar,
    Picker,
    NEUIKitSwitch,
    UserCardModal,
    AddTeamManagerModal,
  },
  props: {
    teamId: { type: String, required: true },
    isTeamOwner: { type: Boolean, default: false },
    isTeamManager: { type: Boolean, default: false },
  },
  data() {
    return {
      team: null,
      teamMembers: [],
      addManagerModalVisible: false,
      showUserCard: false,
      selectedAccount: "",
      uninstallTeamWatch: null,
    };
  },
  computed: {
    store() {
      return uiKitStore;
    },
    V2NIMTeamChatBannedModeEnum() {
      return V2NIMTeamChatBannedMode;
    },
    teamManagerVisible() {
      return this.store?.localOptions?.teamManagerVisible;
    },
    rangeArr() {
      return [
        {
          label: this.teamManagerVisible
            ? t("teamOwnerAndManagerText")
            : t("onlyTeamOwner"),
          value: "manager",
        },
        { label: t("teamAll"), value: "all" },
      ];
    },
    teamManagerList() {
      return (this.teamMembers || []).filter(
        (item) =>
          item.memberRole ===
          V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER
      );
    },
    updateTeamMode() {
      const mode = this.team && this.team.updateInfoMode;
      const isManager =
        mode ===
        V2NIMConst.V2NIMTeamUpdateInfoMode.V2NIM_TEAM_UPDATE_INFO_MODE_MANAGER;
      return {
        value: isManager ? "manager" : "all",
        text: isManager ? t("teamOwnerAndManagerText") : t("teamAll"),
      };
    },
    inviteMode() {
      const mode = this.team && this.team.inviteMode;
      const isManager =
        mode === V2NIMConst.V2NIMTeamInviteMode.V2NIM_TEAM_INVITE_MODE_MANAGER;
      return {
        value: isManager ? "manager" : "all",
        text: isManager ? t("teamOwnerAndManagerText") : t("teamAll"),
      };
    },
    teamAtMode() {
      let ext = {};
      try {
        ext = JSON.parse((this.team && this.team.serverExtension) || "{}");
      } catch (e) {
        console.error(e);
      }
      const isManager = ext[ALLOW_AT] === "manager";
      return {
        value: isManager ? "manager" : "all",
        text: isManager ? t("teamOwnerAndManagerText") : t("teamAll"),
      };
    },
  },
  methods: {
    t,
    setTeamChatBanned(value) {
      const checked = value;
      this.store.teamStore
        .setTeamChatBannedActive({
          teamId: this.teamId,
          chatBannedMode: checked
            ? V2NIMConst.V2NIMTeamChatBannedMode
                .V2NIM_TEAM_CHAT_BANNED_MODE_BANNED_NORMAL
            : V2NIMConst.V2NIMTeamChatBannedMode
                .V2NIM_TEAM_CHAT_BANNED_MODE_UNBAN,
        })
        .catch((error) => {
          const code = error && error.code;
          if (code === 109432) {
            toast.info(t("noPermission"));
          } else {
            toast.info(
              checked ? t("muteAllTeamFailedText") : t("sessionUnMuteFailText")
            );
          }
        });
    },
    onUpdateTeamMode(e) {
      this.onUpdateTeamInfo("updateInfoMode", e && e.detail && e.detail.value);
    },
    onUpdateInviteMode(e) {
      this.onUpdateTeamInfo("inviteMode", e && e.detail && e.detail.value);
    },
    onUpdateExt(e) {
      if (!(this.isTeamManager || this.isTeamOwner)) {
        showToast({ message: t("noPermission"), type: "error" });
        return;
      }
      this.onUpdateTeamInfo("serverExtension", e && e.detail && e.detail.value);
    },
    onUpdateTeamInfo(key, value) {
      const params = { teamId: this.teamId };
      if (key === "updateInfoMode") {
        params.updateInfoMode =
          value === "all"
            ? V2NIMConst.V2NIMTeamUpdateInfoMode.V2NIM_TEAM_UPDATE_INFO_MODE_ALL
            : V2NIMConst.V2NIMTeamUpdateInfoMode
                .V2NIM_TEAM_UPDATE_INFO_MODE_MANAGER;
      } else if (key === "inviteMode") {
        params.inviteMode =
          value === "all"
            ? V2NIMConst.V2NIMTeamInviteMode.V2NIM_TEAM_INVITE_MODE_ALL
            : V2NIMConst.V2NIMTeamInviteMode.V2NIM_TEAM_INVITE_MODE_MANAGER;
      } else if (key === "serverExtension") {
        let ext = {};
        try {
          ext = JSON.parse((this.team && this.team.serverExtension) || "{}");
        } catch (e) {
          console.log("onUpdateExt error", e);
        }
        ext[ALLOW_AT] = value;
        params.serverExtension = JSON.stringify(ext);
      }

      this.store.teamStore
        .updateTeamActive({ teamId: this.teamId, info: params })
        .catch((error) => {
          const code = error && error.code;
          if (code === 109432) {
            showToast({ message: t("noPermission"), type: "error" });
          } else {
            showToast({ message: t("updateTeamFailedText"), type: "error" });
          }
        });
    },
    openAddManagerModal() {
      this.addManagerModalVisible = true;
    },
    async refreshTeamMembers() {
      try {
        const res = await this.store.teamMemberStore.getTeamMemberActive({
          teamId: this.teamId,
          queryOption: {
            limit: Math.max((this.team && this.team.memberLimit) || 0, 200),
            roleQueryType: 0,
          },
        });
        this.teamMembers = (res && res.memberList) || [];
      } catch (e) {
        console.log("refreshTeamMembers error", e);
      }
    },
  },
  mounted() {
    this.uninstallTeamWatch = autorun(() => {
      const id = this.teamId;
      if (id) {
        this.team = this.store.teamStore.teams.get(id);
        this.teamMembers = this.store.teamMemberStore.getTeamMember(id) || [];
      }
    });
  },
  beforeDestroy() {
    if (this.uninstallTeamWatch) {
      this.uninstallTeamWatch();
      this.uninstallTeamWatch = null;
    }
  },
};
</script>

<style scoped>
.team-set-container {
  box-sizing: border-box;
  padding: 10px 20px;
}

.team-set-card {
  background: #ffffff;
  margin-bottom: 10px;
}

.team-set-item-label {
  margin-bottom: 5px;
}

.team-set-item {
  font-size: 14px;
  color: #000;
  margin-bottom: 15px;
}

.team-set-item-flex {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0 5px 5px;
}

.more-icon {
  margin: 0 5px;
}

.team-manager-title {
  width: 100%;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  height: 32px;
  align-items: center;
  color: #000;
  cursor: pointer;
}

.team-manager-subtitle {
  font-size: 13px;
  color: #2a6bf2;
  height: 32px;
  line-height: 32px;
}

.team-manager-list {
  margin-right: 30px;
  overflow-y: auto;
  max-height: 90px;
  display: flex;
  flex-wrap: wrap; /* 开启换行 */
}

.team-members-info {
  height: 40px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
}

.team-manager-item {
  width: 40px;
  height: 40px;
  padding: 3px;
  margin: 0 3px;
  cursor: pointer;
}

.team-info-subtitle {
  color: #999999;
}

.member-add {
  width: 32px;
  height: 32px;
  border-radius: 100%;
  border: 1px dashed #999999;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  flex-shrink: 0;
}

.member-item {
  margin-right: 10px;
  display: inline-block;
  flex-shrink: 0;
}
</style>
