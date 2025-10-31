<template>
  <div v-if="notificationContent" class="msg-noti">
    {{ notificationContent }}
  </div>
</template>

<script lang="ts" setup>
/** 消息通知 */
import { onUnmounted, ref, getCurrentInstance } from "vue";
import { autorun } from "mobx";
import { ALLOW_AT } from "../../utils/constants";
import { t } from "../../utils/i18n";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import type { V2NIMMessageNotificationAttachment } from "nim-web-sdk-ng/dist/esm/nim/src/V2NIMMessageService";
import type { V2NIMTeam } from "nim-web-sdk-ng/dist/esm/nim/src/V2NIMTeamService";
import type {
  V2NIMMessageForUI,
  YxServerExt,
} from "@xkit-yx/im-store-v2/dist/types/types";

const props = withDefaults(defineProps<{ msg: V2NIMMessageForUI }>(), {});

const { proxy } = getCurrentInstance()!; // 获取组件实例
// 群id
const teamId =
  props.msg.conversationType ===
  V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
    ? props.msg.receiverId
    : "";

const teamManagerVisible = proxy?.$UIKitStore.localOptions.teamManagerVisible;

// 通知消息内容
const notificationContent = ref("");

// 解析通知消息
const notificationContentWatch = autorun(() => {
  const getNotificationContent = () => {
    const attachment = props.msg
      .attachment as V2NIMMessageNotificationAttachment;
    switch (attachment?.type) {
      case V2NIMConst.V2NIMMessageNotificationType
        .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_UPDATE_TINFO: {
        const team = (attachment?.updatedTeamInfo || {}) as V2NIMTeam;
        const content: string[] = [];

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
                : teamManagerVisible
                ? t("teamOwnerAndManagerText")
                : t("teamOwner")
            }”`
          );
        }
        if (team.updateInfoMode !== undefined) {
          content.push(
            `${t("updateTeamUpdateTeamMode")}“${
              team.updateInfoMode ===
              V2NIMConst.V2NIMTeamUpdateInfoMode.V2NIM_TEAM_UPDATE_INFO_MODE_ALL
                ? t("teamAll")
                : teamManagerVisible
                ? t("teamOwnerAndManagerText")
                : t("teamOwner")
            }”`
          );
        }
        if (team.chatBannedMode !== void 0) {
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
          let ext: YxServerExt = {};
          try {
            ext = JSON.parse(team.serverExtension);
          } catch (error) {
            //
          }
          if (ext[ALLOW_AT] !== undefined) {
            content.push(
              `${t("updateAllowAt")}“${
                ext[ALLOW_AT] === "manager"
                  ? teamManagerVisible
                    ? t("teamOwnerAndManagerText")
                    : t("teamOwner")
                  : t("teamAll")
              }”`
            );
          }
        }
        return content.length
          ? `${proxy?.$UIKitStore.uiStore.getAppellation({
              account: props.msg.senderId,
              teamId,
            })} ${content.join("、")}`
          : "";
      }
      case V2NIMConst.V2NIMMessageNotificationType
        .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_APPLY_PASS:
      case V2NIMConst.V2NIMMessageNotificationType
        .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_INVITE_ACCEPT: {
        return `${proxy?.$UIKitStore.uiStore.getAppellation({
          account: props.msg.senderId,
          teamId,
        })} ${t("joinTeamText")}`;
      }
      case V2NIMConst.V2NIMMessageNotificationType
        .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_INVITE: {
        const accounts: string[] = attachment?.targetIds || [];
        accounts.map(async (item) => {
          await proxy?.$UIKitStore.userStore.getUserActive(item);
        });
        const nicks = accounts
          .map((item) => {
            return proxy?.$UIKitStore.uiStore.getAppellation({
              account: item,
              teamId,
            });
          })
          .filter((item) => !!item)
          .join("、");

        return `${nicks} ${t("joinTeamText")}`;
      }
      case V2NIMConst.V2NIMMessageNotificationType
        .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_KICK: {
        const accounts: string[] = attachment?.targetIds || [];
        accounts.map(async (item) => {
          await proxy?.$UIKitStore.userStore.getUserActive(item);
        });
        const nicks = accounts
          .map((item) => {
            return proxy?.$UIKitStore.uiStore.getAppellation({
              account: item,
              teamId,
            });
          })
          .filter((item) => !!item)
          .join("、");

        return `${nicks} ${t("beRemoveTeamText")}`;
      }
      case V2NIMConst.V2NIMMessageNotificationType
        .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_ADD_MANAGER: {
        const accounts: string[] = attachment?.targetIds || [];
        accounts.map(async (item) => {
          await proxy?.$UIKitStore.userStore.getUserActive(item);
        });
        const nicks = accounts
          .map((item) => {
            return proxy?.$UIKitStore.uiStore.getAppellation({
              account: item,
              teamId,
            });
          })
          .filter((item) => !!item)
          .join("、");

        return `${nicks} ${t("beAddTeamManagersText")}`;
      }
      case V2NIMConst.V2NIMMessageNotificationType
        .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_REMOVE_MANAGER: {
        const accounts: string[] = attachment?.targetIds || [];
        accounts.map(async (item) => {
          await proxy?.$UIKitStore.userStore.getUserActive(item);
        });
        const nicks = accounts
          .map((item) => {
            return proxy?.$UIKitStore.uiStore.getAppellation({
              account: item,
              teamId,
            });
          })
          .filter((item) => !!item)
          .join("、");

        return `${nicks} ${t("beRemoveTeamManagersText")}`;
      }
      case V2NIMConst.V2NIMMessageNotificationType
        .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_LEAVE: {
        return `${proxy?.$UIKitStore.uiStore.getAppellation({
          account: props.msg.senderId,
          teamId,
        })} ${t("leaveTeamText")}`;
      }
      case V2NIMConst.V2NIMMessageNotificationType
        .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_OWNER_TRANSFER: {
        return `${proxy?.$UIKitStore.uiStore.getAppellation({
          account: (attachment?.targetIds || [])[0],
          teamId,
        })} ${t("newGroupOwnerText")}`;
      }
      default:
        return "";
    }
  };
  notificationContent.value = getNotificationContent();
});

onUnmounted(() => {
  notificationContentWatch();
});
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
