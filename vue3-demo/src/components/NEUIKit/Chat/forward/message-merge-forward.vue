<template>
  <div class="msg-merge-forward" @click.stop="historyModalVisible = true">
    <div class="msg-merge-forward-title">
      <span v-if="titleSuffix" class="title-name">{{ titleName }}</span>
      <span v-if="titleSuffix" class="title-suffix">&nbsp;{{ titleSuffix }}</span>
      <span v-else>{{ titleName }}</span>
    </div>
    <div class="msg-merge-forward-content" ref="contentRef">
      <div
        v-for="(item, index) in displayAbstracts"
        :key="index"
        v-show="shouldShow(index)"
        class="msg-merge-forward-item"
        :style="{ '-webkit-line-clamp': getMaxLines(index) }"
      >
        <span class="sender">{{ item.senderNick }}: </span>
        <span class="text">{{ item.content }}</span>
      </div>
    </div>
    <div class="msg-merge-forward-footer">
      <span>{{ t("chatHistoryText") }}</span>
    </div>
  </div>

  <ForwardMessageHistoryModal
    :visible="historyModalVisible"
    :msg="props.msg"
    @close="historyModalVisible = false"
  />
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, watch } from "vue";
import type { V2NIMMessageForUI } from "@xkit-yx/im-store-v2/dist/types/src/types";
import { t } from "../../utils/i18n";
import ForwardMessageHistoryModal from "./forward-message-history-modal.vue";
import {
  extractMergeForwardData,
  normalizeMergeForwardAbstractContent,
} from "../../utils/merge-forward-message";

const props = defineProps<{
  msg: V2NIMMessageForUI;
}>();

const historyModalVisible = ref(false);

const data = computed(() => extractMergeForwardData(props.msg));

const titleName = computed(() => {
  const sessionName =
    data.value.sessionName ||
    data.value.name ||
    data.value.sessionId ||
    data.value.to ||
    "";
  return sessionName || t("chatHistoryText");
});

const titleSuffix = computed(() => {
  const sessionName =
    data.value.sessionName ||
    data.value.name ||
    data.value.sessionId ||
    data.value.to ||
    "";
  return sessionName ? t("messageOfText") || t("chatHistoryText") : "";
});

interface AbstractItem {
  senderNick: string;
  content: string;
  userAccId: string;
}

const abstracts = computed<AbstractItem[]>(() => {
  const list = data.value.abstracts || data.value.items || [];
  if (!Array.isArray(list)) return [];

  return list.map((item: any) => ({
    senderNick:
      item.senderNick ||
      item.nick ||
      item.fromNick ||
      item.userAccId ||
      item.from ||
      "Unknown",
    content: normalizeMergeForwardAbstractContent(
      item.content || item.body || item.text || "[Message]",
      t("chatHistoryText"),
    ),
    userAccId: item.userAccId || item.from || "",
  }));
});

const displayAbstracts = computed(() => abstracts.value.slice(0, 3));
const MAX_TOTAL_LINES = 3;
const lineClamps = ref<number[]>([]);
const contentRef = ref<HTMLElement | null>(null);
const measured = ref(false);

const recalcLineClamps = async () => {
  await nextTick();
  await nextTick();
  const container = contentRef.value;
  if (!container) return;

  const items = container.querySelectorAll(
    ".msg-merge-forward-item",
  ) as NodeListOf<HTMLElement>;
  if (items.length === 0) return;

  const newClamps: number[] = [];
  let remaining = MAX_TOTAL_LINES;

  items.forEach((el) => {
    const prevDisplay = el.style.display;
    el.style.display = "";
    el.style.webkitLineClamp = "unset";

    const computedStyle = getComputedStyle(el);
    const lineHeight =
      parseFloat(computedStyle.lineHeight) ||
      parseFloat(computedStyle.fontSize) * 1.6;
    const naturalLines = Math.max(1, Math.round(el.scrollHeight / lineHeight));
    const allocated = Math.min(naturalLines, Math.max(0, remaining));

    newClamps.push(allocated);
    remaining -= allocated;

    el.style.display = prevDisplay;
    el.style.webkitLineClamp = "";
  });

  lineClamps.value = newClamps;
  measured.value = true;
};

const getMaxLines = (index: number): number => {
  if (!measured.value) return MAX_TOTAL_LINES;
  return lineClamps.value[index] ?? 0;
};

const shouldShow = (index: number): boolean => {
  if (!measured.value) return true;
  return (lineClamps.value[index] ?? 0) > 0;
};

watch(
  displayAbstracts,
  () => {
    measured.value = false;
    lineClamps.value = [];
    recalcLineClamps();
  },
  { immediate: true },
);

onMounted(() => {
  recalcLineClamps();
});
</script>

<style scoped>
.msg-merge-forward {
  width: 260px;
  background-color: #fff;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #dee0e2;
  font-size: 14px;
  cursor: pointer;
}

.msg-merge-forward-title {
  display: flex;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
  overflow: hidden;
  white-space: nowrap;
}

.title-name {
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
  min-width: 0;
}

.title-suffix {
  flex-shrink: 0;
  white-space: nowrap;
}

.msg-merge-forward-content {
  margin-bottom: 8px;
}

.msg-merge-forward-item {
  color: #666;
  font-size: 12px;
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  word-break: break-all;
}

.msg-merge-forward-item .sender {
  color: #666;
}

.msg-merge-forward-footer {
  border-top: 1px solid #f0f0f0;
  padding-top: 8px;
  color: #999;
  font-size: 12px;
}
</style>
