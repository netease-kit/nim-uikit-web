<template>
  <!-- P2P 最近消息已读状态：开启开关后，展示全圆已读图标或进度扇形 -->
  <div class="p2p-msg-receipt-wrapper" v-if="isP2P && p2pMsgReceiptVisible">
    <!-- 已读：展示完整圆形已读图标 -->
    <div v-if="p2pMsgRotateDeg == 360" class="icon-read-wrapper">
      <Icon type="icon-read" :size="14"></Icon>
    </div>
    <!-- 未读：展示扇形进度（0/180/360度） -->
    <div v-else class="sector">
      <span
        class="cover-1"
        :style="`transform: rotate(${p2pMsgRotateDeg}deg)`"
      ></span>
      <span
        :class="p2pMsgRotateDeg >= 180 ? 'cover-2 cover-3' : 'cover-2'"
      ></span>
    </div>
  </div>
</template>

<script>
import Icon from "../CommonComponents/Icon.vue";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import { uiKitStore, nim } from "../utils/init";

export default {
  name: "ConversationItemRead",
  components: { Icon },
  props: {
    conversation: {
      type: Object,
      required: true,
    },
  },
  computed: {
    // P2P 已读开关（本地选项）
    p2pMsgReceiptVisible() {
      return uiKitStore?.localOptions?.p2pMsgReceiptVisible;
    },
    // 当前会话类型（P2P/TEAM）
    conversationType() {
      return nim.V2NIMConversationIdUtil?.parseConversationType(
        this.conversation.conversationId
      );
    },
    // 是否为 P2P 会话
    isP2P() {
      return (
        this.conversationType ===
        V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P
      );
    },
    // 扇形角度：根据 msgReceiptTime 与最近消息时间判断已读（360 表示已读）
    p2pMsgRotateDeg() {
      const receipt = this.conversation?.msgReceiptTime || 0;
      const last =
        (this.conversation?.lastMessage &&
          this.conversation.lastMessage.messageRefer &&
          this.conversation.lastMessage.messageRefer.createTime) ||
        0;
      return receipt >= last ? 360 : 0;
    },
  },
};
</script>

<style scoped>
/* 消息已读状态容器 */
.p2p-msg-receipt-wrapper {
  width: 17px;
  height: 22px;
  overflow: hidden;
  line-height: 18px;
  vertical-align: bottom;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 2px;
}

/* 已读图标容器 */
.icon-read-wrapper {
  margin: 0 3px 0 0;
  width: 18px;
  height: 18px;
  overflow: hidden;
  display: flex;
  align-items: center;
}

/* 扇形进度容器 */
.sector {
  display: inline-block;
  position: relative;
  overflow: hidden;
  border: 1px solid #4c84ff;
  width: 12px;
  height: 12px;
  background-color: #fff;
  border-radius: 50%;
}

/* 扇形进度遮罩层1 */
.cover-1 {
  position: absolute;
  top: 0;
  width: 50%;
  height: 100%;
  background-color: #4c84ff;
  transform-origin: right;
}

/* 扇形进度遮罩层2 */
.cover-2 {
  position: absolute;
  top: 0;
  width: 50%;
  height: 100%;
  background-color: #fff;
}

/* 扇形进度遮罩层3 */
.cover-3 {
  right: 0;
  background-color: #4c84ff;
}
</style>
