<template>
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
        v-model:visible="drawerVisible"
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
</template>

<script lang="ts" setup>
import { trackInit } from "../utils/reporter";
import { autorun } from "mobx";
import {
  ref,
  onMounted,
  onUnmounted,
  getCurrentInstance,
  computed,
  nextTick,
} from "vue";
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
import type { V2NIMMessageForUI } from "@xkit-yx/im-store-v2/dist/types/types";
import type {
  V2NIMMessage,
  V2NIMMessageRefer,
} from "nim-web-sdk-ng/dist/esm/nim/src/V2NIMMessageService";

export interface YxReplyMsg {
  messageClientId: string;
  scene: V2NIMConst.V2NIMConversationType;
  from: string;
  receiverId: string;
  to: string;
  idServer: string;
  time: number;
}

const { proxy } = getCurrentInstance()!;
const store = proxy?.$UIKitStore;
const nim = proxy?.$NIM;

// 聊天标题
const title = ref("");
// 聊天子标题
const subTitle = ref("");
// 设置抽屉
const drawerVisible = ref(false);
// 消息列表
const messageListRef = ref<{
  getScrollInfo: () => {
    height: number;
    scrollTop: number;
    scrollHeight: number;
    clientHeight: number;
    distanceFromBottom: number;
  };
  scrollToBottom: () => void;
  messageListRef: HTMLElement | null;
} | null>(null);

/**当前选中的会话Id*/
const selectedConversation = ref("");

/**会话类型 */
const conversationType = computed(() => {
  return proxy?.$NIM.V2NIMConversationIdUtil.parseConversationType(
    selectedConversation.value
  );
});

/**对话方 */
const to = computed(() => {
  return proxy?.$NIM.V2NIMConversationIdUtil.parseConversationTargetId(
    selectedConversation.value
  );
});

/**群头像 */
const teamAvatar = ref<string>("");

trackInit("ChatUIKit", nim.options.appkey);

/**是否需要显示群组消息已读未读，默认 false */
const teamManagerVisible = store?.localOptions.teamMsgReceiptVisible;

/**是否需要显示 p2p 消息、p2p会话列表消息已读未读，默认 false */
const p2pMsgReceiptVisible = store?.localOptions.p2pMsgReceiptVisible;

// 加载更多
const loadingMore = ref(false);

/**是否还有更多历史消息 */

const noMore = ref(false);

/**消息列表 */
const msgs = ref<V2NIMMessage[]>([]);

/**回复消息map，用于回复消息的解析处理 */
const replyMsgsMap = ref<Record<string, V2NIMMessage>>();

/** 新消息提醒 */
const showNewMsgTip = ref(false);

/** 是否是首次加载 */
const isFirstLoad = ref(true);

/** 陌生人提示相关 */
const strangerTipVisible = ref(false);

/** 陌生人提示相关 */
const appellation = ref("");

/** 关闭陌生人提示 */
const handleStrangerTipClose = () => {
  strangerTipVisible.value = false;
};

/** 检查是否为陌生人关系 */
const checkStrangerRelation = () => {
  if (
    conversationType.value ===
    V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P
  ) {
    const { relation } = store?.uiStore.getRelation(to.value) || {
      relation: "stranger",
    };
    appellation.value = store?.uiStore.getAppellation({
      account: to.value,
    }) as string;
    strangerTipVisible.value = relation === "stranger";
  } else {
    strangerTipVisible.value = false;
  }
};

/** 处理转发消息 */
const showForwardModal = ref(false);
/** 转发消息 */
const forwardMsg = ref<V2NIMMessage>();

/** 个人名片 */
const showUserCardModal = ref(false);
/** 个人名片账号 */
const userCardAccount = ref("");

/**显示设置抽屉 */
const showSettingDrawer = () => {
  drawerVisible.value = true;
};

/**输入框placeholder */
const inputPlaceholder = ref("");

/** 设置页面标题 */
const setChatHeaderAndPlaceholder = () => {
  // 单聊
  if (
    conversationType.value ===
    V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P
  ) {
    title.value = store?.uiStore.getAppellation({
      account: to.value,
    }) as string;
    subTitle.value = "";

    let userNickOrAccount =
      store?.uiStore.getAppellation({
        account: to.value,
      }) || "";
    if (userNickOrAccount.length > 15) {
      userNickOrAccount = userNickOrAccount.slice(0, 15) + "...";
    }
    inputPlaceholder.value = t("sendToText") + " " + userNickOrAccount;
    // 群聊
  } else if (
    conversationType.value ===
    V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
  ) {
    const team = store?.teamStore.teams.get(to.value);
    subTitle.value = `(${team?.memberCount || 0}${t("personUnit")})`;
    title.value = team?.name || "";

    inputPlaceholder.value = t("sendToText") + " " + team?.name;
  }
  // 检查陌生人关系
  checkStrangerRelation();
};

/** 解散群组回调 */
const onTeamDismissed = (data: any) => {
  if (data.teamId === to) {
    showToast({
      message: t("onDismissTeamText"),
      type: "info",
      duration: 1000,
    });
  }
};

/** 自己主动离开群组或被管理员踢出回调 */
const onTeamLeft = (data: any) => {
  showToast({
    message: t("onRemoveTeamText"),
    type: "warning",
    duration: 1000,
  });
};

/** 收到新消息 */
const onReceiveMessages = (msgs: V2NIMMessage[]) => {
  // 当前在聊天页，视为消息已读，发送已读回执
  if (
    msgs.length &&
    !msgs[0]?.isSelf &&
    msgs[0].conversationId == selectedConversation.value
  ) {
    handleMsgReceipt(msgs);
  }

  if (
    messageListRef.value &&
    msgs[0].conversationId == selectedConversation.value
  ) {
    const scrollInfo = messageListRef.value.getScrollInfo();
    if (scrollInfo.distanceFromBottom < 300) {
      messageListRef.value.scrollToBottom();
    } else {
      showNewMsgTip.value = true;
    }
  }
};

/** 点击新消息提醒，滚动到底部并隐藏提醒 */
const scrollToBottomAndHideNewMsgTip = () => {
  showNewMsgTip.value = false;
  if (messageListRef.value) {
    messageListRef.value.scrollToBottom();
  }
};

/** 处理收到消息的已读回执 */
const handleMsgReceipt = (msg: V2NIMMessage[]) => {
  if (
    msg[0].conversationType ===
      V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P &&
    p2pMsgReceiptVisible
  ) {
    store?.msgStore.sendMsgReceiptActive(msg[0]);
  } else if (
    msg[0].conversationType ===
      V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM &&
    teamManagerVisible
  ) {
    store?.msgStore.sendTeamMsgReceiptActive(msg);
  }
};

/** 处理历史消息的已读未读 */
const handleHistoryMsgReceipt = (msgs: V2NIMMessage[]) => {
  /** 如果是单聊 */
  if (
    conversationType.value ===
      V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P &&
    p2pMsgReceiptVisible
  ) {
    const myUserAccountId = proxy?.$NIM.V2NIMLoginService.getLoginUser();
    const othersMsgs = msgs
      .filter(
        (item: V2NIMMessage) =>
          // @ts-ignore
          !["beReCallMsg", "reCallMsg"].includes(item.recallType || "")
      )
      .filter((item: V2NIMMessage) => item.senderId !== myUserAccountId);

    /** 发送单聊消息已读回执 */
    if (othersMsgs.length > 0) {
      store?.msgStore.sendMsgReceiptActive(othersMsgs?.[0]);
    }

    /** 如果是群聊 */
  } else if (
    conversationType.value ===
      V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM &&
    teamManagerVisible
  ) {
    const myUserAccountId = proxy?.$NIM.V2NIMLoginService.getLoginUser();
    const myMsgs = msgs
      .filter(
        (item: V2NIMMessage) =>
          // @ts-ignore
          !["beReCallMsg", "reCallMsg"].includes(item.recallType || "")
      )
      .filter((item: V2NIMMessage) => item.senderId === myUserAccountId);

    store?.msgStore.getTeamMsgReadsActive(myMsgs, selectedConversation.value);

    // 发送群消息已读回执
    // sdk 要求 一次最多传入 50 个消息对象
    const othersMsgs = msgs
      .filter(
        (item: V2NIMMessage) =>
          // @ts-ignore
          !["beReCallMsg", "reCallMsg"].includes(item.recallType || "")
      )
      .filter((item: V2NIMMessage) => item.senderId !== myUserAccountId);

    if (othersMsgs.length > 0 && othersMsgs.length < 50) {
      store?.msgStore.sendTeamMsgReceiptActive(othersMsgs);
    }
  }
};

/** 拉取历史消息 */
const getHistory = async (endTime: number, lastMsgId?: string) => {
  try {
    if (noMore.value) {
      return [];
    }

    if (loadingMore.value) {
      return [];
    }
    loadingMore.value = true;
    if (selectedConversation.value) {
      const historyMsgs = await store?.msgStore.getHistoryMsgActive({
        conversationId: selectedConversation.value,
        endTime,
        lastMsgId,
        limit: HISTORY_LIMIT,
      });

      loadingMore.value = false;

      if (historyMsgs?.length) {
        if (historyMsgs.length < HISTORY_LIMIT) {
          noMore.value = true;
        }
        // 消息已读未读相关
        handleHistoryMsgReceipt(historyMsgs);
        return historyMsgs;
      } else {
        noMore.value = true;
      }
    }
  } catch (error: any) {
    loadingMore.value = false;
    switch (error.code) {
      case 109404:
        toast.info(t("onDismissTeamText"));
        store?.conversationStore?.deleteConversationActive(
          selectedConversation.value
        );
        break;

      default:
        break;
    }
    throw error;
  }
};

/** 加载更多消息 */
const loadMoreMsgs = (lastMsg) => {
  if (lastMsg) {
    getHistory(lastMsg.createTime, lastMsg.messageServerId);
  } else {
    getHistory(Date.now());
  }
};

/** 监听聊天标题 */
const chatHeaderWatch = autorun(() => {
  if (
    conversationType.value ===
    V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P
  ) {
    title.value = store?.uiStore.getAppellation({
      account: to.value,
    }) as string;
    subTitle.value = "";
  } else if (
    conversationType.value ===
    V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
  ) {
    const team = store?.teamStore.teams.get(to.value);
    subTitle.value = `(${team?.memberCount || 0}${t("personUnit")})`;
    title.value = team?.name || "";
  }
});

const resetState = () => {
  replyMsgsMap.value = {};
  msgs.value = [];
  isFirstLoad.value = true;
  drawerVisible.value = false;
  showNewMsgTip.value = false;
  noMore.value = false;
  loadingMore.value = false;
  title.value = "";
  subTitle.value = "";
};

// 获取群成员
const getTeamMember = () => {
  if (
    conversationType.value ===
    V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
  ) {
    const team = store?.teamStore.teams.get(to.value);

    proxy?.$UIKitStore.teamMemberStore.getTeamMemberActive({
      teamId: to.value,
      queryOption: {
        limit: Math.max(team?.memberLimit || 0, 200),
        roleQueryType: 0,
      },
    });
  }
};
/** 处理回复消息 */
const handleReplyMsgs = (messages: V2NIMMessage[]) => {
  // 遍历所有消息，找出被回复消息，储存在map中
  if (messages.length !== 0) {
    const replyMsgsMapForExt: any = {};
    const replyMsgsMapForThreadReply: any = {};
    const extReqMsgs: YxReplyMsg[] = [];
    const threadReplyReqMsgs: V2NIMMessageRefer[] = [];
    const messageClientIds: Record<string, string> = {};
    msgs.value.forEach((msg) => {
      if (msg.serverExtension) {
        try {
          // yxReplyMsg 存储着被回复消息的相关消息
          const { yxReplyMsg } = JSON.parse(msg.serverExtension);
          if (yxReplyMsg) {
            // 从消息列表中找到被回复消息，replyMsg 为被回复的消息
            const beReplyMsg = msgs.value.find(
              (item) => item.messageClientId === yxReplyMsg.idClient
            );
            // 如果直接找到，存储在map中
            if (beReplyMsg) {
              replyMsgsMapForExt[msg.messageClientId] = beReplyMsg;
              // 如果没找到，说明被回复的消息可能有三种情况：1.被删除 2.被撤回 3.不在当前消息列表中（一次性没拉到，在之前的消息中）
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
        } catch {}
      }

      if (msg.threadReply) {
        //找到被回复的消息
        const beReplyMsg = msgs.value.find(
          (item) => item.messageServerId === msg.threadReply?.messageServerId
        ) as V2NIMMessageForUI;

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
      // 从服务器拉取被回复消息, 但是有频率控制
      nim.V2NIMMessageService.getMessageListByRefers(
        //@ts-ignore
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
          replyMsgsMap.value = { ...replyMsgsMapForExt };
        })
        .catch(() => {
          replyMsgsMap.value = { ...replyMsgsMapForExt };
        });
    }

    if (threadReplyReqMsgs.length > 0) {
      nim.V2NIMMessageService.getMessageListByRefers(
        //@ts-ignore
        threadReplyReqMsgs
      )
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
          replyMsgsMap.value = {
            ...replyMsgsMapForExt,
            ...replyMsgsMapForThreadReply,
          };
        })
        .catch(() => {
          replyMsgsMap.value = {
            ...replyMsgsMapForExt,
            ...replyMsgsMapForThreadReply,
          };
        });
    } else {
      replyMsgsMap.value = {
        ...replyMsgsMapForExt,
        ...replyMsgsMapForThreadReply,
      };
    }
  }
};

// 监听会话改变
const selectedConversationWatch = autorun(() => {
  const newConversationId = store?.uiStore?.selectedConversation || "";

  if (newConversationId !== selectedConversation.value) {
    selectedConversation.value = newConversationId;

    if (selectedConversation.value) {
      // 重置加载状态
      noMore.value = false;
      loadingMore.value = false;
      resetState(); // 在确认会话改变后再重置

      if (isFirstLoad.value) {
        getHistory(Date.now()).then(async () => {
          await nextTick();
          isFirstLoad.value = false;
          emitter.emit(events.ON_SCROLL_BOTTOM);
        });
        getTeamMember();
      }
    } else {
      msgs.value = [];
    }
  }

  const to = proxy?.$NIM.V2NIMConversationIdUtil.parseConversationTargetId(
    selectedConversation.value
  );

  const conversationType =
    proxy?.$NIM.V2NIMConversationIdUtil.parseConversationType(
      selectedConversation.value
    );

  if (
    conversationType ===
    V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
  ) {
    store?.teamStore.getTeamActive(to).then((res) => {
      teamAvatar.value = res.avatar;
    });
  } else {
    teamAvatar.value = "";
  }
  setChatHeaderAndPlaceholder();
});

/**监听store层的msg数组 动态更新消息 */
const msgsWatch = autorun(() => {
  const conversationId = store?.uiStore.selectedConversation;

  if (conversationId) {
    const messages = store?.msgStore.getMsg(conversationId) || [];

    msgs.value = messages || [];

    // 遍历所有消息，找出被回复消息，储存在map中
    handleReplyMsgs(messages);
  }
});

const removeMsgs = () => {
  if (selectedConversation.value) {
    // 获取当前会话的所有消息
    const allMsgs = store?.msgStore.getMsg(selectedConversation.value) || [];

    // 如果消息数量大于20条，则删除最旧的消息，只保留最近20条
    if (allMsgs.length > 20) {
      // 按时间排序，确保获取到最旧的消息
      const sortedMsgs = [...allMsgs].sort(
        (a, b) => a.createTime - b.createTime
      );

      // 计算需要删除的消息数量
      const deleteCount = allMsgs.length - 20;

      // 获取需要删除的消息的 messageClientId
      const msgsToDelete = sortedMsgs.slice(0, deleteCount);
      const idClientsToDelete = msgsToDelete.map((msg) => msg.messageClientId);

      // 删除指定的消息，保留最近20条
      store?.msgStore.removeMsg(selectedConversation.value, idClientsToDelete);
    }
  }
};

onMounted(() => {
  setChatHeaderAndPlaceholder();

  /** 收到消息 */
  proxy?.$NIM.V2NIMMessageService.on("onReceiveMessages", onReceiveMessages);
  /** 解散群组回调 */
  proxy?.$NIM.V2NIMTeamService.on("onTeamDismissed", onTeamDismissed);
  /** 自己主动离开群组或被管理员踢出回调 */
  proxy?.$NIM.V2NIMTeamService.on("onTeamLeft", onTeamLeft);

  // 加载历史消息
  emitter.on(events.GET_HISTORY_MSG, loadMoreMsgs);

  // 监听滚动到底部事件，隐藏新消息提醒
  emitter.on(events.ON_SCROLL_BOTTOM, () => {
    showNewMsgTip.value = false;
  });

  //转发消息
  emitter.on(events.CONFIRM_FORWARD_MSG, (msg) => {
    forwardMsg.value = msg as V2NIMMessage;
    showForwardModal.value = true;
  });

  //消息头像点击
  emitter.on(events.AVATAR_CLICK, (account) => {
    userCardAccount.value = account as string;
    showUserCardModal.value = true;
  });
});

onUnmounted(() => {
  proxy?.$NIM.V2NIMTeamService.off("onTeamDismissed", onTeamDismissed);
  proxy?.$NIM.V2NIMTeamService.off("onTeamLeft", onTeamLeft);
  proxy?.$NIM.V2NIMMessageService.off("onReceiveMessages", onReceiveMessages);

  emitter.off(events.GET_HISTORY_MSG, loadMoreMsgs);
  emitter.off(events.ON_SCROLL_BOTTOM);
  emitter.off(events.CONFIRM_FORWARD_MSG);
  emitter.off(events.AVATAR_CLICK);

  msgsWatch();
  chatHeaderWatch();
  selectedConversationWatch();
  resetState();
  removeMsgs();
});
</script>

<style scoped>
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
  padding: 4px 8px;
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
