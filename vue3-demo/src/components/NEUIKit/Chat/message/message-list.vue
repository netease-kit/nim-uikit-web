<template>
  <div class="msg-list-wrapper">
    <div
      id="message-scroll-list"
      scroll-y="true"
      :scroll-top="scrollTop"
      class="message-scroll-list"
      ref="messageListRef"
    >
      <div v-show="loadingMore" class="msg-tip">
        {{ t("loadingText") }}
      </div>
      <div class="msg-tip" v-show="noMore">{{ t("noMoreText") }}</div>
      <div v-for="(item, index) in msgs" :key="item.messageClientId">
        <MessageItem
          :msg="item"
          :index="index"
          :key="item.messageClientId"
          :reply-msgs-map="replyMsgsMap"
        >
        </MessageItem>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
/** 消息列表 */
import {
  ref,
  onBeforeMount,
  onUnmounted,
  getCurrentInstance,
  nextTick,
  onMounted,
  watch,
} from "vue";
import MessageItem from "./message-item.vue";
import emitter from "../../utils/eventBus";

import { t } from "../../utils/i18n";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import { autorun } from "mobx";
import { events } from "../../utils/constants";

import type { V2NIMTeam } from "nim-web-sdk-ng/dist/esm/nim/src/V2NIMTeamService";
import type { V2NIMMessageForUI } from "@xkit-yx/im-store-v2/dist/types/types";

const props = withDefaults(
  defineProps<{
    msgs: V2NIMMessageForUI[];
    conversationType: V2NIMConst.V2NIMConversationType;
    to: string;
    loadingMore?: boolean;
    noMore?: boolean;
    replyMsgsMap?: {
      [key: string]: V2NIMMessageForUI;
    };
  }>(),
  {}
);

const { proxy } = getCurrentInstance()!; // 获取组件实例
const messageListRef = ref<HTMLElement | null>(null);
let teamWatch = () => {};

onBeforeMount(() => {
  let team: V2NIMTeam | undefined = undefined;

  teamWatch = autorun(() => {
    team = proxy?.$UIKitStore.teamStore.teams.get(props.to);
  });
});

const scrollTop = ref(0);

// 消息滑动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
    }
  });
};

// 防抖定时器
let scrollTimer: number | null = null;

// 处理滚动事件，实现向上滚动加载更多和检测滚动到底部
const handleScroll = () => {
  if (!messageListRef.value) {
    return;
  }

  // 防抖处理，避免频繁触发
  if (scrollTimer) {
    clearTimeout(scrollTimer);
  }

  scrollTimer = setTimeout(() => {
    if (!messageListRef.value) return;

    const scrollTop = messageListRef.value.scrollTop;
    const scrollHeight = messageListRef.value.scrollHeight;
    const clientHeight = messageListRef.value.clientHeight;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // 检测是否滚动到底部（距离底部小于10px时认为到底部）
    if (distanceFromBottom !== 0 && distanceFromBottom < 10) {
      emitter.emit(events.ON_SCROLL_BOTTOM);
    }

    // 向上滚动加载更多的逻辑
    if (!props.loadingMore && !props.noMore) {
      const threshold = 100; // 距离顶部100px时触发加载
      if (scrollTop <= threshold) {
        loadMoreMessages();
      }
    }
  }, 150); // 150ms防抖延迟
};

// 加载更多消息
const loadMoreMessages = () => {
  if (!messageListRef.value) return;

  // 记录加载前的滚动状态
  const previousScrollHeight = messageListRef.value.scrollHeight;
  const previousScrollTop = messageListRef.value.scrollTop;
  const previousMsgCount = props.msgs.length;

  const msg = props.msgs.filter(
    (item) =>
      !(
        item.messageType ===
          V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CUSTOM &&
        ["beReCallMsg", "reCallMsg"].includes(item.recallType || "")
      )
  )[0];

  if (msg) {
    emitter.emit(events.GET_HISTORY_MSG, msg);

    // 监听消息数据变化，恢复滚动位置
    const unwatch = watch(
      () => props.msgs.length,
      (newLength) => {
        if (newLength > previousMsgCount && messageListRef.value) {
          nextTick(() => {
            if (messageListRef.value) {
              const newScrollHeight = messageListRef.value.scrollHeight;
              const heightDifference = newScrollHeight - previousScrollHeight;

              // 计算目标位置：保持原来的消息位置，然后向上偏移
              const targetScrollTop = previousScrollTop + heightDifference - 1;
              const finalScrollTop = Math.max(0, targetScrollTop);

              // 直接滚动到目标位置
              messageListRef.value.scrollTo({
                top: finalScrollTop,
                behavior: "instant",
              });

              // 取消监听
              unwatch();
            }
          });
        }
      }
    );
  }
};

// 获取MessageList的高度和滚动信息
const getScrollInfo = () => {
  if (!messageListRef.value) {
    return {
      height: 0,
      scrollTop: 0,
      scrollHeight: 0,
      clientHeight: 0,
      distanceFromBottom: 0,
    };
  }

  const element = messageListRef.value;
  const scrollTop = element.scrollTop;
  const scrollHeight = element.scrollHeight;
  const clientHeight = element.clientHeight;
  const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

  return {
    height: clientHeight,
    scrollTop,
    scrollHeight,
    clientHeight,
    distanceFromBottom,
  };
};

// 暴露方法给父组件
defineExpose({
  getScrollInfo,
  scrollToBottom,
  messageListRef,
});

onMounted(() => {
  // 监听滚动到底部
  emitter.on(events.ON_SCROLL_BOTTOM, scrollToBottom);

  // 添加滚动监听器，实现向上滚动加载更多
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.addEventListener("scroll", handleScroll);
    }
  });
});

onUnmounted(() => {
  emitter.off(events.ON_SCROLL_BOTTOM, scrollToBottom);
  emitter.off(events.AUDIO_URL_CHANGE);

  teamWatch();

  // 清理滚动事件监听器
  if (messageListRef.value) {
    messageListRef.value.removeEventListener("scroll", handleScroll);
  }

  // 清理防抖定时器
  if (scrollTimer) {
    clearTimeout(scrollTimer);
    scrollTimer = null;
  }
});
</script>

<style scoped>
.msg-list-wrapper {
  flex: 1;
  overflow: hidden;
  display: flex;
  height: 100%;
  box-sizing: border-box;
  padding: 0px 0px 5px 0px;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  background: #f6f8fa;
}

.msg-tip {
  text-align: center;
  color: #b3b7bc;
  font-size: 14px;
  margin-top: 10px;
  width: 100%;
}

.block {
  width: 100%;
  height: 40px;
}

.message-scroll-list {
  height: 100%;
  box-sizing: border-box;
  padding: 0 10px 10px 10px;
  overflow-y: auto;
  width: 100%;
  overflow-x: hidden;
}

.message-scroll-list {
  /* 设置滚动条样式 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

.loading-more-text {
  text-align: center;
  color: #b3b7bc;
  font-size: 14px;
  margin-top: 10px;
  margin-bottom: 10px;
  padding: 8px 0;
}
</style>
