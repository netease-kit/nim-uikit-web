<template>
  <div :style="emptyStyle" class="empty-wrapper">
    <img
      class="empty-img"
      src="https://yx-web-nosdn.netease.im/common/e0f58096f06c18cdd101f2614e6afb09/empty.png"
    />
    <div class="empty-text">{{ text }}</div>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  text: {
    type: String,
    default: "",
  },
  emptyStyle: {
    type: Object,
    default: () => {},
  },
});
</script>
<style scoped>
.empty-wrapper {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}
.empty-img {
  display: block;
  width: 125px;
  height: 100px;
}

.empty-text {
  display: block;
  color: #a6adb6;
  margin: 10px;
  font-size: 14px;
}
</style>
