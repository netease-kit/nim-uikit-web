<template>
  <div class="wrapper">
    <span class="content">
      <template v-for="item in textArr" :key="item.key">
        <template v-if="item.type === 'text'" class="msg-reply-text">
          {{ item.value }}
        </template>
        <template class="icon" v-else-if="item.type === 'emoji'">
          <Icon
            :type="EMOJI_ICON_MAP_CONFIG[item.value]"
            :size="14"
            :iconStyle="{
              margin: '3px',
              verticalAlign: 'bottom',
              display: 'inline-block',
            }"
          />
        </template>
      </template>
    </span>
  </div>
</template>

<script lang="ts" setup>
import Icon from "./Icon.vue";
import { EMOJI_ICON_MAP_CONFIG, emojiRegExp } from "../utils/emoji";
import { computed } from "vue";

const props = withDefaults(defineProps<{ text: string | undefined }>(), {});

// 筛选出文本和表情
const parseText = (text: string | undefined) => {
  if (!text) return [];
  const regexEmoji = emojiRegExp;
  const matches: {
    type: "emoji" | "text";
    value: string;
    index: number;
  }[] = [];
  let match;

  while ((match = regexEmoji.exec(text)) !== null) {
    matches.push({
      type: "emoji",
      value: match[0],
      index: match.index,
    });
    const fillText = " ".repeat(match[0].length);
    text = text.replace(match[0], fillText);
  }

  text = text.replace(regexEmoji, " ");

  if (text) {
    text
      .split(" ")
      .filter((item) => item.trim())
      .map((item) => {
        const index = text?.indexOf(item);
        matches.push({
          type: "text",
          value: item,
          //@ts-ignore
          index,
        });
        const fillText = " ".repeat(item.length);
        text = text?.replace(item, fillText);
      });
  }

  return matches
    .map((item, index) => {
      return {
        ...item,
        key: index + item.type,
      };
    })
    .sort((a, b) => a?.index - b?.index);
};

const textArr = computed(() => {
  return parseText(props.text);
});
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
