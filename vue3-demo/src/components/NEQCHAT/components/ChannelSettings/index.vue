<template>
  <div class="channel-settings-container">
    <div class="menu-wrap">
      <div class="title">频道名称</div>
      <div class="qchat-setting-menu">
        <div
          class="menu-item"
          v-for="item in menuList"
          :key="item.key"
          :class="{
            active: selectedKey === item.key,
          }"
          @click="selectedKey = item.key"
        >
          {{ item.name }}
        </div>
        <div
          class="menu-item danger"
          v-if="ifCanEditGeneralSituation"
          @click="deleteChannel"
        >
          删除频道
        </div>
      </div>
    </div>
    <GeneralSituation
      v-if="selectedKey === 'GeneralSituation'"
      @click="checkManageChannelAuth"
      :canEdit="ifCanEditGeneralSituation"
    />
    <ChannelRole
      v-if="selectedKey === 'ChannelRole'"
      @click="checkChannelRoleAuth"
      :canEdit="ifCanEditChannelRole"
      :canChangeViewMode="ifCanEditGeneralSituation"
    />
    <ChannelMember
      v-if="selectedKey === 'ChannelMember'"
      @click="checkChannelManageBlackWhiteListAuth"
      :canEdit="ifCanEditBlackWhiteList"
    />
  </div>
</template>

<script lang="ts">
import GeneralSituation from "./modules/GeneralSituation.vue";
import ChannelRole from "./modules/ChannelRole.vue";
import ChannelMember from "./modules/ChannelMember.vue";
import { computed, createVNode, onMounted, ref, watch } from "vue";
import { useStore } from "vuex";
import { message, Modal } from "ant-design-vue";
import { useI18n } from "vue-i18n";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";

export default {
  name: "ChannelSettings",
  components: { GeneralSituation, ChannelRole, ChannelMember },
  emits: {
    deleteChannelEvent: (value) => {
      return value;
    },
  },
  setup(props, context) {
    const { t: $t } = useI18n();
    const store = useStore();
    const currentChannel = computed(() => store.state.channel.currentChannel);
    const menuList = ref([
      { key: "GeneralSituation", name: $t("频道概况") },
      { key: "ChannelRole", name: $t("频道权限") },
      { key: "ChannelMember", name: $t("频道名单") },
    ]);
    const selectedKey = ref("GeneralSituation");
    const ifCanEditGeneralSituation = ref(false);
    const ifCanEditChannelRole = ref(false);
    const ifCanEditBlackWhiteList = ref(false);

    watch(
      currentChannel,
      (newVal, oldVal) => {
        selectedKey.value = "GeneralSituation";
        checkManageChannelAuth();
      },
      { deep: true },
    );

    onMounted(() => {
      checkChannelRoleAuth();
      checkChannelManageBlackWhiteListAuth();
    });

    const checkManageChannelAuth = () => {
      if (
        store.state.server.curServer.owner ===
        store.state.user.userProfile.account
      ) {
        ifCanEditGeneralSituation.value = true;
      } else {
        store
          .dispatch("server/checkPermissionMessage", {
            serverId: store.state.server.curServer.serverId,
            channelId: store.state.channel.currentChannel.channelId,
            auth: "manageChannel",
          })
          .then((resp) => {
            ifCanEditGeneralSituation.value = resp;
          });
      }
    };

    const checkChannelRoleAuth = () => {
      checkManageChannelAuth();
      if (
        store.state.server.curServer.owner ===
        store.state.user.userProfile.account
      ) {
        ifCanEditChannelRole.value = true;
      } else {
        store
          .dispatch("server/checkPermissionMessage", {
            serverId: store.state.server.curServer.serverId,
            channelId: store.state.channel.currentChannel.channelId,
            auth: "manageRole",
          })
          .then((resp) => {
            ifCanEditChannelRole.value = resp;
          });
      }
    };

    const checkChannelManageBlackWhiteListAuth = () => {
      if (
        store.state.server.curServer.owner ===
        store.state.user.userProfile.account
      ) {
        ifCanEditBlackWhiteList.value = true;
      } else {
        store
          .dispatch("server/checkPermissionMessage", {
            serverId: store.state.server.curServer.serverId,
            channelId: store.state.channel.currentChannel.channelId,
            auth: "manageBlackWhiteList",
          })
          .then((resp) => {
            ifCanEditBlackWhiteList.value = resp;
          });
      }
    };

    return {
      selectedKey,
      menuList,
      checkManageChannelAuth,
      ifCanEditGeneralSituation,
      ifCanEditChannelRole,
      checkChannelRoleAuth,
      ifCanEditBlackWhiteList,
      checkChannelManageBlackWhiteListAuth,
      async deleteChannel() {
        Modal.confirm({
          title: () => $t("频道删除"),
          icon: () => createVNode(ExclamationCircleOutlined),
          content: () => `即将删除频道 "${currentChannel.value.name}"`,
          okText: () => $t("确认"),
          cancelText: () => $t("取消"),
          async onOk() {
            await store
              .dispatch("channel/deleteChannel")
              .then((resp) => {
                context.emit("deleteChannelEvent", "success");
              })
              .catch((err: any) => {
                console.error(err);
                message.error($t("操作失败"));
                return;
              });
          },
        });
      },
    };
  },
};
</script>

<style scoped lang="less">
.channel-settings-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 650px; /* 固定高度适配弹窗 */
  background-color: #ffffff;

  .menu-wrap {
    height: 100%;
    padding: 0 10px;
    background-color: #f8f9fa;

    // .ant-menu.ant-menu-dark {
    //   background-color: #282a2f;
    // }

    // .ant-menu-item-group-title {
    //   color: #6e6f74;
    // }
  }
  .title {
    height: 80px;
    padding: 45px 0 0 16px;
    text-align: left;
    font-size: 18px;
    color: #262626;
  }
}
</style>
