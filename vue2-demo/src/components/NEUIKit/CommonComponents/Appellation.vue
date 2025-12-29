<template>
  <span
    class="appellation"
    :style="{ color: color, fontSize: fontSize + 'px' }"
    >{{ appellation }}</span
  >
</template>

<script>
import { autorun } from "../utils/store";
import { uiKitStore } from "../utils/init";

export default {
  name: "NEUIAppellation",
  props: {
    account: {
      type: String,
      required: true,
    },
    teamId: {
      type: String,
      default: undefined,
    },
    ignoreAlias: {
      type: Boolean,
      default: false,
    },
    nickFromMsg: {
      type: String,
      default: undefined,
    },
    color: {
      type: String,
      default: "#000",
    },
    fontSize: {
      type: Number,
      default: 14,
    },
  },
  data() {
    return {
      appellation: "",
    };
  },
  created() {
    this._dispose = autorun(() => {
      this.appellation = uiKitStore.uiStore?.getAppellation({
        account: this.account,
        teamId: this.teamId,
        ignoreAlias: this.ignoreAlias,
        nickFromMsg: this.nickFromMsg,
      });
    });
  },
  beforeDestroy() {
    if (this._dispose) this._dispose();
  },
};
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
