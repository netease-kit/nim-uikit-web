<template>
  <Modal
    :visible="visible"
    :showDefaultFooter="false"
    :maskClosable="true"
    @close="handleClose"
    @cancel="handleClose"
    :top="100"
    :width="800"
    :height="450"
  >
    <div class="search-container-wrapper">
      <div class="search-input-wrapper">
        <div class="search-icon-wrapper">
          <Icon
            iconClassName="search-icon"
            :size="16"
            color="#A6ADB6"
            type="icon-sousuo"
          ></Icon>
        </div>
        <!-- 输入框：使用 NEUI Input 的 v-model（prop: value, event: input）绑定到 searchText -->
        <Input
          class="input"
          :value="searchText"
          :inputStyle="{
            backgroundColor: '#F5F7FA',
          }"
          :autofocus="inputFocus"
          @input="onInput"
          @focus="onInputFocus"
          @blur="onInputBlur"
          :placeholder="t('searchTitleText')"
        />
      </div>
      <div v-if="searchResult.length > 0" class="search-result-wrapper">
        <!-- 列表渲染：虚拟滚动组件按 renderKey 渲染搜索结果 -->
        <RecycleScroller
          class="search-scroller"
          :items="searchResult"
          :item-size="50"
          :buffer="5"
          key-field="renderKey"
          v-slot="{ item }"
        >
          <div :key="item.renderKey">
            <div class="result-title" v-if="item.id == 'friends'">
              {{ t("friendText") }}
            </div>
            <div class="result-title" v-else-if="item.id == 'discussions'">
              {{ t("discussionTitleText") }}
            </div>
            <div class="result-title" v-else-if="item.id == 'groups'">
              {{ t("teamText") }}
            </div>
            <div v-else class="search-item-wrapper">
              <SearchResultItem :item="item" @item-click="handleItemClick" />
            </div>
          </div>
        </RecycleScroller>
      </div>
      <div v-if="searchResult.length == 0 && searchText">
        <Empty
          :emptyStyle="{
            marginTop: '70px',
          }"
          :text="t('searchNoResText')"
        />
      </div>
    </div>
  </Modal>
</template>

<script>
import { autorun } from "mobx";
import { RecycleScroller } from "vue-virtual-scroller";
import { t } from "../utils/i18n";
import { showToast } from "../utils/toast";
import Icon from "../CommonComponents/Icon.vue";
import SearchResultItem from "./search-result-item.vue";
import Empty from "../CommonComponents/Empty.vue";
import Input from "../CommonComponents/Input.vue";
import Modal from "../CommonComponents/Modal.vue";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import { isDiscussionFunc } from "../utils";
import { uiKitStore } from "../utils/init";

export default {
  name: "SearchModal",
  components: { Icon, SearchResultItem, Empty, Input, Modal, RecycleScroller },
  props: {
    visible: { type: Boolean, default: false },
  },
  data() {
    return {
      store: uiKitStore,
      inputFocus: false,
      searchText: "",
      searchList: [],
      uninstallSearchWatch: null,
    };
  },
  computed: {
    // 能力开关：是否启用云端会话（影响后续插入会话的方式）
    enableV2CloudConversation() {
      return this.store?.sdkOptions?.enableV2CloudConversation;
    },
    // 搜索结果：根据输入关键字对好友/群组/讨论组进行过滤并扁平化为可渲染列表
    searchResult() {
      // 将分组列表（friends/discussions/groups）扁平化为带 renderKey 的一维数组
      const handleFinalSections = (finalSections) => {
        const res = [];
        (finalSections || []).forEach((item) => {
          if (item.id === "friends") {
            res.push({ id: "friends", renderKey: "friends" });
            (item.list || []).forEach((it) =>
              res.push({ ...it, renderKey: it.accountId })
            );
          } else if (item.id === "discussions") {
            res.push({ id: "discussions", renderKey: "discussions" });
            (item.list || []).forEach((it) =>
              res.push({ ...it, renderKey: it.teamId })
            );
          } else if (item.id === "groups") {
            res.push({ id: "groups", renderKey: "groups" });
            (item.list || []).forEach((it) =>
              res.push({ ...it, renderKey: it.teamId })
            );
          }
        });
        return res;
      };

      if (this.searchText) {
        // 根据关键字过滤三个分组中的列表，保留命中项
        const finalSections = (this.searchList || [])
          .map((item) => {
            if (item.id === "friends") {
              return {
                ...item,
                list: (item.list || []).filter((it) => {
                  return (
                    (it.alias || "").includes(this.searchText) ||
                    (it.name || "").includes(this.searchText) ||
                    (it.accountId || "").includes(this.searchText)
                  );
                }),
              };
            }
            if (item.id === "discussions") {
              return {
                ...item,
                list: (item.list || []).filter((it) => {
                  return (it.name || it.teamId || "").includes(this.searchText);
                }),
              };
            }
            if (item.id === "groups") {
              return {
                ...item,
                list: (item.list || []).filter((it) => {
                  return (it.name || it.teamId || "").includes(this.searchText);
                }),
              };
            }
            return { ...item };
          })
          .filter((it) => !!(it.list || []).length);
        return handleFinalSections(finalSections);
      } else {
        // 无关键字：直接扁平化初始分组数据
        return handleFinalSections(this.searchList || []);
      }
    },
  },
  methods: {
    t,
    // 关闭弹窗：派发关闭事件并同步 v-model:visible
    handleClose() {
      this.$emit("close");
      this.$emit("update:visible", false);
    },
    // 输入框失焦：用于控制输入框样式状态
    onInputBlur() {
      this.inputFocus = false;
    },
    // 输入框聚焦：用于控制输入框样式状态
    onInputFocus() {
      this.inputFocus = true;
    },
    // 输入事件：兼容字符串或原生事件，统一写入 searchText
    onInput(event) {
      this.searchText =
        event && event.target ? event.target.value : String(event || "");
    },
    // 点击搜索结果：解析会话类型与目标ID，插入到最近会话，并跳转聊天
    async handleItemClick(item) {
      try {
        let conversationType;
        let receiverId;
        if (item && item.accountId) {
          conversationType =
            V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P;
          receiverId = item.accountId;
        } else if (item && item.teamId) {
          conversationType =
            V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM;
          receiverId = item.teamId;
        } else {
          throw Error("unknow scene");
        }
        // 根据云端/本地模式分别插入会话
        if (this.enableV2CloudConversation) {
          await this.store.conversationStore?.insertConversationActive(
            conversationType,
            receiverId
          );
        } else {
          await this.store?.localConversationStore?.insertConversationActive(
            conversationType,
            receiverId
          );
        }
        // 通知外层跳转聊天
        this.$emit("goChat");
      } catch (e) {
        showToast({ message: t("selectSessionFailText"), type: "info" });
      }
      // 无论成功失败都关闭弹窗
      this.handleClose();
    },
  },
  mounted() {
    // 初始聚焦输入框
    this.inputFocus = true;
    // 响应式收集数据：好友/群组/讨论组列表，过滤黑名单并按类型拆分
    this.uninstallSearchWatch = autorun(() => {
      // 好友：过滤黑名单并补充用户信息
      const friends = (this.store?.uiStore.friends || [])
        .filter(
          (item) =>
            !(this.store?.relationStore.blacklist || []).includes(
              item.accountId
            )
        )
        .map((item) => {
          const user = (this.store?.userStore.users &&
            this.store?.userStore.users.get(item.accountId)) || {
            accountId: "",
            name: "",
            createTime: Date.now(),
          };
          return { ...item, ...user };
        });
      // 群组：排除讨论组
      const teamList = (this.store?.uiStore.teamList || []).filter((team) => {
        if (team && team.serverExtension) {
          try {
            return !isDiscussionFunc(team.serverExtension);
          } catch (e) {
            return true;
          }
        } else {
          return true;
        }
      });
      // 讨论组：从群组中筛选出讨论组
      const discussionList = (this.store?.uiStore.teamList || []).filter(
        (team) => {
          if (team && team.serverExtension) {
            try {
              return isDiscussionFunc(team.serverExtension);
            } catch (e) {
              return true;
            }
          }
          return false;
        }
      );
      // 组合三类分组，供 computed 扁平化与过滤
      this.searchList = [
        { id: "friends", list: friends },
        { id: "discussions", list: discussionList },
        { id: "groups", list: teamList },
      ].filter((it) => !!(it.list || []).length);
    });
  },
  beforeDestroy() {
    // 清理 autorun 监听，避免内存泄漏
    if (typeof this.uninstallSearchWatch === "function") {
      try {
        this.uninstallSearchWatch();
      } catch (e) {
        console.error("uninstallSearchWatch error", e);
      }
    }
  },
};
</script>

<style scoped>
.search-container-wrapper {
  height: 100%;
  background-color: #fff;
  overflow: auto;
  box-sizing: border-box;
}
/* 搜索区域样式 */
.search-wrapper {
  padding: 8px 10px;
}

/* 输入框容器 */
.search-input-wrapper {
  height: 40px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  background: #f3f5f7;
  border-radius: 5px;
  padding: 8px 10px;
  margin: 20px 16px 10px 10px;
}

/* 搜索图标容器 */
.search-icon-wrapper {
  margin-right: 5px;
  display: flex;
  align-items: center;
}

/* 表单输入项基础样式 */
.form-input-item {
  border-bottom: 1px solid #dcdfe5;
  padding: 10px 10px 5px 0;
  display: flex;
  height: 44px;
  align-items: center;
}

/* 表单输入项聚焦状态 */
.form-input-item.focus {
  border-color: #337eff;
}

/* 表单输入项错误状态 */
.form-input-item.error {
  border-color: #f56c6c;
}

/* 搜索结果标题 */
.result-title {
  height: 30px;
  color: #c0c0c1;
  font-size: 14px;
  border-bottom: 1px solid #c0c0c1;
  display: flex;
  align-items: center;
  padding-left: 10px;
  box-sizing: border-box;
}

/* 输入框 */
.input {
  flex: 1;
  height: 30px;
  border: none;
  outline: none;
}

/* 清除图标 */
.clear-icon {
  width: 40px;
  text-align: right;
}

/* 搜索结果容器 */
.search-result-wrapper {
  padding: 0 10px;
  height: 350px;
  overflow: hidden;
}

.search-scroller {
  height: 100% !important;
  width: 100%;
}

/* 搜索结果标题 */
.result-title {
  height: 50px;
  color: #c0c0c1;
  font-size: 14px;
  border-bottom: 1px solid #c0c0c1;
  display: flex;
  align-items: center;
  padding-left: 10px;
  box-sizing: border-box;
}

.search-item-wrapper {
  height: 50px;
  display: flex;
  align-items: center;
  width: 100%;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 22px;
  width: 30px;
  height: 30px;
  color: #999;
  transition: all 0.2s;
}
</style>
