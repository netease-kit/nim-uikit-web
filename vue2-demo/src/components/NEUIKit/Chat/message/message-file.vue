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
          <div class="msg-file-title-prefix">{{ baseName }}</div>
          <div class="msg-file-title-suffix">{{ dotExt }}</div>
        </div>
        <div class="msg-file-size">{{ parseFileSize(size) }}</div>
      </div>
    </div>
  </a>
</template>

<script>
import {
  getFileType,
  parseFileSize as parseFileSizeUtil,
} from "@xkit-yx/utils";
import Icon from "../../CommonComponents/Icon.vue";

export default {
  name: "MessageFile",
  components: { Icon },
  props: {
    msg: { type: Object, required: true },
  },
  computed: {
    attachment() {
      return (this.msg && this.msg.attachment) || {};
    },
    name() {
      return this.attachment.name || "";
    },
    ext() {
      return this.attachment.ext || "";
    },
    size() {
      return this.attachment.size || 0;
    },
    dotExt() {
      return this.ext
        ? this.ext.startsWith(".")
          ? this.ext
          : `.${this.ext}`
        : "";
    },
    baseName() {
      const n = this.name || "";
      const e = this.dotExt;
      if (!e) return n;
      if (n.toLowerCase().endsWith(e.toLowerCase())) {
        return n.slice(0, -e.length);
      }
      return n;
    },
    iconType() {
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
      return fileIconMap[getFileType(this.ext)] || "icon-weizhiwenjian";
    },
    downloadHref() {
      const _url = this.attachment.url;
      if (_url) {
        return this.addUrlSearch(_url, `download=${this.name}${this.ext}`);
      }
      return undefined;
    },
    downloadName() {
      return (this.attachment.name || "") + this.ext;
    },
  },
  methods: {
    addUrlSearch(url, search) {
      const urlObj = new URL(url);
      urlObj.search += (urlObj.search.startsWith("?") ? "&" : "?") + search;
      return urlObj.href;
    },
    parseFileSize(size) {
      return parseFileSizeUtil(size);
    },
  },
};
</script>

<style scoped>
a.msg-file-wrapper {
  height: 56px;
  display: inline-block;
  padding: 0px;
  text-decoration: none;
}

a.msg-file-wrapper:hover,
a.msg-file-wrapper:visited,
a.msg-file-wrapper:active {
  text-decoration: none;
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
  text-decoration: none;
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
  text-decoration: none;
}
</style>
