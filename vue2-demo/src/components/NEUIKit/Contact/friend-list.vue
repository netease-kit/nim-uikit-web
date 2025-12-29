<template>
  <div class="friend-list-container">
    <RecycleScroller
      v-if="flattenedFriendList.length > 0"
      class="friend-group-list"
      :items="flattenedFriendList"
      :item-size="60"
      :buffer="100"
      key-field="id"
      v-slot="{ item }"
    >
      <div :key="item.id">
        <!-- 分组标题 -->
        <div v-if="item.type === 'group'" class="friend-group-title">
          {{ item.title }}
        </div>
        <!-- 好友项 -->
        <div
          v-else
          class="friend-item"
          @click="handleFriendItemClick(item.data)"
        >
          <Avatar :account="item.data.accountId" />
          <Appellation class="friend-name" :account="item.data.accountId" />
        </div>
      </div>
    </RecycleScroller>

    <Empty
      v-else
      :text="t('noFriendText')"
      :emptyStyle="{
        marginTop: '100px',
      }"
    />

    <UserCardModal
      v-if="showUserCard"
      :visible="showUserCard"
      :account="selectedAccount"
      @close="handleCloseUserCard"
      @update:visible="handleUpdateVisible"
      @footClick="$emit('afterSendMsgClick')"
    />
  </div>
</template>

<script>
import Avatar from "../CommonComponents/Avatar.vue";
import UserCardModal from "../CommonComponents/UserCardModal.vue";
import { RecycleScroller } from "vue-virtual-scroller";
import { autorun } from "mobx";
import { friendGroupByPy } from "../utils/friend";
import Appellation from "../CommonComponents/Appellation.vue";
import Empty from "../CommonComponents/Empty.vue";
import { t } from "../utils/i18n";
import { uiKitStore } from "../utils/init";

export default {
  name: "FriendList",
  components: { Avatar, UserCardModal, RecycleScroller, Empty, Appellation },
  props: {},
  data() {
    return {
      store: uiKitStore,
      flatList: [],
      showUserCard: false,
      selectedAccount: "",
      uninstallFriendListWatch: null,
    };
  },
  created() {
    //   这两个 Map 是 缓存（复用）列表 item 对象 用的，目的是减少“点击头像导致列表整体刷新/抖动”的感知。

    // - this._friendItemCache = new Map() ：缓存“好友行”的 item 对象

    //   - key 用的是稳定的 friend:${accountId}
    //   - value 是传给 RecycleScroller 的 item： { id, type: 'friend', data: { accountId } }
    //   - 下次 autorun 重跑时，如果同一个 accountId 还在列表里，就复用同一个对象引用，而不是重新 new 一个。
    // - this._groupItemCache = new Map() ：缓存“分组标题”的 item 对象

    //   - key 用的是 group:${groupKey}
    //   - value 是 { id, type: 'group', title } ，同理复用。
    // 为什么要这么做：

    // - 之前每次重算都会创建一堆新对象 + 新数组， RecycleScroller 收到“全新 items”后会更倾向于刷新可见区域。
    // - 现在通过缓存让 item 的引用更稳定 ，并且配合 this.flatList.splice(...) 做“原地更新”（数组引用不变），从而让更新粒度更小、滚动容器更不容易整块重绘。
    this._friendItemCache = new Map();
    this._groupItemCache = new Map();
  },
  computed: {
    flattenedFriendList() {
      return this.flatList || [];
    },
  },
  methods: {
    t,
    handleFriendItemClick(friend) {
      this.selectedAccount = friend && friend.accountId;
      this.showUserCard = true;
    },
    handleCloseUserCard() {
      this.showUserCard = false;
      this.selectedAccount = "";
    },
    handleUpdateVisible(visible) {
      this.showUserCard = !!visible;
      if (!visible) this.selectedAccount = "";
    },
  },
  mounted() {
    //  两处优化，目标是让列表 key 更稳定 + items 引用不变 ，尽量减少 RecycleScroller 的刷新范围。

    // - 之前每次 autorun 都会生成全新的 friendGroupList → flattenedFriendList 也会生成全新的数组/对象树， RecycleScroller 收到新 items 引用就会刷新可见项。
    // - 现在改成：
    //   - 用 data 里的 flatList 作为 RecycleScroller 的 items （数组引用保持不变）
    //   - group/friend 的 id 改为稳定值： group:${groupKey} / friend:${accountId}
    //   - 通过 _groupItemCache / _friendItemCache 复用 item 对象引用，并用 this.flatList.splice(...) 原地更新数组内容
    // 这样即使 autorun 必然重跑， RecycleScroller 在大多数情况下不会因为 items 引用变化而“全量刷新”，实际更新会更集中在可见区域。

    this.uninstallFriendListWatch = autorun(() => {
      const friends = this.store?.uiStore.friends || [];
      const blacklistRaw = this.store?.relationStore.blacklist;
      const blacklist = Array.isArray(blacklistRaw)
        ? blacklistRaw
        : Array.from(blacklistRaw || []);

      const data = (friends || [])
        .filter((item) => !blacklist.includes(item.accountId))
        .map((item) => ({
          accountId: item.accountId,
          appellation: this.store?.uiStore.getAppellation({
            account: item.accountId,
          }),
        }));

      const grouped = friendGroupByPy(data, { firstKey: "appellation" }, false);
      const next = [];

      (grouped || []).forEach((group) => {
        const groupKey = (group && group.key) || "";
        const groupId = `group:${groupKey}`;
        let groupItem = this._groupItemCache.get(groupId);
        if (!groupItem) {
          groupItem = { id: groupId, type: "group", title: groupKey };
          this._groupItemCache.set(groupId, groupItem);
        } else {
          groupItem.title = groupKey;
        }
        next.push(groupItem);

        (group.data || []).forEach((friend) => {
          const accountId = friend && friend.accountId;
          if (!accountId) return;
          const friendId = `friend:${accountId}`;
          let friendItem = this._friendItemCache.get(friendId);
          if (!friendItem) {
            friendItem = {
              id: friendId,
              type: "friend",
              data: { accountId },
            };
            this._friendItemCache.set(friendId, friendItem);
          }
          next.push(friendItem);
        });
      });

      this.flatList.splice(0, this.flatList.length, ...next);
    });
  },
  beforeDestroy() {
    if (typeof this.uninstallFriendListWatch === "function") {
      try {
        this.uninstallFriendListWatch();
      } catch (error) {
        console.error("uninstallFriendListWatch error", error);
      }
      this.uninstallFriendListWatch = null;
    }

    if (this._friendItemCache) this._friendItemCache.clear();
    if (this._groupItemCache) this._groupItemCache.clear();
  },
};
</script>

<style scoped>
.friend-list-container {
  height: 100%;
  overflow: hidden; /* 改为 hidden，让 RecycleScroller 处理滚动 */
}

.friend-group-list {
  height: 100%;
  padding: 0;
}

.friend-group-item {
  margin-bottom: 0;
}

.friend-group-title {
  height: 40px;
  line-height: 40px;
  font-size: 16px;
  font-weight: 500;
  color: #999;
  background-color: #f6f8fa;
  padding: 0 20px;
  border-bottom: 1px solid #e9e9e9;
  position: relative;
  top: 15px;
  z-index: 1;
}

.friend-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
  min-height: 60px;
  box-sizing: border-box;
}

.friend-item:hover {
  background-color: #f8f9fa;
}

.friend-item:last-child {
  border-bottom: none;
}

.friend-name {
  margin-left: 12px;
  color: #333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  line-height: 1.4;
}
</style>
