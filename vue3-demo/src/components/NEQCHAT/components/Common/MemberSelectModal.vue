<template>
  <Modal
    class="light"
    :visible="visible"
    :title="$t('添加成员')"
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
            dataSource.length === 0 ? $t("无可以选择的用户") : $t("选择的用户")
          }}
        </p>
        <div
          class="data-scroll"
          v-infinite-scroll="handelLoadMore"
          infinite-scroll-disabled="busy"
          infinite-scroll-distance="10"
        >
          <div class="member-item" v-for="item in dataSource" :key="item.accid">
            <Checkbox class="member-check" @change="handleSelectMember(item)" />
            <div class="member-icon">
              <CommonAvatar
                :avatar="item.avatar"
                :nick="item.nick"
                :accid="item.accid"
                :width="32"
                :border="0"
              ></CommonAvatar>
            </div>
            <div class="member-name">{{ item.nick || item.accid }}</div>
          </div>
        </div>
      </div>
      <div class="members-right">
        <p class="tips">已选：{{ selectedMembers.length }} 个用户</p>
        <div
          class="member-item"
          v-for="item in selectedMembers"
          :key="item.accid"
        >
          <div class="member-icon">
            <CommonAvatar
              :avatar="item.avatar"
              :nick="item.nick"
              :accid="item.accid"
              :width="32"
              :border="0"
            ></CommonAvatar>
          </div>
          <div class="member-name">{{ item.nick || item.accid }}</div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import { Modal, Checkbox } from "ant-design-vue";
import { computed, ref, toRaw, watch } from "vue";
import CommonAvatar from "../CommonAvatar.vue";
import { MemberInfo } from "../../types/v2-compat";

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
      default: [] as MemberInfo[],
    },
  },
  emits: ["cancel", "ok", "onLoadMore"],
  components: {
    Modal,
    Checkbox,
    CommonAvatar,
  },
  setup(props: any, context: any) {
    const selectedMembers = ref<MemberInfo[]>([]);

    const busy = computed(() => !props.hasMore);

    const onCancel = () => {
      context.emit("cancel");
    };

    const onOk = () => {
      context.emit("ok", toRaw(selectedMembers.value));
    };

    const handleSelectMember = (member: MemberInfo) => {
      const index = selectedMembers.value.findIndex(
        (item) => item.accid === member.accid,
      );
      if (index === -1) {
        selectedMembers.value.push(member);
      } else {
        selectedMembers.value.splice(index, 1);
      }
    };

    const handelLoadMore = () => {
      context.emit("onLoadMore");
    };

    watch(
      () => props.visible,
      (visible) => {
        if (visible) {
          selectedMembers.value = [];
        }
      },
    );

    return {
      busy,
      onOk,
      onCancel,
      selectedMembers,
      handleSelectMember,
      handelLoadMore,
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
  height: 356px;
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
