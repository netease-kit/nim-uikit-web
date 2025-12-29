<template>
  <div class="msg-text" :style="{ fontSize: (fontSize || 14) + 'px' }">
    <span v-for="item in textArr" :key="item.key">
      <span v-if="item.type === 'text'">
        <span class="msg-text">{{ item.value }}</span>
      </span>
      <span v-else-if="item.type === 'Ait'">
        <span class="msg-text" :style="{ color: '#1861df' }">
          {{ item.value + "" }}
        </span>
      </span>
      <span v-else-if="item.type === 'emoji'">
        <Icon
          :type="EMOJI_ICON_MAP_CONFIG[item.value]"
          :size="22"
          :style="{ margin: '0 2px 2px 2px', verticalAlign: 'bottom' }"
        />
      </span>
      <span v-else-if="item.type === 'link'">
        <a
          :href="item.value"
          target="_blank"
          rel="noopener noreferrer"
          :style="{ color: '#1861df', fontSize: (fontSize || 14) + 'px' }"
        >
          {{ item.value }}
        </a>
      </span>
    </span>
  </div>
</template>

<script>
import Icon from "../../CommonComponents/Icon.vue";
import { parseText } from "../../utils/parseText";
import { EMOJI_ICON_MAP_CONFIG } from "../../utils/emoji";

export default {
  name: "MessageText",
  components: { Icon },
  props: {
    msg: {
      type: Object,
      required: true,
    },
    fontSize: {
      type: Number,
      default: 14,
    },
  },
  computed: {
    textArr() {
      const text = (this.msg && this.msg.text) || "";
      const ext = this.msg && this.msg.serverExtension;

      return parseText(text, ext);
    },
    EMOJI_ICON_MAP_CONFIG() {
      return EMOJI_ICON_MAP_CONFIG;
    },
  },
};
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
.msg-text a,
.msg-text a:hover,
.msg-text a:focus,
.msg-text a:active,
.msg-text a:visited {
  text-decoration: none;
}
</style>
