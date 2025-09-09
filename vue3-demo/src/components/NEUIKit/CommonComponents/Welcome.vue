<template>
  <div class="welcome-wrap">
    <img
      src="https://yx-web-nosdn.netease.im/common/630b48dc545af0633aaaa53bbd65cbb0/欢迎使用云信.png"
    />
    {{ t("welcomeText") }}
  </div>
</template>

<script setup lang="ts">
import { t } from "../utils/i18n";
</script>

<style scoped>
.welcome-wrap {
  width: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 260px;
  color: #666666;
  background-color: #ffffff;
  max-width: 260px;
  max-height: 260px;
  position: relative;
  top: -10%;
  right: 5%;
}

.welcome-wrap > img {
  max-width: 260px;
  margin-bottom: 6px;
}
</style>
