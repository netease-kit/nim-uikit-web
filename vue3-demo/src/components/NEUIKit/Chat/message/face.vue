<template>
  <div class="msg-face-wrapper">
    <div class="msg-face">
      <div
        @click="
          () => {
            handleEmojiClick({ key, type: emojiMap[key] });
          }
        "
        v-for="key in emojiArr"
        :key="key"
        class="msg-face-item"
      >
        <Icon :size="23" :type="emojiMap[key]"></Icon>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
/** 表情面板 */
import { emojiMap } from "../../utils/emoji";
import Icon from "../../CommonComponents/Icon.vue";

// 表情数组
const emojiArr = Object.keys(emojiMap);

const emit = defineEmits(["emojiClick"]);

// 点击表情
const handleEmojiClick = (emoji: any) => {
  emit("emojiClick", emoji);
};
</script>

<style scoped>
.msg-face-wrapper {
  box-sizing: border-box;
  width: 410px;
  height: 320px;
  background-color: #fff;
  border-radius: 6px;
  padding: 5px;
}

.msg-face {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 8px;
  padding: 5px;
}

.msg-face-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.msg-face-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
  transform: scale(1.2);
}
</style>
