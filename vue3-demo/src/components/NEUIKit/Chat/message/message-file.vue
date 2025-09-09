<template>
  <a
    class="msg-file-wrapper"
    target="_blank"
    rel="noopener noreferrer"
    :href="downloadHref"
    :download="downloadName"
    :showUnderLine="false"
  >
    <div
      :class="!msg.isSelf ? 'msg-file msg-file-in' : 'msg-file msg-file-out'"
    >
      <Icon :type="iconType" :size="32"></Icon>
      <div class="msg-file-content">
        <div class="msg-file-title">
          <div class="msg-file-title-prefix">{{ prefixName }}</div>
          <div class="msg-file-title-suffix">{{ suffixName }}</div>
        </div>
        <div class="msg-file-size">{{ parseFileSize(size) }}</div>
      </div>
    </div>
  </a>
</template>

<script lang="ts" setup>
/** 文件消息 */
import { getFileType, parseFileSize } from "@xkit-yx/utils";
import Icon from "../../CommonComponents/Icon.vue";
import type { V2NIMMessageForUI } from "@xkit-yx/im-store-v2/dist/types/types";
import type { V2NIMMessageFileAttachment } from "nim-web-sdk-ng/dist/esm/nim/src/V2NIMMessageService";
import { computed } from "vue";
const props = withDefaults(defineProps<{ msg: V2NIMMessageForUI }>(), {});
// 文件类型图标映射
const fileIconMap = {
  pdf: "icon-PPT",
  word: "icon-Word",
  excel: "icon-Excel",
  ppt: "icon-PPT",
  zip: "icon-RAR1",
  txt: "icon-qita",
  img: "icon-tupian2",
  audio: "icon-yinle",
  video: "icon-shipin",
};

const {
  name = "",
  url = "",
  ext = "",
  size = 0,
} = (props.msg.attachment as V2NIMMessageFileAttachment) || {};

// 添加url参数
const addUrlSearch = (url: string, search: string): string => {
  const urlObj = new URL(url);

  urlObj.search += (urlObj.search.startsWith("?") ? "&" : "?") + search;
  return urlObj.href;
};

// 获取文件类型
const iconType = fileIconMap[getFileType(ext)] || "icon-weizhiwenjian";

// 文件名前缀
const prefixName = name;
// 文件名后缀
const suffixName = ext;

// 下载链接
const downloadHref = computed(() => {
  if (url) {
    return addUrlSearch(
      (props.msg.attachment as V2NIMMessageFileAttachment)?.url,
      `download=${name}${ext}`
    );
  }
});

// 下载文件名
const downloadName = computed(() => {
  return (props.msg.attachment as V2NIMMessageFileAttachment)?.name + ext;
});
</script>

<style scoped>
.msg-file-wrapper {
  height: 56px;
  display: inline-block;
  padding: 0px;
}

/* 文件消息基础样式 */
.msg-file {
  height: 56px;
  display: flex;
  flex-direction: row;
  align-items: center;
  border-radius: 8px;
}

/* 接收的文件消息 */
.msg-file-in {
  margin-left: 8px;
}

/* 发送的文件消息 */
.msg-file-out {
  margin-right: 8px;
}

/* 文件内容区域 */
.msg-file-content {
  margin-left: 15px;
  max-width: 300px;
  min-width: 0;
}

/* 文件标题区域 */
.msg-file-title {
  color: #1890ff;
  font-size: 14px;
  font-weight: 400;
  display: flex;
}

/* 文件名前缀 */
.msg-file-title-prefix {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 180px;
}

/* 文件名后缀 */
.msg-file-title-suffix {
  white-space: nowrap;
}

/* 文件名 */
.msg-file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 文件大小 */
.msg-file-size {
  color: #999;
  font-size: 13px;
  margin-top: 4px;
}
</style>
