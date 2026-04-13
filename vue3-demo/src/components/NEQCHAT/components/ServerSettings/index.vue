<template>
  <Modal
    :visible="visible"
    class="dark"
    :footer="null"
    width="1000px"
    :mask="false"
    centered
    @cancel="handleModalCancel"
  >
    <template #closeIcon>
      <CloseCircleOutlined />
    </template>
    <div class="common-settings-container" v-if="curServer">
      <div class="setting-menu-wrap">
        <div class="title" :title="curServer.name">{{ curServer.name }}</div>
        <div class="qchat-setting-menu">
          <div class="menu-item menu-title">{{ $t("基本设置") }}</div>
          <div
            class="menu-item"
            :class="{ active: selectKey === 'info' }"
            @click="toServerSetting('info')"
          >
            {{ $t("服务器概括") }}
          </div>
          <div
            class="menu-item"
            :class="{ active: selectKey === 'role' }"
            @click="toServerSetting('role')"
          >
            {{ $t("身份组") }}
          </div>
          <div class="line"></div>
          <div class="menu-item menu-title">{{ $t("用户管理") }}</div>
          <div
            class="menu-item"
            :class="{ active: selectKey === 'member' }"
            @click="toServerSetting('member')"
          >
            {{ $t("成员") }}
          </div>
          <div
            v-if="ifCanDeleteServer"
            class="menu-item danger"
            @click="deleteServer"
          >
            删除服务器
          </div>
          <div
            v-if="!ifCanDeleteServer"
            class="menu-item danger"
            @click="leaveFromServer"
          >
            退出服务器
          </div>
        </div>
      </div>
      <div class="setting-content-wrap">
        <ServerInfo
          v-if="selectKey === 'info'"
          :cancelVisible="cancelVisible"
          :canEdit="ifManageServer"
        />
        <RoleGroup
          v-else-if="selectKey === 'role'"
          :canEdit="ifManageRole"
          :ifKickServer="ifKickServer"
        />
        <MemberInfo
          v-else-if="selectKey === 'member'"
          :canEdit="ifKickServer"
        />
      </div>
    </div>
  </Modal>
  <Modal
    v-model:visible="inviteVisible"
    class="dark"
    :width="520"
    title="邀请好友加入服务器"
    :footer="null"
  >
    <div class="invite-box" v-if="curServer">
      <div class="invite-form">
        <label class="invite-label">{{ $t("用户 ID") }}</label>
        <Input
          v-model:value="inviteAccid"
          :placeholder="$t('请输入好友的账号 ID')"
          :maxlength="64"
          @pressEnter="handleInviteSubmit"
        ></Input>
      </div>
      <div class="invite-actions">
        <Button
          type="primary"
          :loading="inviteLoading"
          :disabled="!inviteAccid.trim()"
          @click="handleInviteSubmit"
        >
          {{ $t("邀请") }}
        </Button>
      </div>
    </div>
  </Modal>
  <DownOutlined
    :style="{ fontSize: '12px' }"
    @click.stop="selectVisible = !selectVisible"
    v-show="!selectVisible"
  />
  <UpOutlined
    :style="{ fontSize: '12px' }"
    @click.stop="selectVisible = !selectVisible"
    v-show="selectVisible"
  />
  <div class="server-setting-select" v-show="selectVisible" @click.stop="">
    <div class="item" @click="inviteUser">
      <IconFont type="icon-tianjiachengyuan" />{{ $t("邀请他人") }}
    </div>
    <div class="item" @click="toServerSetting('info')">
      <IconFont type="icon-shezhi" />{{ $t("服务器设置") }}
    </div>
    <div class="item" @click="personalInfoSetting">
      <UserOutlined />{{ $t("个人资料") }}
      <!-- <IconFont type="icon-user" />{{ $t("个人资料") }} -->
    </div>
  </div>
  <Modal
    :visible="visibleUser"
    @cancel="handleModalCancel"
    :footer="null"
    width="1000px"
    :mask="false"
    centered
  >
    <template #closeIcon>
      <CloseCircleOutlined />
    </template>
    <div class="settings-container">
      <div class="menu-wrap">
        <div class="title">
          <!-- <CommonAvatar
            :avatar="userProfile.avatar"
            :nick="userProfile.nick"
            :accid="userProfile.account"
            :width="36"
            :border="0"
          ></CommonAvatar> -->
          <span class="title-text">{{ userProfile.nick }}</span>
        </div>
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
        </div>
      </div>
      <ProfileSetting
        @modalClose="visibleUser = false"
        v-if="selectedKey === 'ProfileSetting'"
      />
    </div>
  </Modal>
</template>

<script lang="ts">
import {
  DownOutlined,
  UpOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  ConsoleSqlOutlined,
} from "@ant-design/icons-vue";
import { Modal, Button, Input, message } from "ant-design-vue";
import { Form } from "ant-design-vue/lib/components";
import {
  ref,
  computed,
  onUnmounted,
  createVNode,
  UnwrapRef,
  reactive,
  onMounted,
  watch,
} from "vue";
import { useStore } from "vuex";
import IconFont from "../IconFont";
import ServerInfo from "./modules/ServerInfo.vue";
import RoleGroup from "./modules/RoleGroup.vue";
import MemberInfo from "./modules/MemberInfo.vue";
import { useI18n } from "vue-i18n";
import ProfileSetting from "./modules/UserProfileSetting.vue";
import CommonAvatar from "../CommonAvatar.vue";
interface FormState {
  account: string;
  tel: string;
  nick: string;
  avatar: string;
}

const FormItem = Form.Item;

export default {
  name: "ServerSettings",
  components: {
    Button,
    Input,
    UpOutlined,
    ServerInfo,
    RoleGroup,
    MemberInfo,
    Modal,
    ProfileSetting,
    // CommonAvatar,
    DownOutlined,
    IconFont,
    CloseCircleOutlined,
    UserOutlined,
  },
  mounted() {
    this.processdelete();
  },
  setup() {
    const store = useStore();
    const { t: $t } = useI18n();
    const selectKey = ref("info");
    const inviteVisible = ref(false);
    const visibleUser = ref(false);
    const selectVisible = ref(false);
    const visible = ref(false);
    const ifCanDeleteServer = computed(
      () =>
        store.state.server.curServer.owner ===
        store.state.user.userProfile.account,
    );
    const ifManageServer = ref(false);
    const ifManageRole = ref(false);
    const ifKickServer = ref(false);
    const menuList = ref([{ key: "ProfileSetting", name: $t("个人资料") }]);
    const selectedKey = ref("ProfileSetting");
    const currentServer = computed(() => store.state.server.curServer);
    const inviteAccid = ref("");
    const inviteLoading = ref(false);

    const handleInviteSubmit = async () => {
      const trimmed = inviteAccid.value.trim();
      if (!trimmed) {
        return;
      }
      inviteLoading.value = true;
      try {
        const res = await store.dispatch("server/inviteServerMembers", {
          serverId: currentServer.value.serverId,
          accids: [trimmed],
          ps: "",
        });
        if (res.failByOverAccids && res.failByOverAccids.length > 0) {
          message.warning($t("邀请失败：用户服务器数量超限"));
        } else if (res.failByBanAccids && res.failByBanAccids.length > 0) {
          message.warning($t("邀请失败：用户已被服务器封禁"));
        } else {
          message.success($t("邀请已发送"));
          inviteAccid.value = "";
          inviteVisible.value = false;
        }
      } catch (err: any) {
        console.error(err);
        message.error($t("邀请失败，请检查用户 ID 是否正确"));
      } finally {
        inviteLoading.value = false;
      }
    };

    // 表单元素
    const rules = {
      nick: [
        {
          required: true,
          message: $t("请输入昵称"),
          trigger: "blur",
        },
      ],
      phone: [
        {
          required: true,
          message: $t("请输入手机号"),
          trigger: "blur",
        },
      ],
    };
    (document.querySelector("body") as HTMLBodyElement).onclick = () => {
      selectVisible.value = false;
    };
    onUnmounted(() => {
      (document.querySelector("body") as HTMLBodyElement).onclick = null;
    });

    let userProfile = store.state.user.userProfile;
    const formState: UnwrapRef<FormState> = reactive({
      nick: userProfile.nick,
      account: userProfile.account,
      tel: userProfile.tel,
      avatar: userProfile.avatar,
    });

    const toServerSetting = (type) => {
      selectKey.value = type;
      if (currentServer.value.owner === store.state.user.userProfile.account) {
        ifManageServer.value = true;
        ifManageRole.value = true;
        ifKickServer.value = true;
        visible.value = true;
        selectVisible.value = false;
      } else {
        store
          .dispatch("server/checkPermissionMessage", {
            serverId: store.state.server.curServer.serverId,
            auth: "manageServer",
          })
          .then((resp) => {
            ifManageServer.value = resp;
          });
        store
          .dispatch("server/checkPermissionMessage", {
            serverId: store.state.server.curServer.serverId,
            auth: "kickServer",
          })
          .then((resp) => {
            ifKickServer.value = resp;
          });
        store
          .dispatch("server/checkPermissionMessage", {
            serverId: store.state.server.curServer.serverId,
            auth: "manageRole",
          })
          .then((resp) => {
            ifManageRole.value = resp;
          });
        visible.value = true;
        selectVisible.value = false;
      }
    };

    return {
      selectVisible,
      inviteVisible,
      inviteAccid,
      inviteLoading,
      handleInviteSubmit,
      visibleUser,
      visible,
      selectKey,
      formState,
      rules,
      menuList,
      userProfile,
      ifCanDeleteServer,
      ifManageServer,
      ifManageRole,
      ifKickServer,
      selectedKey,
      toServerSetting,
      account: window.qchat?.account,
      curServer: computed(() => store.state.server.curServer),
      handleModalCancel: () => {
        visible.value = false;
        visibleUser.value = false;
      },
      leaveFromServer: () => {
        Modal.confirm({
          title: () => $t("退出服务器"),
          icon: () => createVNode(ExclamationCircleOutlined),
          content: () => `即将退出服务器 "${currentServer.value.name}"`,
          okText: () => $t("确认"),
          cancelText: () => $t("取消"),
          async onOk() {
            try {
              await store
                .dispatch("server/leaveServer", {
                  serverId: currentServer.value.serverId,
                })
                .then((res) => {
                  message.success("退出成功");
                  // 退出成功后关闭弹窗
                  visible.value = false;
                  visibleUser.value = false;
                });
            } catch (err: any) {
              console.error(err);
              message.error($t("操作失败"));
              return;
            }
          },
        });
      },
      async deleteServer() {
        Modal.confirm({
          title: () => $t("服务器删除"),
          icon: () => createVNode(ExclamationCircleOutlined),
          content: () => `即将删除服务器 "${currentServer.value.name}"`,
          okText: () => $t("确认"),
          cancelText: () => $t("取消"),
          async onOk() {
            try {
              /* await store
                .dispatch("server/deleteServerTip", {
                  serverId: store.state.server.curServer.serverId,
                  body:  "notify all member from server"
                })*/

              await store
                .dispatch("server/deleteServers", {
                  serverId: store.state.server.curServer.serverId,
                })
                .then((res) => {
                  message.success("删除成功");
                  window.location.reload();
                });
            } catch (err: any) {
              console.error(err);
              message.error($t("操作失败"));
              return;
            }
          },
        });
      },
      cancelVisible: () => {
        visible.value = false;
      },
      inviteUser: () => {
        if (
          currentServer.value.owner === store.state.user.userProfile.account
        ) {
          inviteVisible.value = true;
          selectVisible.value = false;
        } else {
          store
            .dispatch("server/checkPermissionMessage", {
              serverId: store.state.server.curServer.serverId,
              auth: "inviteServer",
            })
            .then((resp) => {
              if (resp) {
                inviteVisible.value = true;
                selectVisible.value = false;
              }
            });
        }
      },

      personalInfoSetting: () => {
        visibleUser.value = true;
        selectVisible.value = false;
        store
          .dispatch("server/getSeverMember", {
            accids: store.state.user.userProfile.account,
          })
          .then((resp) => {
            formState.nick = resp[0].nick;
            formState.avatar = resp[0].avatar;
            formState.tel = resp[0].tel;
          });
      },

      processdelete: () => {
        if (!window.qchat) {
          console.warn("QChat实例还未初始化");
          return;
        }

        // 在 V2 SDK中，系统通知需要通过消息服务来监听
        // 这里暂时注释掉，需要根据V2 SDK的具体API来修改
        /*
        window.qchat.qchatMsg.on(
          "systemNotification",
          async function (systemNotification) {
            if (
              systemNotification.systemNotifications[0].type === "serverRemove"
            ) {
              message.success("你当前浏览服务器已被删除");
              window.location.reload();
            }
          }
        );
        */
      },
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.server-setting-select {
  position: absolute;
  width: 124px;
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 14px;
  top: 50px;
  right: 15px;
  padding: 8px 0;
  z-index: 100;
  .item {
    cursor: pointer;
    line-height: 32px;
    padding-left: 15px;
    color: #262626;
    transition: background-color 0.3s ease;
    .anticon {
      margin-right: 5px;
      color: #8c8c8c;
    }
    &:hover {
      background: #f5f5f5;
    }
  }
}
.common-settings-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 650px; /* 固定高度适配弹窗 */
  background-color: #ffffff;

  .setting-menu-wrap {
    width: 170px;
    height: 100%;
    padding: 0 10px; /* 减少左边距 */
    background-color: #f8f9fa;
    .title {
      height: 60px; /* 减少标题区域高度 */
      width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding: 20px 0 0 16px; /* 减少上边距 */
      text-align: left;
      font-size: 16px; /* 减少字体大小 */
      color: #6e6f74;
    }
  }

  .setting-content-wrap {
    flex: 1;
    height: 100%;
    color: #fff;
  }
}
.invite-box {
  .invite-form {
    margin-bottom: 16px;
    .invite-label {
      display: block;
      margin-bottom: 8px;
      color: #a3a4a9;
      font-size: 14px;
    }
  }
  .invite-actions {
    display: flex;
    justify-content: flex-end;
  }
}
.settings-container {
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
    padding: 30px 0 28px 0;
    text-align: left;
    font-size: 18px;
    color: #8c8c8c;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    .title-text {
      padding-left: 12px;
      color: #262626;
    }
  }
}

.disabled {
  color: #6e6f74;
}

.qchat-setting-menu {
  padding: 0 16px;

  .menu-item {
    padding: 8px 12px;
    margin: 2px 0;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    color: #262626;
    transition: background-color 0.2s ease;

    &:hover:not(.menu-title):not(.danger):not(.active) {
      background-color: #f0f7ff;
    }

    &.active {
      background-color: #1890ff;
      color: #ffffff;

      &:hover {
        background-color: #1890ff;
        color: #ffffff;
      }
    }

    &.menu-title {
      font-size: 12px;
      color: #8c8c8c;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 16px 12px 8px 12px;
      cursor: default;
    }

    &.danger {
      color: #ff4d4f;

      &:hover {
        background-color: #fff2f2;
      }
    }
  }

  .line {
    height: 1px;
    background-color: #e8e8e8;
    margin: 8px 12px;
  }
}
</style>
