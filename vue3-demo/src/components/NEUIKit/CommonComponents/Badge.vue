<template>
  <div>
    <div class="dot" v-if="dot" :style="customStyle"></div>
    <div class="badge" v-else-if="text" :style="customStyle">{{ text }}</div>
    <div class="hidden">{{ props.num }}</div>
  </div>
</template>

<script lang="ts" setup>
import { StyleValue, computed } from "vue";

const props = withDefaults(
  defineProps<{
    num: number;
    max?: number;
    dot?: boolean;
    customStyle?: StyleValue;
  }>(),
  {
    max: 99,
    dot: false,
  }
);
const max = props.max || 99;
const text = computed(() => {
  return props.num > 0 ? (props.num > max ? `${max}+` : props.num + "") : "";
});
</script>

<style scoped>
.dot {
  background-color: #ff4d4f;
  color: #fff;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  box-sizing: border-box;
  z-index: 99;
}

.badge {
  background-color: #ff4d4f;
  color: #fff;
  font-size: 12px;
  min-width: 20px;
  height: 20px;
  line-height: 19px;
  border-radius: 10px;
  padding: 0 5px;
  box-sizing: border-box;
  text-align: center;
  z-index: 99;
  position: relative;
}
.hidden {
  display: none;
}
</style>
