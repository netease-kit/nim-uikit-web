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
    </template>
  </div>
</template>

<script lang="ts" setup>
/** 消息文本组件 */
import Icon from "../../CommonComponents/Icon.vue";
import { parseText } from "../../utils/parseText";
import { EMOJI_ICON_MAP_CONFIG } from "../../utils/emoji";
import type { V2NIMMessageForUI } from "@xkit-yx/im-store-v2/dist/types/types";

const props = withDefaults(
  defineProps<{
    msg: V2NIMMessageForUI;
    fontSize?: number;
  }>(),
  {}
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
</style>
