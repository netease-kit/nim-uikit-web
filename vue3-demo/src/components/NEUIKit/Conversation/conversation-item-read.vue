<template>
  <div
    class="p2p-msg-receipt-wrapper"
    v-if="
      conversationType ===
        V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P &&
      p2pMsgReceiptVisible
    "
  >
    <div v-if="p2pMsgRotateDeg == 360" class="icon-read-wrapper">
      <Icon type="icon-read" :size="14"></Icon>
    </div>
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

<script lang="ts" setup>
import { computed, getCurrentInstance } from "vue";
import Icon from "../CommonComponents/Icon.vue";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import type {
  V2NIMConversationForUI,
  V2NIMLocalConversationForUI,
} from "@xkit-yx/im-store-v2/dist/types/types";
const { proxy } = getCurrentInstance()!; // 获取组件实例

const props = withDefaults(
  defineProps<{
    conversation: V2NIMConversationForUI | V2NIMLocalConversationForUI;
  }>(),
  {}
);

// 是否需要显示 p2p 消息、p2p会话列表消息已读未读，默认 false
const p2pMsgReceiptVisible =
  proxy?.$UIKitStore.localOptions.p2pMsgReceiptVisible;

const conversationType =
  proxy?.$NIM.V2NIMConversationIdUtil.parseConversationType(
    props.conversation.conversationId
  );
const p2pMsgRotateDeg = computed(() => {
  return (props?.conversation?.msgReceiptTime || 0) >=
    (props?.conversation?.lastMessage?.messageRefer?.createTime || 0)
    ? 360
    : 0;
});
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
  width: 14px;
  height: 14px;
  background-color: #fff;
  border-radius: 50%;
  margin: 0 3px 0 0;
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
