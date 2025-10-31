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
        <Switch
          :checked="
            team?.chatBannedMode !==
            V2NIMConst.V2NIMTeamChatBannedMode.V2NIM_TEAM_CHAT_BANNED_MODE_UNBAN
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
      :teamId="props.teamId"
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

<script lang="ts" setup>
import Empty from "../../../../CommonComponents/Empty.vue";
import Avatar from "../../../../CommonComponents/Avatar.vue";
import Picker from "../../../../CommonComponents/Picker.vue";
import Switch from "../../../../CommonComponents/Switch.vue";
import UserCardModal from "../../../../CommonComponents/UserCardModal.vue";
import { showToast } from "../../../../utils/toast";
import { ref, computed, onMounted, onUnmounted, getCurrentInstance } from "vue";
import { autorun } from "mobx";
import { t } from "../../../../utils/i18n";
import { ALLOW_AT } from "../../../../utils/constants";
import {
  V2NIMTeam,
  V2NIMTeamMember,
} from "nim-web-sdk-ng/dist/esm/nim/src/V2NIMTeamService";
import { YxServerExt } from "@xkit-yx/im-store-v2/dist/types/types";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import RootStore from "@xkit-yx/im-store-v2";
import AddTeamManagerModal from "./add-team-manager-modal.vue";
import { toast } from "../../../../utils/toast";

interface Props {
  teamId: string;
  isTeamOwner: boolean;
  isTeamManager: boolean;
}
const props = defineProps<Props>();

const { proxy } = getCurrentInstance()!;

const store = proxy?.$UIKitStore as RootStore;

const teamManagerVisible = proxy?.$UIKitStore.localOptions.teamManagerVisible;

const rangeArr = [
  {
    label: teamManagerVisible
      ? t("teamOwnerAndManagerText")
      : t("onlyTeamOwner"),
    value: "manager",
  },
  {
    label: t("teamAll"),
    value: "all",
  },
];

const team = ref<V2NIMTeam>();
const teamMembers = ref<V2NIMTeamMember[]>([]);
const addManagerModalVisible = ref(false);

// 群管理员名片
const showUserCard = ref(false);
const selectedAccount = ref("");

const teamManagerList = computed(() => {
  return teamMembers.value.filter(
    (item) =>
      item.memberRole ===
      V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER
  );
});

const updateTeamMode = computed(() => {
  return {
    value:
      team.value?.updateInfoMode ===
      V2NIMConst.V2NIMTeamUpdateInfoMode.V2NIM_TEAM_UPDATE_INFO_MODE_MANAGER
        ? "manager"
        : "all",
    text:
      team.value?.updateInfoMode ===
      V2NIMConst.V2NIMTeamUpdateInfoMode.V2NIM_TEAM_UPDATE_INFO_MODE_MANAGER
        ? t("teamOwnerAndManagerText")
        : t("teamAll"),
  };
});

const inviteMode = computed(() => {
  return {
    value:
      team.value?.inviteMode ===
      V2NIMConst.V2NIMTeamInviteMode.V2NIM_TEAM_INVITE_MODE_MANAGER
        ? "manager"
        : "all",
    text:
      team.value?.inviteMode ===
      V2NIMConst.V2NIMTeamInviteMode.V2NIM_TEAM_INVITE_MODE_MANAGER
        ? t("teamOwnerAndManagerText")
        : t("teamAll"),
  };
});

const teamAtMode = computed(() => {
  let ext: YxServerExt = {};
  try {
    ext = JSON.parse(team.value?.serverExtension || "{}");
  } catch (error) {}
  return {
    value: ext[ALLOW_AT] === "manager" ? "manager" : "all",
    text:
      ext[ALLOW_AT] === "manager" ? t("teamOwnerAndManagerText") : t("teamAll"),
  };
});

// 群禁言
const setTeamChatBanned = async (value) => {
  const checked = value;
  try {
    await store.teamStore.setTeamChatBannedActive({
      teamId: props.teamId,
      chatBannedMode: checked
        ? V2NIMConst.V2NIMTeamChatBannedMode
            .V2NIM_TEAM_CHAT_BANNED_MODE_BANNED_NORMAL
        : V2NIMConst.V2NIMTeamChatBannedMode.V2NIM_TEAM_CHAT_BANNED_MODE_UNBAN,
    });
  } catch (error: any) {
    switch (error?.code) {
      // 无权限
      case 109432:
        toast.info(t("noPermission"));
        break;
      default:
        toast.info(
          checked ? t("muteAllTeamFailedText") : t("sessionUnMuteFailText")
        );
        break;
    }
  }
};

const onUpdateTeamMode = (e: any) => {
  onUpdateTeamInfo("updateInfoMode", e.detail.value);
};

const onUpdateInviteMode = (e: any) => {
  onUpdateTeamInfo("inviteMode", e.detail.value);
};

const onUpdateExt = (e: any) => {
  if (!(props.isTeamManager || props.isTeamOwner)) {
    showToast({
      message: t("noPermission"),
      type: "error",
    });
    return;
  }
  onUpdateTeamInfo("serverExtension", e.detail.value);
};

const onUpdateTeamInfo = async (
  key: keyof V2NIMTeam,
  value: "manager" | "all"
) => {
  const params: Partial<V2NIMTeam> = {
    teamId: props.teamId,
  };
  switch (key) {
    case "updateInfoMode":
      params.updateInfoMode =
        value === "all"
          ? V2NIMConst.V2NIMTeamUpdateInfoMode.V2NIM_TEAM_UPDATE_INFO_MODE_ALL
          : V2NIMConst.V2NIMTeamUpdateInfoMode
              .V2NIM_TEAM_UPDATE_INFO_MODE_MANAGER;
      break;
    case "inviteMode":
      params.inviteMode =
        value === "all"
          ? V2NIMConst.V2NIMTeamInviteMode.V2NIM_TEAM_INVITE_MODE_ALL
          : V2NIMConst.V2NIMTeamInviteMode.V2NIM_TEAM_INVITE_MODE_MANAGER;
      break;
    case "serverExtension": {
      let ext: YxServerExt = {};
      try {
        ext = JSON.parse(team.value?.serverExtension || "{}");
      } catch (error) {
        //
      }
      ext[ALLOW_AT] = value;
      params.serverExtension = JSON.stringify(ext);
      break;
    }
  }

  try {
    await store.teamStore.updateTeamActive({
      teamId: props.teamId,
      info: params,
    });
  } catch (error: any) {
    switch (error?.code) {
      // 无权限
      case 109432:
        showToast({
          message: t("noPermission"),
          type: "error",
        });

        break;
      default:
        showToast({
          message: t("updateTeamFailedText"),
          type: "error",
        });

        break;
    }
  }
};

let uninstallTeamWatch = () => {};

onMounted(() => {
  const teamId = props.teamId;
  uninstallTeamWatch = autorun(() => {
    if (teamId) {
      team.value = store.teamStore.teams.get(teamId);
      teamMembers.value = store.teamMemberStore.getTeamMember(teamId);
    }
  });
});

onUnmounted(() => {
  uninstallTeamWatch();
});

const openAddManagerModal = () => {
  addManagerModalVisible.value = true;
};

// 刷新群成员以更新管理员列表
const refreshTeamMembers = async () => {
  try {
    const res = await store.teamMemberStore.getTeamMemberActive({
      teamId: props.teamId,
      queryOption: {
        limit: Math.max(team.value?.memberLimit || 0, 200),
        roleQueryType: 0,
      },
    });
    teamMembers.value = res?.memberList || [];
  } catch (e) {
    // ignore
  }
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
  max-height: 80px;
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
