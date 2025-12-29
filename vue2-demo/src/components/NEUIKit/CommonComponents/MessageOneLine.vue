<template>
  <div class="wrapper">
    <span class="content">
      <span v-for="item in textArr" :key="item.key">
        <span v-if="item.type === 'text'" class="msg-reply-text">
          {{ item.value }}
        </span>
        <Icon
          v-else-if="item.type === 'emoji'"
          :type="EMOJI_ICON_MAP_CONFIG[item.value]"
          :size="14"
          :iconStyle="{
            margin: '3px',
            verticalAlign: 'bottom',
            display: 'inline-block',
          }"
        />
      </span>
    </span>
  </div>
</template>

<script>
import Icon from "./Icon.vue";
import { EMOJI_ICON_MAP_CONFIG, emojiRegExp } from "../utils/emoji";

export default {
  name: "MessageOneLine",
  components: { Icon },
  props: {
    text: { type: String, default: undefined },
  },
  computed: {
    textArr() {
      return this.parseText(this.text);
    },
    EMOJI_ICON_MAP_CONFIG() {
      return EMOJI_ICON_MAP_CONFIG;
    },
  },
  methods: {
    parseText(text) {
      if (!text) return [];
      const regexEmoji = emojiRegExp;
      const matches = [];
      let match;
      while ((match = regexEmoji.exec(text)) !== null) {
        matches.push({ type: "emoji", value: match[0], index: match.index });
        const fillText = " ".repeat(match[0].length);
        text = text.replace(match[0], fillText);
      }
      text = text.replace(regexEmoji, " ");
      if (text) {
        text
          .split(" ")
          .filter((item) => item.trim())
          .map((item) => {
            const index = text.indexOf(item);
            matches.push({ type: "text", value: item, index });
            const fillText = " ".repeat(item.length);
            text = text.replace(item, fillText);
          });
      }
      return matches
        .map((item, i) => ({ ...item, key: i + item.type }))
        .sort((a, b) => a.index - b.index);
    },
  },
};
</script>

<style scoped>
.wrapper {
  font-size: 13px;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.content {
  display: inline;
  font-size: 13px;
  line-height: 18px;
}

.msg-reply-text {
  font-size: 13px !important;
  line-height: 18px;
}

.ellipsis {
  display: inline-block;
  flex-basis: 25px;
  font-size: 13px;
}
</style>
