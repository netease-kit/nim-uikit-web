<template>
  <!-- 右键菜单容器，提供置顶/静音/删除等操作 -->
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
      @click="handleConversationItemClick"
    >
      <div class="conversation-item-content">
        <div class="conversation-item-left">
          <!-- 未读标记：静音时显示红点，非静音显示数字徽标 -->
          <div class="unread" v-if="unread">
            <div class="dot" v-if="isMute"></div>
            <div class="badge" v-else>{{ unread }}</div>
          </div>
          <!-- 会话头像：P2P 显示对端头像，群聊显示群头像 -->
          <Avatar size="36" :account="to" :avatar="teamAvatar" />
        </div>
        <div class="conversation-item-right">
          <div class="conversation-item-top">
            <Appellation
              class="conversation-item-title"
              v-if="
                conversation.type ==
                V2NIMConversationTypeEnum.V2NIM_CONVERSATION_TYPE_P2P
              "
              :account="to"
              :fontSize="14"
            />
            <!-- <span
              class="conversation-item-title"
              v-if="
                conversation.type ==
                V2NIMConversationTypeEnum.V2NIM_CONVERSATION_TYPE_P2P
              "
            >
              {{ appellation }}
            </span> -->
            <span v-else class="conversation-item-title">
              {{ sessionName }}
            </span>
            <!-- 最近消息时间：同日显示时分，同年显示月日，跨年显示年月 -->
            <span class="conversation-item-time">{{ date }}</span>
          </div>
          <div class="conversation-item-desc">
            <span class="conversation-item-desc-span">
              <!-- 群聊 @我 提示 -->
              <span v-if="beMentioned" class="beMentioned">
                {{ "[" + t("someoneText") + "@" + t("meText") + "]" }}
              </span>
              <!-- P2P 最近一条我的已读状态提示 -->
              <ConversationItemIsRead
                v-if="showSessionUnread"
                :conversation="conversation"
              />
              <span
                v-if="conversation.lastMessage"
                class="conversation-item-desc-content"
              >
                <!-- 最近消息文案展示（含类型翻译） -->
                <LastMsgContent :lastMessage="conversation.lastMessage" />
              </span>
            </span>
            <div class="conversation-item-state">
              <!-- 静音图标 -->
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
          @click="handleActionItemClick(item.key)"
        >
          <Icon :type="item.iconType" :size="13"></Icon>
          <span class="action-name">{{ item.name }}</span>
        </div>
      </div>
    </template>
  </Dropdown>
</template>

<script>
import Avatar from "../CommonComponents/Avatar.vue";
import Appellation from "../CommonComponents/Appellation.vue";
import Icon from "../CommonComponents/Icon.vue";
import dayjs from "dayjs";
import { t } from "../utils/i18n";
import ConversationItemIsRead from "./conversation-item-read.vue";
import LastMsgContent from "./conversation-item-last-msg-content.vue";
import Dropdown from "../CommonComponents/Dropdown.vue";
import { nim } from "../utils/init";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";

// 未读数展示上限
const max = 99;

export default {
  name: "ConversationItem",
  components: {
    Avatar,
    Appellation,
    Icon,
    ConversationItemIsRead,
    LastMsgContent,
    Dropdown,
  },
  props: {
    conversation: {
      type: Object,
      required: true,
    },
    selectedConversation: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      appellation: "",
      V2NIMConversationTypeEnum: V2NIMConst.V2NIMConversationType,
    };
  },

  computed: {
    // 右键菜单动作列表
    moreActions() {
      return [
        {
          name: this.conversation.stickTop
            ? t("deleteStickTopText")
            : t("addStickTopText"),
          class: "action-top",
          key: "action-top",
          iconType: this.conversation.stickTop ? "icon-cancel-top" : "icon-top",
        },
        {
          name: this.conversation.mute
            ? t("unmuteSessionText")
            : t("muteSessionText"),
          class: "action-mute",
          key: "action-mute",
          iconType: this.conversation.mute ? "icon-cancel-mute" : "icon-mute",
        },
        {
          name: t("deleteSessionText"),
          class: "action-delete",
          key: "action-delete",
          iconType: "icon-delete",
        },
      ];
    },
    // 群聊头像（P2P 使用对端头像）
    teamAvatar() {
      if (
        this.conversation.type ===
        V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
      ) {
        const { avatar } = this.conversation;
        return avatar;
      }
      return undefined;
    },
    // 会话名称：优先显示服务端 name，不存在则 fallback 到会话ID
    sessionName() {
      if (this.conversation.name) {
        return this.conversation.name;
      }
      return this.conversation.conversationId;
    },
    // 对端账号：由会话ID解析得到（P2P目标）
    to() {
      return nim.V2NIMConversationIdUtil?.parseConversationTargetId(
        this.conversation.conversationId
      );
    },
    // 最近消息时间（或会话更新时间）的格式化显示
    date() {
      const time =
        (this.conversation.lastMessage &&
          this.conversation.lastMessage.messageRefer &&
          this.conversation.lastMessage.messageRefer.createTime) ||
        this.conversation.updateTime;
      if (!time) {
        return "";
      }
      const _d = dayjs(time);
      const isCurrentDay = _d.isSame(dayjs(), "day");
      const isCurrentYear = _d.isSame(dayjs(), "year");
      return _d.format(
        isCurrentDay ? "HH:mm" : isCurrentYear ? "MM-DD" : "YYYY-MM"
      );
    },
    // 未读数量格式化（超出上限显示 max+）
    unread() {
      return this.conversation.unreadCount > 0
        ? this.conversation.unreadCount > max
          ? `${max}+`
          : this.conversation.unreadCount + ""
        : "";
    },
    // 是否静音会话
    isMute() {
      return !!this.conversation.mute;
    },
    // 群聊是否存在 @我 的消息
    beMentioned() {
      return !!(this.conversation.aitMsgs && this.conversation.aitMsgs.length);
    },
    // P2P 我发送的最近一条消息的已读状态提示是否展示
    showSessionUnread() {
      const myUserAccountId = nim.V2NIMLoginService.getLoginUser();

      if (
        this.conversation.type ===
        V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P
      ) {
        const lastMessage = this.conversation.lastMessage || {};
        const refer = lastMessage.messageRefer || {};
        return (
          refer.senderId === myUserAccountId &&
          lastMessage.messageType !==
            V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CALL &&
          lastMessage.messageType !==
            V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_NOTIFICATION &&
          lastMessage.sendingState ===
            V2NIMConst.V2NIMMessageSendingState
              .V2NIM_MESSAGE_SENDING_STATE_SUCCEEDED &&
          lastMessage.lastMessageState !==
            V2NIMConst.V2NIMLastMessageState.V2NIM_MESSAGE_STATUS_REVOKE
        );
      } else {
        return false;
      }
    },
  },
  methods: {
    t,
    // 处理右键菜单点击：置顶/删除/静音
    handleActionItemClick(key) {
      if (key === "action-top") {
        this.$emit("stickyToTop", this.conversation);
      } else if (key === "action-delete") {
        this.$emit("delete", this.conversation);
      } else if (key === "action-mute") {
        this.$emit("mute", this.conversation);
      }
    },
    // 点击会话项：通知父组件选中该会话
    handleConversationItemClick() {
      this.$emit("click", this.conversation);
    },
  },
};
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
  align-items: center;
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
