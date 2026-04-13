<template>
  <Modal
    class="light"
    :visible="visible"
    :title="$t('添加身份')"
    :ok-text="$t('确定')"
    :cancel-text="$t('取消')"
    :width="520"
    @cancel="onCancel"
    @ok="onOk"
  >
    <div class="members-container">
      <div class="members-left">
        <p class="tips">
          {{
            dataSource.length === 0 ? $t("无可以选择的身份") : $t("选择的身份")
          }}
        </p>
        <div
          class="data-scroll"
          v-infinite-scroll="handelLoadMore"
          infinite-scroll-disabled="busy"
          infinite-scroll-distance="10"
        >
          <div class="member-item" v-for="item in dataSource" :key="item.accid">
            <Checkbox class="member-check" @change="handleSelectRole(item)" />
            <div class="member-icon">
              <CommonAvatar
                :avatar="item.avatar"
                :nick="item.name"
                :roleId="item.roleId"
                :width="32"
                :border="0"
              ></CommonAvatar>
            </div>
            <div class="member-name">{{ item.name }}</div>
          </div>
        </div>
      </div>
      <div class="members-right">
        <p class="tips">已选：{{ selectroleList.length }} 个身份</p>
        <div
          class="member-item"
          v-for="item in selectroleList"
          :key="item.roleId"
        >
          <div class="member-icon">
            <CommonAvatar
              :avatar="item.avatar"
              :nick="item.name"
              :roleId="item.roleId"
              :width="32"
              :border="0"
            ></CommonAvatar>
          </div>
          <div class="member-name">{{ item.name }}</div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import { Modal, Checkbox } from "ant-design-vue";
import { computed, ref, toRaw } from "vue";
import CommonAvatar from "../CommonAvatar.vue";
import { useStore } from "vuex";
import { QChatServerRole } from "../../types/v2-compat";

export default {
  name: "MemberSelectModal",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    hasMore: {
      type: Boolean,
      default: false,
    },
    dataSource: {
      type: Array,
      default: [] as QChatServerRole[],
    },
  },
  emits: ["cancel", "ok", "onLoadMore"],
  components: {
    Modal,
    Checkbox,
    CommonAvatar,
  },
  setup(props: any, context: any) {
    const store = useStore();

    const roleList = ref<QChatServerRole[]>([]);

    const selectroleList = ref<QChatServerRole[]>([]);

    const busy = computed(() => !props.hasMore);

    const onCancel = () => {
      context.emit("cancel");
    };

    const onOk = () => {
      context.emit("ok", toRaw(selectroleList.value));
    };

    const handleSelectRole = (role: QChatServerRole) => {
      const index = selectroleList.value.findIndex(
        (item) => item.roleId === role.roleId,
        (item: { serverId: string }) =>
          item.serverId ===
          computed(() => store.state.server.curServer).value.serverId,
      );
      if (index === -1) {
        selectroleList.value.push(role);
      } else {
        selectroleList.value.splice(index, 1);
      }
    };

    const handelLoadMore = () => {
      context.emit("onLoadMore");
    };

    return {
      busy,
      onOk,
      roleList,
      onCancel,
      handelLoadMore,
      selectroleList,
      handleSelectRole,
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.hui :deep(.ant-checkbox-disabled .ant-checkbox-input) {
  background: #f5f5f5;
  opacity: 1;
}
.members-container {
  display: flex;
  height: 300px;
  .members-left,
  .members-right {
    flex: 1;
    .tips {
      color: #8c8c8c;
      margin: 0;
      height: 25px;
    }
  }
  .members-left {
    border-right: 1px solid #f0f0f0;
  }
  .members-right {
    padding-left: 15px;
  }
  .member-item {
    height: 50px;
    display: flex;
    align-items: center;
    .member-check {
      margin-right: 10px;
    }
    .member-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #f5f5f5;
      margin-right: 10px;
    }
    .member-name {
      font-size: 12px;
      color: #262626;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 120px;
    }
  }
  .data-scroll {
    height: 330px;
    overflow-y: auto;
  }
}
</style>
