<template>
  <div>
    <Drawer
      v-model:visible="drawerVisible"
      placement="right"
      :width="360"
      :showDefaultFooter="false"
      :showHeader="true"
      :offsetRight="52"
      :offsetTop="96"
      :showMask="true"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    >
      <template #header>
        <div class="custom-header" @click="onChangeSubPath('team-setting')">
          <Icon v-if="path !== 'team-setting'" type="icon-zuojiantou"></Icon>
          <span class="header-title">{{ title }}</span>
        </div>
      </template>
      <div
        v-if="
          conversationType ==
          V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
        "
        class="chat-setting-content"
      >
        <!-- 群设置主页 -->
        <TeamSetting
          v-if="path === 'team-setting'"
          :teamId="to"
          :team="team"
          :isTeamManager="isTeamManager"
          :isTeamOwner="isTeamOwner"
          :nickInTeam="nickInTeam"
          :teamMembers="teamMembers"
          :teamMuteMode="teamMuteMode"
          :conversation="conversation"
          :isDiscussion="isDiscussion"
          @onChangeTeamMute="changeTeamMute"
          @onChangeSubPath="onChangeSubPath"
          @onChangeNickInTeam="onChangeNickInTeam"
          @saveNickInTeam="saveNickInTeam"
          @closeDrawer="drawerVisible = false"
        />
        <!-- 群资料设置 -->
        <TeamInfoSetting
          v-else-if="path === 'team-info'"
          :teamId="to"
          :team="team"
          :isTeamManager="isTeamManager"
          :isTeamOwner="isTeamOwner"
          :teamMembers="teamMembers"
          :isDiscussion="isDiscussion"
          @onChangeSubPath="onChangeSubPath"
        />
        <!-- 群成员设置 -->
        <TeamMember
          v-else-if="path === 'team-member'"
          :teamId="to"
          :isDiscussion="isDiscussion"
          @onChangeSubPath="onChangeSubPath"
        />
        <!-- 群管理 -->
        <TeamManagement
          v-else-if="path === 'team-management'"
          :teamId="to"
          :isTeamManager="isTeamManager"
          :isTeamOwner="isTeamOwner"
          @onChangeSubPath="onChangeSubPath"
        />
      </div>
      <div v-else>
        <P2pSetting :accountId="to" />
      </div>
    </Drawer>
  </div>
</template>

<script lang="ts" setup>
/** 聊天设置 */
import { ref, computed, getCurrentInstance, onMounted, onUnmounted } from "vue";
import { t } from "../../utils/i18n";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import TeamSetting from "./team/index.vue";
import TeamInfoSetting from "./team/team-info-setting.vue";
import TeamMember from "./team/team-member.vue";
import TeamManagement from "./team/management/index.vue";
import Drawer from "../../CommonComponents/Drawer.vue";
import Icon from "../../CommonComponents/Icon.vue";
import P2pSetting from "./p2p/index.vue";
import RootStore from "@xkit-yx/im-store-v2";
import type { V2NIMConversationType } from "nim-web-sdk-ng/dist/esm/nim/src/V2NIMConversationService";
import type {
  V2NIMTeam,
  V2NIMTeamMember,
} from "nim-web-sdk-ng/dist/esm/nim/src/V2NIMTeamService";
import type {
  V2NIMConversationForUI,
  V2NIMLocalConversationForUI,
} from "@xkit-yx/im-store-v2/dist/types/types";
import { autorun } from "mobx";
import { toast } from "../../utils/toast";
import { isDiscussionFunc } from "../../utils";

interface Props {
  visible: boolean;
  to: string;
  conversationType: V2NIMConversationType;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  "update:visible": [value: boolean];
}>();

const { proxy } = getCurrentInstance()!;

const store = proxy?.$UIKitStore as RootStore;
const nim = proxy?.$NIM;

// 抽屉可见性
const drawerVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit("update:visible", value),
});

//是否是云端会话
const enableV2CloudConversation = store?.sdkOptions?.enableV2CloudConversation;

// 当前路径
const path = ref<"team-setting" | "team-info" | "team-member">("team-setting");

const handleConfirm = () => {
  emit("update:visible", false);
};

const handleCancel = () => {
  emit("update:visible", false);
};

const title = ref(t("setText"));

// 群昵称
const nickInTeam = ref("");

// 群成员
const teamMembers = ref<V2NIMTeamMember[]>([]);

// 群禁言状态
const teamMuteMode = ref<V2NIMConst.V2NIMTeamMessageMuteMode>();

// 群信息
const team = ref<V2NIMTeam>();

// 是否是群主
const isTeamOwner = computed(() => {
  const myUser = store.userStore.myUserInfo;
  return (
    (team.value ? team.value.ownerAccountId : "") ===
    (myUser ? myUser.accountId : "")
  );
});
/** 是否是讨论组 */
const isDiscussion = computed(() => {
  let serverExtension = team?.value?.serverExtension;
  return isDiscussionFunc(serverExtension) || false;
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

// 当前会话
const conversation = ref<
  V2NIMConversationForUI | V2NIMLocalConversationForUI
>();

// 切换子路径
const onChangeSubPath = (
  value: "team-setting" | "team-info" | "team-member"
) => {
  path.value = value;
  if (path.value == "team-setting") {
    title.value = t("setText");
  } else if (path.value == "team-info") {
    title.value = isDiscussion.value ? t("discussionText") : t("teamInfoText");
  } else if (path.value == "team-member") {
    title.value = isDiscussion.value
      ? t("discussionMemberText")
      : t("teamMemberText");
  } else if (path.value == "team-management") {
    title.value = t("teamManagerText");
  }
};

const onChangeNickInTeam = (nick: string) => {
  nickInTeam.value = nick;
};

const saveNickInTeam = () => {
  store?.teamMemberStore
    .updateMyMemberInfoActive({
      teamId: props.to,
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

// 群免打扰
const changeTeamMute = (value) => {
  const checked = value;

  store.teamStore
    .setTeamMessageMuteModeActive(
      props.to,
      V2NIMConst.V2NIMTeamType.V2NIM_TEAM_TYPE_ADVANCED,
      checked
        ? V2NIMConst.V2NIMTeamMessageMuteMode.V2NIM_TEAM_MESSAGE_MUTE_MODE_ON
        : V2NIMConst.V2NIMTeamMessageMuteMode.V2NIM_TEAM_MESSAGE_MUTE_MODE_OFF
    )
    .then(() => {
      teamMuteMode.value = checked
        ? V2NIMConst.V2NIMTeamMessageMuteMode.V2NIM_TEAM_MESSAGE_MUTE_MODE_ON
        : V2NIMConst.V2NIMTeamMessageMuteMode.V2NIM_TEAM_MESSAGE_MUTE_MODE_OFF;
      toast.success(t("updateBitConfigMaskSuccess"));
    })
    .catch((error: any) => {
      switch (error?.code) {
        // 无权限
        case 109432:
          toast.info(t("noPermission"));
          break;
        default:
          toast.info(t("updateBitConfigMaskFailed"));
          break;
      }
    });
};

// 群信息变更监听
let teamWatch = () => {};
// 群成员变更监听
let teamMemberWatch = () => {};
// 群会话变更监听
let conversationWatch = () => {};

onMounted(() => {
  const teamId = props.to;

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

    teamMembers.value = store?.teamMemberStore.getTeamMember(teamId);
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
    const conversationId =
      nim.V2NIMConversationIdUtil.teamConversationId(teamId);
    conversation.value = enableV2CloudConversation
      ? store.conversationStore?.conversations.get(conversationId)
      : store.localConversationStore?.conversations.get(conversationId);
  });
});

onUnmounted(() => {
  teamWatch();
  teamMemberWatch();
  conversationWatch();
});
</script>

<style scoped>
.custom-header {
  display: flex;
  align-items: center;
  width: 100%;
  cursor: pointer;
}

.header-title {
  font-size: 16px;
  font-weight: bolder;
  color: #333;
  margin-left: 5px;
}
.chat-setting-content {
  height: 100%;
}
</style>
