<template>
  <Dropdown trigger="contextmenu">
    <div
      :class="[
        'conversation-item-container',
        {
          'stick-on-top': conversation.stickTop,
          'conversation-item-checked':
            conversation.conversationId === selectedConversation,
        },
      ]"
      @click="() => handleConversationItemClick()"
    >
      <div class="conversation-item-content">
        <div class="conversation-item-left">
          <div class="unread" v-if="unread">
            <div class="dot" v-if="isMute"></div>
            <div class="badge" v-else>{{ unread }}</div>
          </div>
          <Avatar size="36" :account="to" :avatar="teamAvatar" />
        </div>
        <div class="conversation-item-right">
          <div class="conversation-item-top">
            <Appellation
              class="conversation-item-title"
              v-if="
                conversation.type ===
                V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P
              "
              :account="to"
              :fontSize="14"
            />
            <span v-else class="conversation-item-title">
              {{ sessionName }}
            </span>
            <span class="conversation-item-time">{{ date }}</span>
          </div>
          <div class="conversation-item-desc">
            <span class="conversation-item-desc-span">
              <span v-if="beMentioned" class="beMentioned">
                {{ "[" + t("someoneText") + "@" + t("meText") + "]" }}
              </span>
              <ConversationItemIsRead
                v-if="showSessionUnread"
                :conversation="props.conversation"
              />
              <span
                v-if="props.conversation.lastMessage"
                class="conversation-item-desc-content"
              >
                <LastMsgContent :lastMessage="props.conversation.lastMessage" />
              </span>
            </span>
            <div class="conversation-item-state">
              <Icon
                v-if="isMute"
                iconClassName="conversation-item-desc-state"
                type="icon-xiaoximiandarao"
                color="#ccc"
                :size="14"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <template #overlay>
      <div class="conversation-dropdown-menu">
        <div
          class="conversation-dropdown-item"
          v-for="item in moreActions"
          :key="item.key"
          @click="() => handleActionItemClick(item.key)"
        >
          <Icon :type="item.iconType" :size="13"></Icon>
          <span class="action-name">{{ item.name }}</span>
        </div>
      </div>
    </template>
  </Dropdown>
</template>

<script lang="ts" setup>
import Avatar from "../CommonComponents/Avatar.vue";
import Appellation from "../CommonComponents/Appellation.vue";
import Icon from "../CommonComponents/Icon.vue";
import { computed, getCurrentInstance } from "vue";
import dayjs from "dayjs";
import { t } from "../utils/i18n";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import type {
  V2NIMConversationForUI,
  V2NIMLocalConversationForUI,
} from "@xkit-yx/im-store-v2/dist/types/types";
import ConversationItemIsRead from "./conversation-item-read.vue";
import LastMsgContent from "./conversation-item-last-msg-content.vue";
import Dropdown from "../CommonComponents/Dropdown.vue";

const props = withDefaults(
  defineProps<{
    conversation: V2NIMConversationForUI | V2NIMLocalConversationForUI;
    selectedConversation: string;
  }>(),
  {}
);
const { proxy } = getCurrentInstance()!; // 获取组件实例

const emit = defineEmits(["click", "delete", "stickyToTop", "mute"]);

const moreActions = computed(() => {
  return [
    {
      name: props.conversation.stickTop
        ? t("deleteStickTopText")
        : t("addStickTopText"),
      class: "action-top",
      key: "action-top",
      iconType: props.conversation.stickTop ? "icon-cancel-top" : "icon-top",
    },
    {
      name: props.conversation.mute
        ? t("unmuteSessionText")
        : t("muteSessionText"),
      class: "action-mute",
      key: "action-mute",
      iconType: props.conversation.mute ? "icon-cancel-mute" : "icon-mute",
    },

    {
      name: t("deleteSessionText"),
      class: "action-delete",
      key: "action-delete",
      iconType: "icon-delete",
    },
  ];
});

const handleActionItemClick = (key: string) => {
  if (key === "action-top") {
    emit("stickyToTop", props.conversation);
  } else if (key === "action-delete") {
    emit("delete", props.conversation);
  } else if (key === "action-mute") {
    emit("mute", props.conversation);
  }
};

// 群头像
const teamAvatar = computed(() => {
  if (
    props.conversation.type ===
    V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
  ) {
    const { avatar } = props.conversation;
    return avatar;
  }
});

// 会话名称
const sessionName = computed(() => {
  if (props.conversation.name) {
    return props.conversation.name;
  }
  return props.conversation.conversationId;
});

const to = computed(() => {
  const res = proxy?.$NIM.V2NIMConversationIdUtil.parseConversationTargetId(
    props.conversation.conversationId
  );
  return res;
});

const date = computed(() => {
  const time =
    props.conversation.lastMessage?.messageRefer.createTime ||
    props.conversation.updateTime;
  // 如果最后一条消息时间戳不存在，则会话列表不显示
  if (!time) {
    return "";
  }
  const _d = dayjs(time);
  const isCurrentDay = _d.isSame(dayjs(), "day");
  const isCurrentYear = _d.isSame(dayjs(), "year");
  return _d.format(
    isCurrentDay ? "HH:mm" : isCurrentYear ? "MM-DD" : "YYYY-MM"
  );
});

const max = 99;

const unread = computed(() => {
  return props.conversation.unreadCount > 0
    ? props.conversation.unreadCount > max
      ? `${max}+`
      : props.conversation.unreadCount + ""
    : "";
});

const isMute = computed(() => {
  return !!props.conversation.mute;
});

const beMentioned = computed(() => {
  return !!props.conversation.aitMsgs?.length;
});

const showSessionUnread = computed(() => {
  const myUserAccountId = proxy?.$NIM.V2NIMLoginService.getLoginUser();
  if (
    props.conversation.type ===
    V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P
  ) {
    return (
      props?.conversation?.lastMessage?.messageRefer.senderId ===
        myUserAccountId &&
      props?.conversation?.lastMessage?.messageType !==
        V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CALL &&
      props?.conversation?.lastMessage?.messageType !==
        V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_NOTIFICATION &&
      props?.conversation?.lastMessage?.sendingState ===
        V2NIMConst.V2NIMMessageSendingState
          .V2NIM_MESSAGE_SENDING_STATE_SUCCEEDED &&
      props?.conversation?.lastMessage?.lastMessageState !==
        V2NIMConst.V2NIMLastMessageState.V2NIM_MESSAGE_STATUS_REVOKE
    );
  } else {
    return false;
  }
});

function handleConversationItemClick() {
  emit("click", props.conversation);
}
</script>

<style scoped>
.conversation-item-container:hover {
  background-color: #ebf3fc;
}
/* 基础容器 */
.conversation-item-container {
  position: relative;
  transition: transform 0.3s;
  z-index: 9;
  cursor: pointer;
}

.conversation-item-container.stick-on-top {
  background: #f3f5f7;
}

.beMentioned {
  color: #ff4d4f;
}

.content {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 右侧操作列表 */
.right-action-list {
  position: absolute;
  top: 0;
  right: -200px;
  bottom: 0;
  width: 200px;
}

.right-action-item {
  width: 100px;
  display: inline-block;
  color: #fff;
  text-align: center;
  height: 72px;
  line-height: 72px;
}

.action-top {
  background: #337eff;
}

.action-delete {
  background: #a8abb6;
}

/* 会话内容 */
.conversation-item-content {
  display: flex;
  align-items: center;
  padding: 12px;
  height: 65px;
  box-sizing: border-box;
}

.conversation-item-left {
  position: relative;
}

.conversation-item-desc-span {
  display: flex;
  flex: 1;
  box-sizing: border-box;
  min-width: 0;
  overflow: hidden;
}

.conversation-item-checked {
  background-color: #ebf3fc !important;
}

.conversation-item-state {
  display: inline-block;
  width: 26px;
  box-sizing: border-box;
  height: 22px;
}
.conversation-item-badge {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
}

.conversation-item-right {
  flex: 1;
  width: 0;
  margin-left: 10px;
}

.conversation-item-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  height: 20px;
}

.conversation-item-time {
  font-size: 12px;
  color: #999999;
  text-align: right;
  width: 41px;
  flex-shrink: 0;
  white-space: nowrap;
}

.conversation-item-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: rgb(51, 51, 51);
  font-size: 14px;
}

.conversation-item-desc {
  width: 100%;
  font-size: 13px;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 22px;
  overflow: hidden;
}

.conversation-item-desc-state {
  margin-left: 10px;
}

.conversation-item-desc-content {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  font-size: 12px;
}

/* 未读标记 */
.dot {
  background-color: #ff4d4f;
  color: #fff;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  box-sizing: border-box;
  z-index: 99;
}

.badge {
  background-color: #ff4d4f;
  color: #fff;
  font-size: 12px;
  min-width: 20px;
  height: 20px;
  line-height: 19px;
  border-radius: 10px;
  padding: 0 5px;
  box-sizing: border-box;
  text-align: center;
  z-index: 99;
  position: relative;
}

.unread {
  position: absolute;
  right: -4px;
  top: -2px;
  z-index: 99;
}

.conversation-item-desc-ait {
  display: inline-block;
}

.conversation-dropdown-item {
  padding: 5px 12px;
  height: 32px;
  box-sizing: border-box;
  font-size: 14px;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.85);
  cursor: pointer;
}

.conversation-item-read-state {
  display: inline-block;
  width: 17px;
  height: 22px;
}

.conversation-dropdown-item:hover {
  background-color: #f5f5f5;
}

.action-name {
  margin-left: 5px;
  font-size: 14px;
}
</style>
