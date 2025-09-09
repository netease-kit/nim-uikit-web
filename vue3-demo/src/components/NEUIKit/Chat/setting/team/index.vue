<template>
  <div class="team-set-container">
    <div class="team-set-card" v-if="team">
      <div class="team-info-item" @click="handleInfoClick">
        <Avatar
          :account="team && team.teamId"
          :avatar="team && team.avatar"
          size="36"
        />
        <div class="team-info-title team-title">
          {{ team && team.name }}
        </div>
        <Icon iconClassName="more-icon" color="#999" type="icon-jiantou" />
      </div>
    </div>
    <div class="team-set-card">
      <div class="team-members-item">
        <div class="team-members-info-item" @click="gotoTeamMember">
          <div class="team-members-info">
            <div class="team-info-title team-set-item-label">
              {{ t("teamMemberText") }}
            </div>
            <div class="team-info-subtitle">
              {{ team && team.memberCount }}
            </div>
          </div>
          <Icon iconClassName="more-icon" color="#999" type="icon-jiantou" />
        </div>
        <div class="member-list">
          <div v-if="enableAddMember" @click="addTeamMember" class="member-add">
            <div :style="{ display: 'flex' }">
              <Icon type="icon-tianjiaanniu" />
            </div>
          </div>
          <div
            class="member-item"
            v-for="member in teamMembers"
            :key="member.accountId"
          >
            <Avatar
              :account="member.accountId"
              size="36"
              :key="member.accountId"
              font-size="10"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="team-set-card">
      <div class="team-set-item-flex">
        <div class="team-set-item-label">{{ t("stickTopText") }}</div>
        <Switch
          :checked="!!conversation?.stickTop"
          @change="changeStickTopInfo"
        />
      </div>
      <div class="team-set-item-flex">
        <div class="team-set-item-label">{{ t("sessionMuteText") }}</div>
        <Switch
          :checked="
            teamMuteMode !==
            V2NIMConst.V2NIMTeamMessageMuteMode.V2NIM_TEAM_MESSAGE_MUTE_MODE_ON
          "
          @change="changeTeamMute"
        />
      </div>
    </div>
    <div class="team-set-card">
      <div class="team-set-item-nick">
        <div class="team-set-item-label">{{ t("nickInTeam") }}</div>
        <Input
          class="nick-input"
          type="text"
          v-model="nickInTeam"
          @input="onNickInputValueChange"
          @confirm="onUpdateNick"
          @blur="onUpdateNick"
          @clear="onUpdateNick"
          :maxlength="15"
          placeholder-class="placeholder"
          :showClear="nickInTeam.length > 0"
          :placeholder="t('editNickInTeamText')"
          :inputStyle="{
            backgroundColor: '#f1f5f8',
          }"
        />
      </div>
    </div>
    <div class="team-set-card" v-if="isTeamOwner || isTeamManager">
      <div class="team-set-item-flex">
        <div class="team-set-item-label">{{ t("teamBannedText") }}</div>
        <Switch
          :checked="
            team?.chatBannedMode !==
            V2NIMConst.V2NIMTeamChatBannedMode.V2NIM_TEAM_CHAT_BANNED_MODE_UNBAN
          "
          @change="setTeamChatBanned"
        />
      </div>
    </div>
    <div class="team-set-button" v-if="isTeamOwner" @click="showDismissConfirm">
      {{ t("dismissTeamText") }}
    </div>
    <div
      class="team-set-button team-leave-button"
      v-else
      @click="showLeaveConfirm"
    >
      {{ t("leaveTeamTitle") }}
    </div>
  </div>
  <AddTeamMemberModal
    v-if="addModalVisible"
    :visible="addModalVisible"
    :teamId="props.teamId"
    @close="() => (addModalVisible = false)"
  ></AddTeamMemberModal>
</template>

<script lang="ts" setup>
/** 群设置组件 */
import Avatar from "../../../CommonComponents/Avatar.vue";
import Icon from "../../../CommonComponents/Icon.vue";
import { ref, computed, onUnmounted, getCurrentInstance } from "vue";
import { autorun } from "mobx";
import { t } from "../../../utils/i18n";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import type {
  V2NIMTeam,
  V2NIMTeamMember,
} from "nim-web-sdk-ng/dist/esm/nim/src/V2NIMTeamService";
import type {
  V2NIMConversationForUI,
  V2NIMLocalConversationForUI,
} from "@xkit-yx/im-store-v2/dist/types/types";
import RootStore from "@xkit-yx/im-store-v2";
import { onMounted } from "vue";
import Switch from "../../../CommonComponents/Switch.vue";
import Input from "../../../CommonComponents/Input.vue";
import AddTeamMemberModal from "./add-team-member-modal.vue";
import { modal } from "../../../utils/modal";
import { toast } from "../../../utils/toast";

interface Props {
  teamId: string;
}

const props = defineProps<Props>();

const emit = defineEmits(["onChangeSubPath"]);

const { proxy } = getCurrentInstance()!;

const store = proxy?.$UIKitStore as RootStore;
const nim = proxy?.$NIM;
// 群成员
const teamMembers = ref<V2NIMTeamMember[]>([]);
// 当前会话
const conversation = ref<
  V2NIMConversationForUI | V2NIMLocalConversationForUI
>();
// 群信息
const team = ref<V2NIMTeam>();
// 群禁言状态
const teamMuteMode = ref<V2NIMConst.V2NIMTeamMessageMuteMode>();
// 群昵称
const nickInTeam = ref("");
// 添加群成员
const addModalVisible = ref(false);

//是否是云端会话
const enableV2CloudConversation = store?.sdkOptions?.enableV2CloudConversation;
// 是否是群主
const isTeamOwner = computed(() => {
  const myUser = store.userStore.myUserInfo;
  return (
    (team.value ? team.value.ownerAccountId : "") ===
    (myUser ? myUser.accountId : "")
  );
});
// 是否是群管理员
const isTeamManager = computed(() => {
  const myUser = store.userStore.myUserInfo;
  return teamMembers.value
    .filter(
      (item) =>
        //@ts-ignore
        item.memberRole ===
        V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER
    )
    .some((member) => member.accountId === (myUser ? myUser.accountId : ""));
});
// 是否可以添加群成员
const enableAddMember = computed(() => {
  if (
    team.value?.inviteMode ===
    V2NIMConst.V2NIMTeamInviteMode.V2NIM_TEAM_INVITE_MODE_ALL
  ) {
    return true;
  }
  return isTeamOwner.value || isTeamManager.value;
});
// 群昵称输入框
const onNickInputValueChange = (event) => {
  nickInTeam.value = event.target.value;
};
// 更新群昵称
const onUpdateNick = () => {
  store?.teamMemberStore
    .updateMyMemberInfoActive({
      teamId: props.teamId,
      memberInfo: {
        teamNick: nickInTeam.value.trim(),
      },
    })
    .then(() => {
      toast.success(t("updateTeamSuccessText"));
    })
    .catch(() => {
      toast.info(t("saveFailedText"));
    });
};
// 跳转至群详情
const handleInfoClick = () => {
  emit("onChangeSubPath", "team-info");
};
// 添加群成员
const addTeamMember = () => {
  addModalVisible.value = true;
};
// 跳转至群成员
const gotoTeamMember = () => {
  emit("onChangeSubPath", "team-member");
};
// 解散群
const showDismissConfirm = () => {
  modal.confirm({
    title: t("dismissTeamText"),
    content: t("dismissTeamConfirmText"),
    onConfirm: () => {
      store.teamStore
        .dismissTeamActive(props.teamId)
        .then(() => {
          toast.success(t("dismissTeamSuccessText"));
        })
        .catch(() => {
          toast.error(t("dismissTeamFailedText"));
        });
    },
  });
};
// 退出群
const showLeaveConfirm = () => {
  modal.confirm({
    title: t("leaveTeamTitle"),
    content: t("leaveTeamConfirmText"),
    onConfirm: () => {
      store.teamStore
        .leaveTeamActive(props.teamId)
        .then(() => {
          toast.success(t("leaveTeamSuccessText"));
        })
        .catch(() => {
          toast.error(t("leaveTeamFailedText"));
        });
    },
  });
};

// 群会话置顶
const changeStickTopInfo = async (value) => {
  const checked = value;
  const conversationId = nim.V2NIMConversationIdUtil.teamConversationId(
    props.teamId
  );
  try {
    if (enableV2CloudConversation) {
      await store.conversationStore?.stickTopConversationActive(
        conversationId,
        checked
      );
    } else {
      await store.localConversationStore?.stickTopConversationActive(
        conversationId,
        checked
      );
    }
  } catch (error) {
    toast.info(
      checked ? t("addStickTopFailText") : t("deleteStickTopFailText")
    );
  }
};

// 群免打扰
const changeTeamMute = (value) => {
  const checked = value;

  store.teamStore
    .setTeamMessageMuteModeActive(
      props.teamId,
      V2NIMConst.V2NIMTeamType.V2NIM_TEAM_TYPE_ADVANCED,
      checked
        ? V2NIMConst.V2NIMTeamMessageMuteMode.V2NIM_TEAM_MESSAGE_MUTE_MODE_OFF
        : V2NIMConst.V2NIMTeamMessageMuteMode.V2NIM_TEAM_MESSAGE_MUTE_MODE_ON
    )
    .then(() => {
      teamMuteMode.value = checked
        ? V2NIMConst.V2NIMTeamMessageMuteMode.V2NIM_TEAM_MESSAGE_MUTE_MODE_OFF
        : V2NIMConst.V2NIMTeamMessageMuteMode.V2NIM_TEAM_MESSAGE_MUTE_MODE_ON;
    })
    .catch((error: any) => {
      switch (error?.code) {
        // 无权限
        case 109432:
          toast.info(t("noPermission"));
          break;
        default:
          toast.info(
            checked ? t("sessionMuteFailText") : t("sessionUnMuteFailText")
          );
          break;
      }
    });
};

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
// 群信息变更监听
let teamWatch = () => {};
// 群会话变更监听
let conversationWatch = () => {};
// 群成员变更监听
let teamMemberWatch = () => {};

onMounted(() => {
  const teamId = props.teamId;
  const conversationId = nim.V2NIMConversationIdUtil.teamConversationId(teamId);

  // 查询当前群是否开启免打扰
  store.teamStore
    .getTeamMessageMuteModeActive(teamId, 1)
    .then((res: V2NIMConst.V2NIMTeamMessageMuteMode) => {
      teamMuteMode.value = res;
    });

  // 我在群里的昵称
  teamMemberWatch = autorun(() => {
    nickInTeam.value =
      store?.teamMemberStore.getTeamMember(teamId, [
        store?.userStore.myUserInfo.accountId,
      ])?.[0]?.teamNick || "";
  });

  teamWatch = autorun(() => {
    if (teamId) {
      team.value = store.teamStore.teams.get(teamId);
      store.teamMemberStore
        .getTeamMemberActive({
          teamId: teamId,
          queryOption: {
            limit: 200,
            roleQueryType: 0,
          },
        })
        .then((res) => {
          teamMembers.value = res?.memberList || [];
        });
    }
  });

  conversationWatch = autorun(() => {
    conversation.value = enableV2CloudConversation
      ? store.conversationStore?.conversations.get(conversationId)
      : store.localConversationStore?.conversations.get(conversationId);
  });
});

onUnmounted(() => {
  teamWatch();
  conversationWatch();
  teamMemberWatch();
});
</script>

<style scoped>
.team-set-container {
  height: 100%;
  box-sizing: border-box;
}

.team-title {
  margin-left: 10px;
  font-size: 14px;
}

.team-set-card {
  background: #ffffff;
  padding: 0 16px;
  margin-bottom: 10px;
  color: #000;
  border-bottom: 1px solid #e4e9f2;
}

.team-set-button {
  text-align: center;
  border-radius: 4px;
  color: #f7f7f7;
  background: #ff4d4f;
  height: 32px;
  line-height: 32px;
  margin-top: 40px;
  width: 88px;
  font-size: 14px;
  position: relative;
  cursor: pointer;
  left: 50%;
  transform: translateX(-50%);
}

.team-set-item-flex {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  font-size: 14px;
  font-weight: bolder;
}

.nick-input {
  height: 32px;
  margin: 16px 0px;
}

.team-set-item-label {
  font-weight: bolder;
  font-size: 14px;
}
.more-icon {
  color: #999999;
}

.team-info-item {
  height: 70px;
  display: flex;
  align-items: center;
}
.team-info-title {
  font-size: 14px;
  width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.team-members-item {
  height: 90px;
}

.team-members-info-item {
  display: flex;
  align-items: center;
}

.team-members-info {
  height: 40px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
}
.team-info-subtitle {
  color: #999999;
  margin-right: 10px;
}

.member-list {
  white-space: nowrap;
  overflow-x: hidden;
  margin-right: 10px;
  padding-bottom: 5px;
  height: 50px;
  display: flex;
  align-items: center;
}

.member-add {
  width: 36px;
  height: 36px;
  border-radius: 100%;
  cursor: pointer;
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
