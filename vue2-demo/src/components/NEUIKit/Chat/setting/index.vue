<template>
  <div>
    <Drawer
      :visible="visible"
      @update:visible="handleUpdateVisible"
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
          conversationType == conversationTypeEnum.V2NIM_CONVERSATION_TYPE_TEAM
        "
        class="chat-setting-content"
      >
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
          @closeDrawer="handleUpdateVisible(false)"
        />
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
        <TeamMember
          v-else-if="path === 'team-member'"
          :teamId="to"
          :isDiscussion="isDiscussion"
          @onChangeSubPath="onChangeSubPath"
        />
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

<script>
import { t } from "../../utils/i18n";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import TeamSetting from "./team/index.vue";
import TeamInfoSetting from "./team/team-info-setting.vue";
import TeamMember from "./team/team-member.vue";
import TeamManagement from "./team/management/index.vue";
import Drawer from "../../CommonComponents/Drawer.vue";
import Icon from "../../CommonComponents/Icon.vue";
import P2pSetting from "./p2p/index.vue";
import { autorun } from "mobx";
import { toast } from "../../utils/toast";
import { isDiscussionFunc } from "../../utils";
import { nim, uiKitStore } from "../../utils/init";

const { V2NIMConversationType } = V2NIMConst;

export default {
  name: "ChatSettingDrawer",
  components: {
    TeamSetting,
    TeamInfoSetting,
    TeamMember,
    TeamManagement,
    Drawer,
    Icon,
    P2pSetting,
  },
  props: {
    visible: { type: Boolean, default: false },
    to: { type: String, required: true },
    conversationType: { type: Number, required: true },
  },
  data() {
    return {
      path: "team-setting",
      title: t("setText"),
      nickInTeam: "",
      teamMembers: [],
      teamMuteMode: undefined,
      team: null,
      conversation: null,
      teamWatch: null,
      teamMemberWatch: null,
      conversationWatch: null,
    };
  },
  computed: {
    store() {
      return uiKitStore;
    },
    conversationTypeEnum() {
      return V2NIMConversationType;
    },
    isTeamOwner() {
      const myUser = this.store.userStore.myUserInfo;
      return (
        (this.team ? this.team.ownerAccountId : "") ===
        (myUser ? myUser.accountId : "")
      );
    },
    isDiscussion() {
      const serverExtension = this.team && this.team.serverExtension;
      return isDiscussionFunc(serverExtension) || false;
    },
    isTeamManager() {
      const myUser = this.store.userStore.myUserInfo;
      return (this.teamMembers || [])
        .filter(
          (item) =>
            item.memberRole ===
            V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER
        )
        .some(
          (member) => member.accountId === (myUser ? myUser.accountId : "")
        );
    },
    enableV2CloudConversation() {
      return this.store?.sdkOptions?.enableV2CloudConversation;
    },
  },
  created() {
    const teamId = this.to;
    this.store.teamStore
      .getTeamMessageMuteModeActive(
        teamId,
        V2NIMConst.V2NIMTeamType.V2NIM_TEAM_TYPE_ADVANCED
      )
      .then((res) => {
        this.teamMuteMode = res;
      });

    this.teamMemberWatch = autorun(() => {
      this.nickInTeam =
        this.store?.teamMemberStore.getTeamMember(teamId, [
          this.store?.userStore.myUserInfo.accountId,
        ])?.[0]?.teamNick || "";
      this.teamMembers =
        this.store?.teamMemberStore.getTeamMember(teamId) || [];
    });

    this.teamWatch = autorun(() => {
      if (
        teamId &&
        this.conversationType ===
          V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
      ) {
        this.team = this.store.teamStore.teams.get(teamId) || null;
        this.store.teamMemberStore
          .getTeamMemberActive({
            teamId: teamId,
            queryOption: {
              limit: Math.max((this.team && this.team.memberLimit) || 0, 200),
              roleQueryType: 0,
            },
          })
          .then((res) => {
            this.teamMembers = (res && res.memberList) || [];
          });
      }
    });

    this.conversationWatch = autorun(() => {
      const conversationId =
        nim.V2NIMConversationIdUtil.teamConversationId(teamId);
      this.conversation = this.enableV2CloudConversation
        ? this.store.conversationStore?.conversations.get(conversationId)
        : this.store.localConversationStore?.conversations.get(conversationId);
      this.teamMuteMode = Number(Boolean(this.conversation?.mute));
    });
  },
  beforeDestroy() {
    if (this.teamWatch) this.teamWatch();
    if (this.teamMemberWatch) this.teamMemberWatch();
    if (this.conversationWatch) this.conversationWatch();
  },
  methods: {
    t,
    handleUpdateVisible(val) {
      this.$emit("update:visible", val);
    },
    handleConfirm() {
      this.$emit("update:visible", false);
    },
    handleCancel() {
      this.$emit("update:visible", false);
    },
    onChangeSubPath(value) {
      this.path = value;
      if (this.path === "team-setting") {
        this.title = t("setText");
      } else if (this.path === "team-info") {
        this.title = this.isDiscussion
          ? t("discussionText")
          : t("teamInfoText");
      } else if (this.path === "team-member") {
        this.title = this.isDiscussion
          ? t("discussionMemberText")
          : t("teamMemberText");
      } else if (this.path === "team-management") {
        this.title = t("teamManagerText");
      }
    },
    onChangeNickInTeam(nick) {
      this.nickInTeam = nick;
    },
    saveNickInTeam() {
      this.store?.teamMemberStore
        .updateMyMemberInfoActive({
          teamId: this.to,
          memberInfo: { teamNick: (this.nickInTeam || "").trim() },
        })
        .then(() => {
          toast.success(t("updateTeamSuccessText"));
        })
        .catch(() => {
          toast.info(t("saveFailedText"));
        });
    },
    changeTeamMute(value) {
      const checked = value;
      this.store.teamStore
        .setTeamMessageMuteModeActive(
          this.to,
          V2NIMConst.V2NIMTeamType.V2NIM_TEAM_TYPE_ADVANCED,
          checked
            ? V2NIMConst.V2NIMTeamMessageMuteMode
                .V2NIM_TEAM_MESSAGE_MUTE_MODE_ON
            : V2NIMConst.V2NIMTeamMessageMuteMode
                .V2NIM_TEAM_MESSAGE_MUTE_MODE_OFF
        )
        .then(() => {
          this.teamMuteMode = checked
            ? V2NIMConst.V2NIMTeamMessageMuteMode
                .V2NIM_TEAM_MESSAGE_MUTE_MODE_ON
            : V2NIMConst.V2NIMTeamMessageMuteMode
                .V2NIM_TEAM_MESSAGE_MUTE_MODE_OFF;
          toast.success(t("updateBitConfigMaskSuccess"));
        })
        .catch((error) => {
          switch (error && error.code) {
            case 109432:
              toast.info(t("noPermission"));
              break;
            default:
              toast.info(t("updateBitConfigMaskFailed"));
              break;
          }
        });
    },
  },
};
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
