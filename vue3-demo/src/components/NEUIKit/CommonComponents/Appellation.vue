<template>
  <span
    class="appellation"
    :style="{ color: color, fontSize: fontSize + 'px' }"
    >{{ appellation }}</span
  >
</template>

<script lang="ts" setup>
import { autorun } from "mobx";
import { onUnmounted, ref, getCurrentInstance } from "vue";
const { proxy } = getCurrentInstance()!;

const appellation = ref();

const { 
  account, 
  teamId = undefined, 
  ignoreAlias = false, 
  nickFromMsg = undefined,
  color = "#000",
  fontSize = 14
} = defineProps<{
  account: string;
  teamId?: string;
  ignoreAlias?: boolean;
  nickFromMsg?: string;
  color?: string;
  fontSize?: number;
}>();

const uninstallAppellationWatch = autorun(() => {
  appellation.value = proxy?.$UIKitStore.uiStore.getAppellation({
    account,
    teamId,
    ignoreAlias,
    nickFromMsg,
  });
});
onUnmounted(() => {
  uninstallAppellationWatch();
});
</script>

<style scoped>
.appellation {
  color: #000;
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
