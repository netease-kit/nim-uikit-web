<template>
  <div class="chat-root">
    <div v-if="selectedConversation" class="chat-container-wrapper">
      <div class="chat-container">
        <!-- 聊天标题 -->
        <ChatHeader
          :to="to"
          :title="title"
          :subTitle="subTitle"
          :avatar="teamAvatar"
          :conversationType="conversationType"
        />
        <!-- 陌生人提示 -->
        <NotFriendTip
          :visible="strangerTipVisible"
          :appellation="appellation"
          @close="handleStrangerTipClose"
        />
        <!-- 消息列表 -->
        <MessageList
          ref="messageListRef"
          :conversationType="conversationType"
          :to="to"
          :msgs="msgs"
          :loading-more="loadingMore"
          :isFirstLoad="isFirstLoad"
          :no-more="noMore"
          :reply-msgs-map="replyMsgsMap"
        />
        <!-- 新消息提示 -->
        <NewMessageTip
          :visible="showNewMsgTip"
          @click="scrollToBottomAndHideNewMsgTip"
        />
        <!-- 消息输入框 -->
        <MessageInput
          :reply-msgs-map="replyMsgsMap"
          :conversation-type="conversationType"
          :to="to"
          :conversationId="selectedConversation"
          :inputPlaceholder="inputPlaceholder"
        />
      </div>
      <div class="chat-slide-bar">
        <div @click="showSettingDrawer" class="setting-icon">
          <Icon type="icon-setting" :size="24"></Icon>
        </div>
        <!-- 聊天设置 -->
        <ChatSettingDrawer
          v-if="drawerVisible"
          :visible="drawerVisible"
          @update:visible="(v) => (drawerVisible = v)"
          :to="to"
          :conversationType="conversationType"
        />
      </div>
    </div>
    <div class="welcome-wrapper" v-else>
      <Welcome />
    </div>
    <MessageForwardModal
      v-if="showForwardModal"
      :visible="showForwardModal"
      :msg="forwardMsg"
      @close="showForwardModal = false"
    />
    <!-- 好友名片 组件 -->
    <UserCardModal
      v-if="showUserCardModal"
      :visible="showUserCardModal"
      :account="userCardAccount"
      @close="showUserCardModal = false"
    />
  </div>
</template>

<script>
import { trackInit } from "../utils/reporter";
import { autorun } from "mobx";
import ChatHeader from "./message/chat-header.vue";
import MessageList from "./message/message-list.vue";
import MessageInput from "./message/message-input.vue";
import ChatSettingDrawer from "./setting/index.vue";
import NewMessageTip from "./message/new-message-tip.vue";
import NotFriendTip from "./message/not-friend-tip.vue";
import MessageForwardModal from "./message/message-forward-modal.vue";
import UserCardModal from "../CommonComponents/UserCardModal.vue";
import { HISTORY_LIMIT, events } from "../utils/constants";
import { t } from "../utils/i18n";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import { showToast, toast } from "../utils/toast";
import Welcome from "../CommonComponents/Welcome.vue";
import Icon from "../CommonComponents/Icon.vue";
import emitter from "../utils/eventBus";
import { nim, uiKitStore } from "../utils/init";
import { isDiscussionFunc } from "../utils";

export default {
  name: "ChatUIKit",
  components: {
    ChatHeader,
    MessageList,
    MessageInput,
    ChatSettingDrawer,
    NewMessageTip,
    NotFriendTip,
    MessageForwardModal,
    UserCardModal,
    Welcome,
    Icon,
  },
  data() {
    return {
      title: "",
      subTitle: "",
      drawerVisible: false,
      selectedConversation: "",
      teamAvatar: "",
      loadingMore: false,
      noMore: false,
      msgs: [],
      replyMsgsMap: {},
      showNewMsgTip: false,
      isFirstLoad: true,
      strangerTipVisible: false,
      appellation: "",
      showForwardModal: false,
      forwardMsg: null,
      showUserCardModal: false,
      userCardAccount: "",
      inputPlaceholder: "",
      headerUpdateTime: 0,
    };
  },
  computed: {
    store() {
      return uiKitStore;
    },
    conversationType() {
      return nim.V2NIMConversationIdUtil.parseConversationType(
        this.selectedConversation
      );
    },
    to() {
      return nim.V2NIMConversationIdUtil.parseConversationTargetId(
        this.selectedConversation
      );
    },
    teamMsgReceiptVisible() {
      return this.store?.localOptions?.teamMsgReceiptVisible;
    },
    p2pMsgReceiptVisible() {
      return this.store?.localOptions?.p2pMsgReceiptVisible;
    },
  },
  created() {
    trackInit("ChatUIKit", nim.options.appkey);
    this.chatHeaderWatch = autorun(() => {
      if (
        this.conversationType ===
        V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P
      ) {
        this.title =
          this.store?.uiStore.getAppellation({
            account: this.to,
          }) || "";
        this.subTitle = "";
        this.headerUpdateTime = this.store?.userStore.myUserInfo.updateTime;
      } else if (
        this.conversationType ===
        V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
      ) {
        const team = this.store?.teamStore.teams.get(this.to);
        this.subTitle = `(${team?.memberCount || 0}${t("personUnit")})`;
        this.title = team?.name || "";
        this.headerUpdateTime = team?.updateTime;
      }
    });
    this.selectedConversationWatch = autorun(() => {
      const newConversationId = this.store?.uiStore?.selectedConversation || "";
      if (newConversationId !== this.selectedConversation) {
        this.selectedConversation = newConversationId;
        if (this.selectedConversation) {
          this.noMore = false;
          this.loadingMore = false;
          this.resetState();
          if (this.isFirstLoad) {
            this.getHistory(Date.now()).then(() => {
              this.isFirstLoad = false;
              emitter.emit(events.ON_SCROLL_BOTTOM);
            });
            this.getTeamMember();
          }
        } else {
          this.msgs = [];
        }
      }
      const _to = nim.V2NIMConversationIdUtil.parseConversationTargetId(
        this.selectedConversation
      );
      const _type = nim.V2NIMConversationIdUtil.parseConversationType(
        this.selectedConversation
      );
      if (
        _type === V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
      ) {
        this.store?.teamStore.getTeamActive(_to).then((res) => {
          this.teamAvatar = res.avatar;
        });
      } else {
        this.teamAvatar = "";
      }
      this.setChatHeaderAndPlaceholder();
    });
    this.msgsWatch = autorun(() => {
      const conversationId = this.store?.uiStore.selectedConversation;
      if (conversationId) {
        const messages = this.store?.msgStore.getMsg(conversationId) || [];

        this.msgs = messages || [];
        this.handleReplyMsgs(messages);
      }
    });
  },
  mounted() {
    this.setChatHeaderAndPlaceholder();
    nim.V2NIMMessageService.on("onReceiveMessages", this.onReceiveMessages);
    nim.V2NIMTeamService.on("onTeamDismissed", this.onTeamDismissed);
    nim.V2NIMTeamService.on("onTeamLeft", this.onTeamLeft);
    emitter.on(events.GET_HISTORY_MSG, this.loadMoreMsgs);
    emitter.on(events.ON_SCROLL_BOTTOM, () => {
      this.showNewMsgTip = false;
    });
    emitter.on(events.CONFIRM_FORWARD_MSG, (msg) => {
      this.forwardMsg = msg;
      this.showForwardModal = true;
    });
    emitter.on(events.AVATAR_CLICK, (account) => {
      const myUserAccountId = nim.V2NIMLoginService.getLoginUser();
      if (account !== myUserAccountId) {
        this.userCardAccount = account;
        this.showUserCardModal = true;
      }
    });
    this.$watch(
      () => this.selectedConversation,
      () => {
        this.handleHistoryMsgReceipt(this.msgs);
      }
    );
  },
  beforeDestroy() {
    nim.V2NIMTeamService.off("onTeamDismissed", this.onTeamDismissed);
    nim.V2NIMTeamService.off("onTeamLeft", this.onTeamLeft);
    nim.V2NIMMessageService.off("onReceiveMessages", this.onReceiveMessages);
    emitter.off(events.GET_HISTORY_MSG, this.loadMoreMsgs);
    emitter.off(events.ON_SCROLL_BOTTOM);
    emitter.off(events.CONFIRM_FORWARD_MSG);
    emitter.off(events.AVATAR_CLICK);
    if (this.msgsWatch) this.msgsWatch();
    if (this.chatHeaderWatch) this.chatHeaderWatch();
    if (this.selectedConversationWatch) this.selectedConversationWatch();
    this.resetState();
    this.removeMsgs();
  },
  methods: {
    t,
    handleStrangerTipClose() {
      this.strangerTipVisible = false;
    },
    checkStrangerRelation() {
      if (
        this.conversationType ===
        V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P
      ) {
        const rel = this.store?.uiStore.getRelation(this.to) || {
          relation: "stranger",
        };
        this.appellation =
          this.store?.uiStore.getAppellation({
            account: this.to,
          }) || "";
        this.strangerTipVisible = rel.relation === "stranger";
      } else {
        this.strangerTipVisible = false;
      }
    },
    showSettingDrawer() {
      this.drawerVisible = true;
    },
    setChatHeaderAndPlaceholder() {
      if (
        this.conversationType ===
        V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P
      ) {
        this.title =
          this.store?.uiStore.getAppellation({
            account: this.to,
          }) || "";
        this.subTitle = "";
        let userNickOrAccount =
          this.store?.uiStore.getAppellation({ account: this.to }) || "";
        if (userNickOrAccount.length > 15) {
          userNickOrAccount = userNickOrAccount.slice(0, 15) + "...";
        }
        this.inputPlaceholder = t("sendToText") + " " + userNickOrAccount;
      } else if (
        this.conversationType ===
        V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
      ) {
        const team = this.store?.teamStore.teams.get(this.to);
        this.subTitle = `(${team?.memberCount || 0}${t("personUnit")})`;
        this.title = team?.name || "";
        this.inputPlaceholder = t("sendToText") + " " + (team?.name || "");
      }
      this.checkStrangerRelation();
    },
    onTeamDismissed(data) {
      if (data.teamId === this.to) {
        showToast({
          message: t("onDismissTeamText"),
          type: "info",
          duration: 1000,
        });
      }
    },
    onTeamLeft(data) {
      const isDiscussion = isDiscussionFunc(data?.serverExtension);
      showToast({
        message: isDiscussion
          ? t("onRemoveDiscussionText")
          : t("onRemoveTeamText"),
        type: "warning",
        duration: 1000,
      });
    },
    onReceiveMessages(msgs) {
      if (
        msgs.length &&
        !msgs[0]?.isSelf &&
        msgs[0].conversationId == this.selectedConversation
      ) {
        this.handleMsgReceipt(msgs);
      }
      const list = this.$refs.messageListRef;
      if (list && msgs[0].conversationId == this.selectedConversation) {
        const scrollInfo = list.getScrollInfo();
        if (scrollInfo.distanceFromBottom < 300) {
          list.scrollToBottom();
        } else {
          this.showNewMsgTip = true;
        }
      }
    },
    scrollToBottomAndHideNewMsgTip() {
      this.showNewMsgTip = false;
      const list = this.$refs.messageListRef;
      if (list) list.scrollToBottom();
    },
    handleMsgReceipt(msg) {
      if (
        msg[0].conversationType ===
          V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P &&
        this.p2pMsgReceiptVisible
      ) {
        this.store?.msgStore.sendMsgReceiptActive(msg[0]);
      } else if (
        msg[0].conversationType ===
          V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM &&
        this.teamMsgReceiptVisible
      ) {
        this.store?.msgStore.sendTeamMsgReceiptActive(msg);
      }
    },
    handleHistoryMsgReceipt(msgs) {
      if (
        this.conversationType ===
          V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P &&
        this.p2pMsgReceiptVisible
      ) {
        const myUserAccountId = nim.V2NIMLoginService.getLoginUser();
        const othersMsgs = msgs
          .filter(
            (item) =>
              !["beReCallMsg", "reCallMsg"].includes(item.recallType || "")
          )
          .filter((item) => item.senderId !== myUserAccountId);
        if (othersMsgs.length > 0) {
          this.store?.msgStore.sendMsgReceiptActive(othersMsgs?.[0]);
        }
      } else if (
        this.conversationType ===
          V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM &&
        this.teamMsgReceiptVisible
      ) {
        const myUserAccountId = nim.V2NIMLoginService.getLoginUser();
        const myMsgs = msgs
          .filter(
            (item) =>
              !["beReCallMsg", "reCallMsg"].includes(item.recallType || "")
          )
          .filter((item) => item.senderId === myUserAccountId);
        this.store?.msgStore.getTeamMsgReadsActive(
          myMsgs,
          this.selectedConversation
        );
        const othersMsgs = msgs
          .filter(
            (item) =>
              !["beReCallMsg", "reCallMsg"].includes(item.recallType || "")
          )
          .filter((item) => item.senderId !== myUserAccountId);
        if (othersMsgs.length > 0 && othersMsgs.length < 50) {
          this.store?.msgStore.sendTeamMsgReceiptActive(othersMsgs);
        }
      }
    },
    async getHistory(endTime, lastMsgId) {
      try {
        if (this.noMore) return [];
        if (this.loadingMore) return [];
        this.loadingMore = true;
        if (this.selectedConversation) {
          const historyMsgs = await this.store?.msgStore.getHistoryMsgActive({
            conversationId: this.selectedConversation,
            endTime,
            lastMsgId,
            limit: HISTORY_LIMIT,
          });
          this.loadingMore = false;
          if (historyMsgs?.length) {
            if (historyMsgs.length < HISTORY_LIMIT) this.noMore = true;
            this.handleHistoryMsgReceipt(historyMsgs);
            return historyMsgs;
          } else {
            this.noMore = true;
          }
        }
      } catch (error) {
        this.loadingMore = false;
        switch (error.code) {
          case 109404:
            toast.info(t("onDismissTeamText"));
            this.store?.conversationStore?.deleteConversationActive(
              this.selectedConversation
            );
            break;
          default:
            break;
        }
        throw error;
      }
    },
    loadMoreMsgs(lastMsg) {
      if (lastMsg) {
        this.getHistory(lastMsg.createTime, lastMsg.messageServerId);
      } else {
        this.getHistory(Date.now());
      }
    },
    resetState() {
      this.replyMsgsMap = {};
      this.msgs = [];
      this.isFirstLoad = true;
      this.drawerVisible = false;
      this.showNewMsgTip = false;
      this.noMore = false;
      this.loadingMore = false;
      this.title = "";
      this.subTitle = "";
    },
    getTeamMember() {
      if (
        this.conversationType ===
        V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
      ) {
        const team = this.store?.teamStore.teams.get(this.to);
        this.store?.teamMemberStore.getTeamMemberActive({
          teamId: this.to,
          queryOption: {
            limit: Math.max(team?.memberLimit || 0, 200),
            roleQueryType: 0,
          },
        });
      }
    },
    handleReplyMsgs(messages) {
      if (messages.length !== 0) {
        const replyMsgsMapForExt = {};
        const replyMsgsMapForThreadReply = {};
        const extReqMsgs = [];
        const threadReplyReqMsgs = [];
        const messageClientIds = {};
        this.msgs.forEach((msg) => {
          if (msg.serverExtension) {
            try {
              const { yxReplyMsg } = JSON.parse(msg.serverExtension);
              if (yxReplyMsg) {
                const beReplyMsg = this.msgs.find(
                  (item) => item.messageClientId === yxReplyMsg.idClient
                );
                if (beReplyMsg) {
                  replyMsgsMapForExt[msg.messageClientId] = beReplyMsg;
                } else {
                  replyMsgsMapForExt[msg.messageClientId] = {
                    messageClientId: "noFind",
                  };
                  const {
                    scene,
                    from,
                    to,
                    idServer,
                    messageClientId,
                    time,
                    receiverId,
                  } = yxReplyMsg;
                  if (
                    scene &&
                    from &&
                    to &&
                    idServer &&
                    messageClientId &&
                    time &&
                    receiverId
                  ) {
                    extReqMsgs.push({
                      scene,
                      from,
                      to,
                      idServer,
                      messageClientId,
                      time,
                      receiverId,
                    });
                    messageClientIds[idServer] = msg.messageClientId;
                  }
                }
              }
            } catch (error) {
              console.error("处理回复消息时发生错误:", error);
            }
          }
          if (msg.threadReply) {
            const beReplyMsg = this.msgs.find(
              (item) =>
                item.messageServerId === msg.threadReply?.messageServerId
            );
            if (beReplyMsg) {
              if (
                beReplyMsg.recallType == "beReCallMsg" ||
                beReplyMsg.recallType == "reCallMsg"
              ) {
                replyMsgsMapForThreadReply[msg.messageClientId] = {
                  messageClientId: "noFind",
                };
              } else {
                replyMsgsMapForThreadReply[msg.messageClientId] = beReplyMsg;
              }
            } else {
              replyMsgsMapForThreadReply[msg.messageClientId] = {
                messageClientId: "noFind",
              };
              messageClientIds[msg.threadReply.messageServerId] =
                msg.messageClientId;
              threadReplyReqMsgs.push(msg.threadReply);
            }
          }
        });
        if (extReqMsgs.length > 0) {
          nim.V2NIMMessageService.getMessageListByRefers(
            extReqMsgs.map((item) => ({
              senderId: item.from,
              receiverId: item.receiverId,
              messageClientId: item.messageClientId,
              messageServerId: item.idServer,
              createTime: item.time,
              conversationType: item.scene,
              conversationId: item.to,
            }))
          )
            .then((res) => {
              if (res?.length > 0) {
                res.forEach((item) => {
                  if (item.messageServerId) {
                    replyMsgsMapForExt[messageClientIds[item.messageServerId]] =
                      item;
                  }
                });
              }
              this.replyMsgsMap = { ...replyMsgsMapForExt };
            })
            .catch(() => {
              this.replyMsgsMap = { ...replyMsgsMapForExt };
            });
        }
        if (threadReplyReqMsgs.length > 0) {
          nim.V2NIMMessageService.getMessageListByRefers(threadReplyReqMsgs)
            .then((res) => {
              if (res?.length > 0) {
                res.forEach((item) => {
                  if (item.messageServerId) {
                    replyMsgsMapForThreadReply[
                      messageClientIds[item.messageServerId]
                    ] = item;
                  }
                });
              }
              this.replyMsgsMap = {
                ...replyMsgsMapForExt,
                ...replyMsgsMapForThreadReply,
              };
            })
            .catch(() => {
              this.replyMsgsMap = {
                ...replyMsgsMapForExt,
                ...replyMsgsMapForThreadReply,
              };
            });
        } else {
          this.replyMsgsMap = {
            ...replyMsgsMapForExt,
            ...replyMsgsMapForThreadReply,
          };
        }
      }
    },
    removeMsgs() {
      if (this.selectedConversation) {
        const allMsgs =
          this.store?.msgStore.getMsg(this.selectedConversation) || [];
        if (allMsgs.length > 20) {
          const sortedMsgs = [...allMsgs].sort(
            (a, b) => a.createTime - b.createTime
          );
          const deleteCount = allMsgs.length - 20;
          const msgsToDelete = sortedMsgs.slice(0, deleteCount);
          const idClientsToDelete = msgsToDelete.map(
            (msg) => msg.messageClientId
          );
          this.store?.msgStore.removeMsg(
            this.selectedConversation,
            idClientsToDelete
          );
        }
      }
    },
  },
};
</script>

<style scoped>
.chat-root {
  height: 100%;
}
.chat-container {
  width: 100%;
  height: 100%;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: relative;
}

.msg-alert {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: auto;
  z-index: 1;
}

.msg-wrapper {
  width: 100%;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: relative;
  flex: 1;
}

.msg-wrapper-h5 {
  width: 100%;
  height: 100%;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: relative;
}

.msg-wrapper > message-list {
  height: 100%;
}

.welcome-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-container-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  background: #f6f8fa;
}

.chat-slide-bar {
  width: 52px;
  height: 100%;
  border-left: 1px solid #e4e9f2;
  padding: 13px 10px;
  box-sizing: border-box;
}

.setting-icon {
  width: 100%;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.setting-icon:hover {
  background-color: #f0f0f0;
}
</style>
