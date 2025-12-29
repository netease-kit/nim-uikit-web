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
          <div class="team-info-title team-info-title-label">
            {{ isDiscussion ? t("discussionMemberText") : t("teamMemberText") }}
            <div class="team-info-subtitle">
              （{{ team && team.memberCount }}）
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
            v-for="member in teamMembers.slice(0, 10)"
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
    <div v-if="!isDiscussion" class="team-set-card">
      <div class="team-set-item-nick">
        <div class="team-set-item-label">{{ t("nickInTeam") }}</div>
        <Input
          class="nick-input"
          type="text"
          :value="nickInTeam"
          @input="onNickModelValueChange"
          @confirm="onUpdateNick"
          @blur="onUpdateNick"
          @clear="onUpdateNick"
          :maxlength="15"
          placeholder-class="placeholder"
          :showClear="nickInTeam.length > 0"
          :placeholder="t('editNickInTeamText')"
          :inputStyle="{ backgroundColor: '#f1f5f8' }"
        />
      </div>
    </div>
    <div class="team-set-card">
      <div class="team-set-item-flex" v-if="!isDiscussion">
        <div class="team-set-item-label">{{ t("stickTopText") }}</div>
        <NEUIKitSwitch
          :checked="!!conversation?.stickTop"
          @change="changeStickTopInfo"
        />
      </div>
      <div class="team-set-item-flex">
        <div class="team-set-item-label">
          {{
            isDiscussion
              ? t("discussionDoNotDisturbText")
              : t("teamDoNotDisturbText")
          }}
        </div>
        <NEUIKitSwitch
          :checked="
            teamMuteMode ==
            teamMessageMuteModeEnum.V2NIM_TEAM_MESSAGE_MUTE_MODE_ON
          "
          @change="changeTeamMute"
        />
      </div>
    </div>

    <div
      v-if="(isTeamOwner && !isDiscussion) || (isTeamManager && !isDiscussion)"
      class="team-set-card"
      @click="gotoTeamManagement"
    >
      <div class="team-set-item-flex">
        <div class="team-set-item-label">{{ t("teamManagerText") }}</div>
        <Icon iconClassName="more-icon" color="#999" type="icon-jiantou" />
      </div>
    </div>

    <div v-if="isTeamOwner" class="team-set-button" @click="showDismissConfirm">
      {{ isDiscussion ? t("leaveDiscussionTitle") : t("dismissTeamText") }}
    </div>
    <div
      v-else
      class="team-set-button team-leave-button"
      @click="showLeaveConfirm"
    >
      {{ isDiscussion ? t("leaveDiscussionTitle") : t("leaveTeamTitle") }}
    </div>
    <AddTeamMemberModal
      v-if="addModalVisible"
      :visible="addModalVisible"
      :teamId="teamId"
      @close="
        () => {
          addModalVisible = false;
          $emit('closeDrawer');
        }
      "
    />
  </div>
</template>

<script>
import Avatar from "../../../CommonComponents/Avatar.vue";
import Icon from "../../../CommonComponents/Icon.vue";
import NEUIKitSwitch from "../../../CommonComponents/Switch.vue";
import Input from "../../../CommonComponents/Input.vue";
import AddTeamMemberModal from "./add-team-member-modal.vue";
import { modal } from "../../../utils/modal";
import { toast } from "../../../utils/toast";
import { t } from "../../../utils/i18n";
import { nim, uiKitStore } from "../../../utils/init";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
const { V2NIMTeamMessageMuteMode } = V2NIMConst;

export default {
  name: "TeamSetting",
  components: {
    Avatar,
    Icon,
    NEUIKitSwitch,
    Input,
    AddTeamMemberModal,
  },
  props: {
    teamId: { type: String, required: true },
    isTeamOwner: { type: Boolean, default: false },
    isTeamManager: { type: Boolean, default: false },
    team: { type: Object, default: null },
    teamMuteMode: { type: Number, default: undefined },
    teamMembers: { type: Array, default: () => [] },
    nickInTeam: { type: String, default: "" },
    isDiscussion: { type: Boolean, default: false },
    conversation: { type: Object, default: null },
  },
  data() {
    return {
      addModalVisible: false,
    };
  },
  computed: {
    store() {
      return uiKitStore;
    },
    enableV2CloudConversation() {
      return this.store?.sdkOptions?.enableV2CloudConversation;
    },
    teamMessageMuteModeEnum() {
      return V2NIMTeamMessageMuteMode;
    },
    enableAddMember() {
      if (
        (this.team && this.team.inviteMode) ===
        V2NIMConst.V2NIMTeamInviteMode.V2NIM_TEAM_INVITE_MODE_ALL
      ) {
        return true;
      }
      return this.isTeamOwner || this.isTeamManager;
    },
  },
  methods: {
    t,
    onNickModelValueChange(val) {
      this.$emit("onChangeNickInTeam", val);
    },
    onUpdateNick() {
      this.$emit("saveNickInTeam");
    },
    handleInfoClick() {
      this.$emit("onChangeSubPath", "team-info");
    },
    addTeamMember() {
      this.addModalVisible = true;
    },
    gotoTeamMember() {
      this.$emit("onChangeSubPath", "team-member");
    },
    gotoTeamManagement() {
      this.$emit("onChangeSubPath", "team-management");
    },
    showDismissConfirm() {
      if (this.isDiscussion) {
        this.showLeaveDiscussionConfirm();
        return;
      }
      modal.confirm({
        title: t("dismissTeamText"),
        content: t("dismissTeamConfirmText"),
        onConfirm: () => {
          this.store.teamStore
            .dismissTeamActive(this.teamId)
            .then(() => toast.success(t("dismissTeamSuccessText")))
            .catch(() => toast.error(t("dismissTeamFailedText")));
        },
      });
    },
    showLeaveConfirm() {
      if (this.isDiscussion) {
        this.showLeaveDiscussionConfirm();
        return;
      }
      modal.confirm({
        title: t("leaveTeamTitle"),
        content: t("leaveTeamConfirmText"),
        onConfirm: () => {
          this.store.teamStore
            .leaveTeamActive(this.teamId)
            .then(() => toast.success(t("leaveTeamSuccessText")))
            .catch(() => toast.error(t("leaveTeamFailedText")));
        },
      });
    },
    showLeaveDiscussionConfirm() {
      modal.confirm({
        title: t("leaveDiscussionTitle"),
        content: t("leaveDiscussionConfirmText"),
        onConfirm: async () => {
          try {
            if (this.isTeamOwner) {
              const myUser = this.store.userStore.myUserInfo;
              const teamMembersWithoutAiUserAndMySelf = (this.teamMembers || [])
                .filter(
                  (item) =>
                    !(
                      this.store.aiUserStore &&
                      this.store.aiUserStore.aiUsers &&
                      this.store.aiUserStore.aiUsers.has(item.accountId)
                    )
                )
                .filter(
                  (item) => item.accountId !== (myUser && myUser.accountId)
                );

              if (teamMembersWithoutAiUserAndMySelf.length === 0) {
                await this.store.teamStore.dismissTeamActive(this.teamId);
              } else {
                await this.store.teamStore.transferTeamActive({
                  teamId: this.teamId,
                  account: teamMembersWithoutAiUserAndMySelf[0].accountId,
                  leave: true,
                  type: V2NIMConst.V2NIMTeamType.V2NIM_TEAM_TYPE_ADVANCED,
                });
              }
            } else {
              await this.store.teamStore.leaveTeamActive(this.teamId);
            }
            toast.success(t("leaveDiscussionSuccessText"));
          } catch (error) {
            toast.error(t("leaveDiscussionFailedText"));
          }
        },
      });
    },
    changeStickTopInfo(value) {
      const checked = value;
      const conversationId = nim.V2NIMConversationIdUtil.teamConversationId(
        this.teamId
      );
      const run = this.enableV2CloudConversation
        ? (id, c) =>
            this.store.conversationStore &&
            this.store.conversationStore.stickTopConversationActive(id, c)
        : (id, c) =>
            this.store.localConversationStore &&
            this.store.localConversationStore.stickTopConversationActive(id, c);
      run(conversationId, checked).catch(() => {
        toast.info(
          checked ? t("addStickTopFailText") : t("deleteStickTopFailText")
        );
      });
    },
    changeTeamMute(value) {
      this.$emit("onChangeTeamMute", value);
    },
  },
};
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
  cursor: pointer;
}

.team-set-button {
  text-align: center;
  border-radius: 4px;
  color: #f7f7f7;
  background: #ff4d4f;
  height: 32px;
  line-height: 32px;

  width: 88px;
  font-size: 14px;
  position: absolute;
  cursor: pointer;
  left: 50%;
  bottom: 30px;
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

.team-info-title-label {
  font-weight: bolder;
  font-size: 14px;
  display: flex;
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
  margin: 10px 10px 0 0px;
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
