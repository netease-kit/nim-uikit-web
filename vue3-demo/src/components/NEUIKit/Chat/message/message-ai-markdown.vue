
<template>
  <div class="ai-markdown-container">
    <MarkdownRender 
      :content="messageText"
      :max-live-nodes="0"
     
      :is-dark="true"
      class="ai-markdown-content"
      :class="{ 'is-streaming': isStreaming }"
    />
    <!-- 流式加载指示器 -->
    <div v-if="isStreaming" class="streaming-indicator">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
  </div>
</template>
 
<script lang="ts" setup>
/** AI流式消息（Markdown）组件 */
import { computed } from 'vue'
import MarkdownRender from 'markstream-vue'
import { V2NIMConst } from 'nim-web-sdk-ng/dist/esm/nim'
import type { V2NIMMessageForUI } from '@xkit-yx/im-store-v2/dist/types/types'

const props = defineProps<{
  msg: V2NIMMessageForUI
}>()

// 获取消息文本
const messageText = computed(() => props.msg?.text || '')

// 判断是否正在流式输出
const isStreaming = computed(() => {
  return false
  // return props.msg.aiConfig?.aiStatus === 
  //   V2NIMConst.V2NIMMessageAIStatus.V2NIM_MESSAGE_AI_STATUS_RESPONSE
})
</script>

<style scoped>
.ai-markdown-container {
  position: relative;
  color: #000;
  text-align: left;
  word-break: break-word;
}

.ai-markdown-content {
  line-height: 1.6;
  font-size: 14px;
}

/* Markdown 全局样式 */
.ai-markdown-content :deep(h1),
.ai-markdown-content :deep(h2),
.ai-markdown-content :deep(h3),
.ai-markdown-content :deep(h4),
.ai-markdown-content :deep(h5),
.ai-markdown-content :deep(h6) {
  margin: 12px 0 8px 0;
  font-weight: 600;
  line-height: 1.4;
}

.ai-markdown-content :deep(h1) {
  font-size: 1.6em;
  border-bottom: 1px solid #e1e4e8;
  padding-bottom: 8px;
}

.ai-markdown-content :deep(h2) {
  font-size: 1.4em;
  border-bottom: 1px solid #e1e4e8;
  padding-bottom: 6px;
}

.ai-markdown-content :deep(h3) {
  font-size: 1.2em;
}

.ai-markdown-content :deep(h4) {
  font-size: 1.1em;
}

.ai-markdown-content :deep(p) {
  margin: 8px 0;
  line-height: 1.6;
}

.ai-markdown-content :deep(strong) {
  font-weight: 600;
  color: #1a1a1a;
}

.ai-markdown-content :deep(em) {
  font-style: italic;
}

.ai-markdown-content :deep(del) {
  text-decoration: line-through;
  opacity: 0.7;
}

/* 行内代码样式 */
.ai-markdown-content :deep(code:not(pre code)) {
  background-color: rgba(110, 118, 129, 0.2);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
  color: #f85149;
}

/* 代码块容器 - 黑色主题 */
.ai-markdown-content :deep(pre) {
  background-color: #0d1117 !important;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 12px 0;
  border: 1px solid #30363d;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* 代码块内代码 - 设置默认浅色，Shiki 会覆盖 */
.ai-markdown-content :deep(pre code) {
  background-color: transparent !important;
  padding: 0;
  font-size: 0.95em;
  line-height: 1.5;
  color: #c9d1d9 !important; /* 默认浅灰色文字 */
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

/* Shiki 高亮的 token 样式 */
.ai-markdown-content :deep(pre code .line) {
  color: inherit;
}

.ai-markdown-content :deep(pre code span[style]) {
  /* 保留 Shiki 的内联样式优先级 */
}

/* 引用样式 */
.ai-markdown-content :deep(blockquote) {
  border-left: 4px solid #0969da;
  padding: 8px 16px;
  margin: 12px 0;
  background-color: #f6f8fa;
  color: #57606a;
  border-radius: 0 4px 4px 0;
}

.ai-markdown-content :deep(blockquote p) {
  margin: 4px 0;
}

/* 列表样式 */
.ai-markdown-content :deep(ul),
.ai-markdown-content :deep(ol) {
  margin: 8px 0;
  padding-left: 24px;
}

.ai-markdown-content :deep(li) {
  margin: 4px 0;
  line-height: 1.6;
}

.ai-markdown-content :deep(ul ul),
.ai-markdown-content :deep(ol ul),
.ai-markdown-content :deep(ul ol),
.ai-markdown-content :deep(ol ol) {
  margin: 4px 0;
}

/* 表格样式 */
.ai-markdown-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 12px 0;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  display: block;
  overflow-x: auto;
}

.ai-markdown-content :deep(table th) {
  background: linear-gradient(180deg, #f8f9fa 0%, #f1f3f5 100%);
  color: #333;
  font-weight: 600;
  text-align: left;
  padding: 10px 12px;
  border: 1px solid #e1e4e8;
  border-bottom: 2px solid #d0d7de;
  font-size: 0.95em;
}

.ai-markdown-content :deep(table td) {
  padding: 8px 12px;
  border: 1px solid #e1e4e8;
  background-color: #fff;
  color: #333;
}

.ai-markdown-content :deep(table tbody tr:hover) {
  background-color: #f6f8fa;
  transition: background-color 0.2s ease;
}

.ai-markdown-content :deep(table tbody tr:nth-child(even)) {
  background-color: #fafbfc;
}

.ai-markdown-content :deep(table tbody tr:nth-child(even):hover) {
  background-color: #f6f8fa;
}

/* 链接样式 */
.ai-markdown-content :deep(a) {
  color: #0969da;
  text-decoration: none;
  display: inline;
  margin: 0;
  padding: 0;
  font-weight: 500;
}

.ai-markdown-content :deep(a:hover) {
  text-decoration: underline;
  color: #0550ae;
}

/* 分割线 */
.ai-markdown-content :deep(hr) {
  border: none;
  border-top: 2px solid #e1e4e8;
  margin: 16px 0;
}

/* 图片样式 */
.ai-markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  margin: 8px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 流式加载指示器 */
.streaming-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
}

.streaming-indicator .dot {
  width: 6px;
  height: 6px;
  background-color: #0969da;
  border-radius: 50%;
  animation: pulse 1.4s infinite ease-in-out;
}

.streaming-indicator .dot:nth-child(1) {
  animation-delay: 0s;
}

.streaming-indicator .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.streaming-indicator .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes pulse {
  0%, 60%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  30% {
    transform: scale(1.2);
    opacity: 1;
  }
}

/* 流式输出时的光标效果 */
.ai-markdown-content.is-streaming::after {
  content: '▋';
  color: #0969da;
  animation: blink 1s step-end infinite;
  margin-left: 2px;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}
</style>

