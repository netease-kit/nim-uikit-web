<template>
  <div class="black-list-container">
    <RecycleScroller
      v-if="blacklist.length > 0"
      class="black-list-content"
      :items="blacklist"
      :item-size="60"
      :buffer="100"
      key-field="accountId"
      v-slot="{ item }"
    >
      <div
        @click="handleItemClick(item)"
        class="black-item"
        :key="item.accountId"
      >
        <div class="item-left">
          <Avatar :account="item.accountId" />
          <Appellation class="black-name" :account="item.accountId" />
        </div>
        <div class="black-button" @click.stop="handleClick(item.accountId)">
          {{ t("removeBlacklist") }}
        </div>
      </div>
    </RecycleScroller>

    <Empty
      v-else
      :emptyStyle="{
        marginTop: '100px',
      }"
      :text="t('blacklistEmptyText')"
    />

    <UserCardModal
      v-if="showUserCard"
      :visible="showUserCard"
      :account="selectedAccount"
      @close="handleCloseUserCard"
      @update:visible="handleUpdateVisible"
      @footClick="$emit('onBlackItemClick')"
    />
  </div>
</template>

<script>
import { autorun } from "mobx";
import { RecycleScroller } from "vue-virtual-scroller";
import Empty from "../CommonComponents/Empty.vue";
import Avatar from "../CommonComponents/Avatar.vue";
import Appellation from "../CommonComponents/Appellation.vue";
import { t } from "../utils/i18n";
import { toast } from "../utils/toast";
import UserCardModal from "../CommonComponents/UserCardModal.vue";
import { uiKitStore } from "../utils/init";

export default {
  name: "BlackList",
  components: { RecycleScroller, Empty, Avatar, Appellation, UserCardModal },
  props: {},
  data() {
    return {
      store: uiKitStore,
      blacklist: [],
      users: null,
      showUserCard: false,
      selectedAccount: "",
      uninstallBlacklistWatch: null,
      uninstallUsersWatch: null,
    };
  },
  methods: {
    t,
    async handleClick(account) {
      try {
        await this.store?.relationStore.removeUserFromBlockListActive(account);
        toast.success(t("removeBlackSuccessText"));
      } catch (error) {
        toast.info(t("removeBlackFailText"));
      }
    },
    handleCloseUserCard() {
      this.showUserCard = false;
      this.selectedAccount = "";
    },
    handleUpdateVisible(visible) {
      this.showUserCard = !!visible;
      if (!visible) this.selectedAccount = "";
    },
    handleItemClick(item) {
      this.selectedAccount = item && item.accountId;
      this.showUserCard = true;
    },
  },
  mounted() {
    this.uninstallBlacklistWatch = autorun(() => {
      const list = (this.store?.relationStore.blacklist || []).map((acc) => ({
        accountId: acc,
      }));
      this.blacklist = list;
    });
    this.uninstallUsersWatch = autorun(() => {
      this.users = this.store?.userStore.users;
    });
  },
  beforeDestroy() {
    if (typeof this.uninstallBlacklistWatch === "function") {
      try {
        this.uninstallBlacklistWatch();
      } catch (error) {
        console.error("uninstallBlacklistWatch error", error);
      }
      this.uninstallBlacklistWatch = null;
    }
    if (typeof this.uninstallUsersWatch === "function") {
      try {
        this.uninstallUsersWatch();
      } catch (error) {
        console.error("uninstallUsersWatch error", error);
      }
      this.uninstallUsersWatch = null;
    }
  },
};
</script>

<style scoped>
.black-list-container {
  height: 100%;
  overflow: hidden; /* 改为 hidden，让 RecycleScroller 处理滚动 */
}

.black-list-subtitle {
  color: #b3b7bc;
  font-size: 14px;
  padding: 10px 20px;
  text-align: center;
  background-color: #f8f9fa;
  margin: 0;
  border-bottom: 1px solid #e9eff5;
}

.black-list-content {
  height: 100%;
  padding: 0;
}

.black-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 20px;
  border-bottom: 1px solid #f5f8fc;
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.black-item:hover {
  background-color: #f8f9fa;
}

.black-item:last-child {
  border-bottom: none;
}

.item-left {
  display: flex;
  align-items: center;
  width: 70%;
}

.black-name {
  margin-left: 10px;
  font-size: 16px;
  padding-right: 20px;
  color: #000;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.black-button {
  margin: 0;
  width: 60px;
  height: 32px;
  line-height: 32px;
  font-size: 14px;
  color: #337eef;
  border: 1px solid #337eef;
  text-align: center;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.black-button:hover {
  background-color: #337eef;
  color: #fff;
}
</style>
