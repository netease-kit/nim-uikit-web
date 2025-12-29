<template>
  <div v-if="notificationContent" class="msg-noti">
    {{ notificationContent }}
  </div>
</template>

<script>
import { autorun } from "mobx";
import { ALLOW_AT } from "../../utils/constants";
import { t } from "../../utils/i18n";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import { uiKitStore } from "../../utils/init";

export default {
  name: "MessageNotification",
  props: {
    msg: { type: Object, required: true },
  },
  data() {
    return {
      notificationContent: "",
      V2NIMConst: V2NIMConst,
      store: uiKitStore,
      notificationDispose: null,
    };
  },
  computed: {
    teamId() {
      return this.msg.conversationType ===
        V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
        ? this.msg.receiverId
        : "";
    },
    teamManagerVisible() {
      return this.store?.localOptions?.teamManagerVisible;
    },
  },
  created() {
    this.notificationDispose = autorun(() => {
      this.notificationContent = this.getNotificationContent();
    });
  },
  beforeDestroy() {
    if (this.notificationDispose) this.notificationDispose();
  },
  methods: {
    t,
    getNotificationContent() {
      const attachment = (this.msg && this.msg.attachment) || {};
      switch (attachment.type) {
        case V2NIMConst.V2NIMMessageNotificationType
          .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_UPDATE_TINFO: {
          const team = attachment.updatedTeamInfo || {};
          const content = [];
          if (team.avatar !== undefined) {
            content.push(t("updateTeamAvatar"));
          }
          if (team.name !== undefined) {
            content.push(`${t("updateTeamName")}“${team.name}”`);
          }
          if (team.intro !== undefined) {
            content.push(t("updateTeamIntro"));
          }
          if (team.inviteMode !== undefined) {
            content.push(
              `${t("updateTeamInviteMode")}“${
                team.inviteMode ===
                V2NIMConst.V2NIMTeamInviteMode.V2NIM_TEAM_INVITE_MODE_ALL
                  ? t("teamAll")
                  : this.teamManagerVisible
                  ? t("teamOwnerAndManagerText")
                  : t("teamOwner")
              }”`
            );
          }
          if (team.updateInfoMode !== undefined) {
            content.push(
              `${t("updateTeamUpdateTeamMode")}“${
                team.updateInfoMode ===
                V2NIMConst.V2NIMTeamUpdateInfoMode
                  .V2NIM_TEAM_UPDATE_INFO_MODE_ALL
                  ? t("teamAll")
                  : this.teamManagerVisible
                  ? t("teamOwnerAndManagerText")
                  : t("teamOwner")
              }”`
            );
          }
          if (team.chatBannedMode !== undefined) {
            content.push(
              `${t("updateTeamMute")} ${
                team.chatBannedMode ===
                V2NIMConst.V2NIMTeamChatBannedMode
                  .V2NIM_TEAM_CHAT_BANNED_MODE_UNBAN
                  ? t("closeText")
                  : t("openText")
              }`
            );
          }
          if (team.serverExtension) {
            let ext = {};
            try {
              ext = JSON.parse(team.serverExtension);
            } catch (error) {
              console.error("parse team serverExtension error", error);
            }
            if (ext[ALLOW_AT] !== undefined) {
              content.push(
                `${t("updateAllowAt")}“${
                  ext[ALLOW_AT] === "manager"
                    ? this.teamManagerVisible
                      ? t("teamOwnerAndManagerText")
                      : t("teamOwner")
                    : t("teamAll")
                }”`
              );
            }
          }
          const name = this.store?.uiStore.getAppellation({
            account: this.msg.senderId,
            teamId: this.teamId,
          });
          return content.length ? `${name} ${content.join("、")}` : "";
        }
        case V2NIMConst.V2NIMMessageNotificationType
          .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_APPLY_PASS:
        case V2NIMConst.V2NIMMessageNotificationType
          .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_INVITE_ACCEPT: {
          const name = this.store?.uiStore.getAppellation({
            account: this.msg.senderId,
            teamId: this.teamId,
          });
          return `${name} ${t("joinTeamText")}`;
        }
        case V2NIMConst.V2NIMMessageNotificationType
          .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_INVITE: {
          const accounts = attachment.targetIds || [];
          accounts.forEach((item) => {
            this.store?.userStore.getUserActive(item);
          });
          const nicks = accounts
            .map((item) =>
              this.store?.uiStore.getAppellation({
                account: item,
                teamId: this.teamId,
              })
            )
            .filter((item) => !!item)
            .join("、");
          return `${nicks} ${t("joinTeamText")}`;
        }
        case V2NIMConst.V2NIMMessageNotificationType
          .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_KICK: {
          const accounts = attachment.targetIds || [];
          accounts.forEach((item) => {
            this.store?.userStore.getUserActive(item);
          });
          const nicks = accounts
            .map((item) =>
              this.store?.uiStore.getAppellation({
                account: item,
                teamId: this.teamId,
              })
            )
            .filter((item) => !!item)
            .join("、");
          return `${nicks} ${t("beRemoveTeamText")}`;
        }
        case V2NIMConst.V2NIMMessageNotificationType
          .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_ADD_MANAGER: {
          const accounts = attachment.targetIds || [];
          accounts.forEach((item) => {
            this.store?.userStore.getUserActive(item);
          });
          const nicks = accounts
            .map((item) =>
              this.store?.uiStore.getAppellation({
                account: item,
                teamId: this.teamId,
              })
            )
            .filter((item) => !!item)
            .join("、");
          return `${nicks} ${t("beAddTeamManagersText")}`;
        }
        case V2NIMConst.V2NIMMessageNotificationType
          .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_REMOVE_MANAGER: {
          const accounts = attachment.targetIds || [];
          accounts.forEach((item) => {
            this.store?.userStore.getUserActive(item);
          });
          const nicks = accounts
            .map((item) =>
              this.store?.uiStore.getAppellation({
                account: item,
                teamId: this.teamId,
              })
            )
            .filter((item) => !!item)
            .join("、");
          return `${nicks} ${t("beRemoveTeamManagersText")}`;
        }
        case V2NIMConst.V2NIMMessageNotificationType
          .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_LEAVE: {
          const name = this.store?.uiStore.getAppellation({
            account: this.msg.senderId,
            teamId: this.teamId,
          });
          return `${name} ${t("leaveTeamText")}`;
        }
        case V2NIMConst.V2NIMMessageNotificationType
          .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_OWNER_TRANSFER: {
          const target = (attachment.targetIds || [])[0];
          const name = this.store?.uiStore.getAppellation({
            account: target,
            teamId: this.teamId,
          });
          return `${name} ${t("newGroupOwnerText")}`;
        }
        default:
          return "";
      }
    },
  },
};
</script>

<style scoped>
.msg-noti {
  margin: 8px auto 0;
  text-align: center;
  font-size: 14px;
  color: #b3b7bc;
  max-width: 70%;
}
</style>
