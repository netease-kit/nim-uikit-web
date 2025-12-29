<template>
  <div>
    <div class="dot" v-if="dot" :style="customStyle"></div>
    <div class="badge" v-else-if="text" :style="customStyle">{{ text }}</div>
    <div class="hidden">{{ num }}</div>
  </div>
</template>

<script>
export default {
  name: "NEUIBadge",
  props: {
    num: { type: Number, required: true },
    max: { type: Number, default: 99 },
    dot: { type: Boolean, default: false },
    customStyle: { type: [Object, Array], default: () => ({}) },
  },
  computed: {
    text() {
      const max = this.max != null ? this.max : 99;
      const n = this.num || 0;
      return n > 0 ? (n > max ? `${max}+` : String(n)) : "";
    },
  },
};
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
