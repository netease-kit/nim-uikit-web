<template>
  <div v-if="!isConnected && text" class="network-alert">
    {{ text }}
  </div>
</template>

<script>
import { autorun } from "../utils/store";
import { t } from "../utils/i18n";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import { uiKitStore } from "../utils/init";

export default {
  name: "NetworkAlert",
  data() {
    return {
      isConnected: true,
      text: t("connectingText"),
      uninstallConnectWatch: null,
    };
  },
  computed: {
    store() {
      return uiKitStore;
    },
  },
  created() {
    const status = this.store?.connectStore?.connectStatus;
    if (
      status === V2NIMConst.V2NIMConnectStatus.V2NIM_CONNECT_STATUS_CONNECTED
    ) {
      this.isConnected = true;
    } else if (
      status === V2NIMConst.V2NIMConnectStatus.V2NIM_CONNECT_STATUS_DISCONNECTED
    ) {
      this.isConnected = false;
      this.text = t("offlineText");
    } else {
      this.isConnected = false;
      this.text = t("connectingText");
    }

    this.uninstallConnectWatch = autorun(() => {
      const s = this.store?.connectStore?.connectStatus;
      if (s === V2NIMConst.V2NIMConnectStatus.V2NIM_CONNECT_STATUS_CONNECTED) {
        this.isConnected = true;
      } else if (
        s === V2NIMConst.V2NIMConnectStatus.V2NIM_CONNECT_STATUS_DISCONNECTED
      ) {
        this.isConnected = false;
        this.text = t("offlineText");
      } else {
        this.isConnected = false;
        this.text = t("connectingText");
      }
    });
  },
  beforeDestroy() {
    if (this.uninstallConnectWatch) this.uninstallConnectWatch();
  },
  methods: {
    t,
  },
};
</script>

<style scoped>
.network-alert {
  font-size: 14px;
  background: #fee3e6;
  color: #fc596a;
  text-align: center;
  padding: 8px 0;
  height: 36px;
  box-sizing: border-box;
}
</style>
