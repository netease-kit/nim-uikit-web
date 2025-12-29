<template>
  <div
    class="avatar"
    :style="{ width: avatarSize + 'px', height: avatarSize + 'px' }"
  >
    <div class="img-mask"></div>
    <img
      :lazy-load="true"
      class="avatar-img"
      v-if="avatarUrl"
      :src="avatarUrl"
      draggable="false"
      mode="aspectFill"
    />
    <div v-else class="avatar-name-wrapper" :style="{ backgroundColor: color }">
      <div class="avatar-name-text" :style="{ fontSize: fontSizeValue + 'px' }">
        {{ appellation }}
      </div>
    </div>
  </div>
</template>

<script>
import { getAvatarBackgroundColor } from "../utils";
import { autorun } from "../utils/store";
import { uiKitStore } from "../utils/init";

export default {
  name: "NEUIAvatar",
  props: {
    account: { type: String },
    teamId: { type: String, default: "" },
    avatar: { type: String, default: "" },
    size: { type: [Number, String], default: "" },
    fontSize: { type: [Number, String], default: "12" },
    isRedirect: { type: Boolean, default: false },
  },
  data() {
    return {
      appellation: "",
      user: null,
    };
  },
  computed: {
    avatarSize() {
      const n = Number(this.size);
      return n > 0 ? n : 42;
    },
    avatarUrl() {
      return this.avatar || (this.user && this.user.avatar) || "";
    },
    color() {
      return getAvatarBackgroundColor(this.account);
    },
    fontSizeValue() {
      const n = Number(this.fontSize);
      return n > 0 ? n : 12;
    },
  },
  created() {
    this._dispose = autorun(async () => {
      const store = uiKitStore;
      if (this.account) {
        store?.userStore?.getUserActive(this.account)?.then((data) => {
          this.user = data;
        });
      }

      const uiStore = store && store.uiStore;
      if (uiStore && uiStore.getAppellation) {
        const text = uiStore.getAppellation({
          account: this.account,
          teamId: this.teamId,
          ignoreAlias: true,
        });
        this.appellation = (text || "").slice(-2);
      }
    });
  },
  beforeDestroy() {
    if (this._dispose) this._dispose();
  },
};
</script>

<style scoped>
.avatar {
  overflow: hidden;
  border-radius: 50%;
  flex-shrink: 0;
  position: relative;
  user-select: none;
}

.img-mask {
  position: absolute;
  z-index: 10;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  opacity: 0;
  pointer-events: none;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.avatar-name-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-name-text {
  color: #fff;
  size: 14px;
}
</style>
