<template>
  <div class="tip">
    <div v-if="!isConnected && text" class="network-alert">
      {{ text }}
    </div>
    <div v-else class="security-tip">
      {{ t("securityTipText") }}
    </div>
  </div>
</template>

<script>
import { autorun } from "../../../components/NEUIKit/utils/store";
import { t } from "../../../components/NEUIKit/utils/i18n";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import { uiKitStore } from "../../../components/NEUIKit/utils/init";

export default {
  name: "NEUIKitTip",
  data() {
    return {
      isConnected: true,
      text: t("connectingText"),
    };
  },
  methods: { t },
  mounted() {
    const status =
      uiKitStore && uiKitStore.connectStore && uiKitStore.connectStore.connectStatus;
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
    this._dispose = autorun(() => {
      const connectStatus =
        uiKitStore && uiKitStore.connectStore && uiKitStore.connectStore.connectStatus;
      if (connectStatus === V2NIMConst.V2NIMConnectStatus.V2NIM_CONNECT_STATUS_CONNECTED) {
        this.isConnected = true;
      } else if (
        connectStatus === V2NIMConst.V2NIMConnectStatus.V2NIM_CONNECT_STATUS_DISCONNECTED
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
    if (this._dispose) this._dispose();
  },
};
</script>

<style scoped>
.tip {
  height: 36px;
}
.network-alert {
  font-size: 14px;
  background: #fee3e6;
  color: #fc596a;
  text-align: center;
  padding: 8px 0;
  height: 36px !important;
  flex-shrink: 0;
}

.security-tip {
  background: #fff5e1;
  height: 36px;
  text-align: center;
  line-height: 36px;
  color: #eb9718;
  font-size: 14px;
  width: 100%;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
}
</style>
