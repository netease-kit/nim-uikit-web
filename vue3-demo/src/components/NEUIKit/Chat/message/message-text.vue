<template>
  <div class="msg-text" :style="{ fontSize: (fontSize || 14) + 'px' }">
    <template v-for="(item, index) in textArr" :key="item.key">
      <template v-if="item.type === 'text'">
        <span class="msg-text">{{ item.value }}</span>
      </template>
      <template v-else-if="item.type === 'Ait'">
        <text class="msg-text" :style="{ color: '#1861df' }">
          {{ " " + item.value + " " }}
        </text>
      </template>
      <template v-else-if="item.type === 'emoji'">
        <Icon
          :type="EMOJI_ICON_MAP_CONFIG[item.value]"
          :size="fontSize || 22"
          :style="{ margin: '0 2px 2px 2px', verticalAlign: 'bottom' }"
        />
      </template>
      <template v-else-if="item.type === 'link'">
        <a
          :href="item.value"
          target="_blank"
          rel="noopener noreferrer"
          :style="{ color: '#1861df', fontSize: (fontSize || 14) + 'px' }"
        >
          {{ item.value }}
        </a>
      </template>
      <!-- <template v-else-if="item.type === 'markdown'">
        <MessageAIMarkdown :msg="props.msg" />
      </template> -->
    </template>
  </div>
</template>

<script lang="ts" setup>
/** 消息文本组件 */
import Icon from "../../CommonComponents/Icon.vue";
import { parseText } from "../../utils/parseText";
import { EMOJI_ICON_MAP_CONFIG } from "../../utils/emoji";
import MessageAIMarkdown from "./message-ai-markdown.vue";

import type { V2NIMMessageForUI } from "@xkit-yx/im-store-v2/dist/types/types";

const props = withDefaults(
  defineProps<{
    msg: V2NIMMessageForUI;
    fontSize?: number;
  }>(),
  {},
);

// 解析文本
const textArr = parseText(props.msg?.text || "", props.msg?.serverExtension);
</script>

<style scoped>
.msg-text {
  color: #000;
  text-align: left;
  overflow-y: auto;
  word-break: break-all;
  word-wrap: break-word;
  white-space: break-spaces;
}

/* Markdown 内容样式 */
.markdown-content {
  color: #000;
  line-height: normal;
  word-break: break-word;
}

/* 为了让 markdown 样式生效，需要使用 :deep() 选择器 */
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin: 8px 0 4px 0;
  font-weight: bold;
}

.markdown-content :deep(h1) {
  font-size: 1.5em;
}

.markdown-content :deep(h2) {
  font-size: 1.3em;
}

.markdown-content :deep(h3) {
  font-size: 1.1em;
}

.markdown-content :deep(strong) {
  font-weight: bold;
}

.markdown-content :deep(em) {
  font-style: italic;
}

.markdown-content :deep(code) {
  background-color: #f1f3f4;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: "Courier New", monospace;
  font-size: 0.9em;
}

.markdown-content :deep(pre) {
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 8px 0;
  border-left: 4px solid #e1e4e8;
}

.markdown-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid #dfe2e5;
  padding-left: 12px;
  margin: 8px 0;
  color: #6a737d;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 4px 0;
  padding-left: 20px;
}

.markdown-content :deep(li) {
  margin: 0;
  line-height: 1.5;
}

/* 表格容器 - 支持横向滚动 */
.markdown-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 12px 0;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  display: block;
  overflow-x: auto;
  white-space: nowrap;
}

/* 表头样式 */
.markdown-content :deep(table th) {
  background: linear-gradient(180deg, #f8f9fa 0%, #f1f3f5 100%);
  color: #333;
  font-weight: 600;
  text-align: left;
  padding: 10px 12px;
  border: 1px solid #e1e4e8;
  border-bottom: 2px solid #d0d7de;
  font-size: 0.95em;
}

/* 单元格样式 */
.markdown-content :deep(table td) {
  padding: 8px 12px;
  border: 1px solid #e1e4e8;
  background-color: #fff;
  color: #333;
}

/* 表格行悬停效果 */
.markdown-content :deep(table tbody tr:hover) {
  background-color: #f6f8fa;
  transition: background-color 0.2s ease;
}

/* 斑马纹效果 */
.markdown-content :deep(table tbody tr:nth-child(even)) {
  background-color: #fafbfc;
}

.markdown-content :deep(table tbody tr:nth-child(even):hover) {
  background-color: #f6f8fa;
}

/* 表格内链接样式 */
.markdown-content :deep(table a) {
  color: #0969da;
  font-weight: 500;
}

.markdown-content :deep(a) {
  color: #1861df;
  text-decoration: none;
  display: inline;
  margin: 0;
  padding: 0;
  line-height: inherit;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}

.markdown-content :deep(del) {
  text-decoration: line-through;
}

.markdown-content :deep(p) {
  margin: 4px 0;
}

.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}
</style>
