<template>
  <div class="channel-bar-container">
    <div class="container__header">
      <div class="server-name">{{ curServer.name }}</div>
      <SeverSetting />
    </div>
    <div class="channel-box">
      <div class="channel-box__header">
        <div class="header-text">{{ $t("频道名") }}</div>
        <div class="header-bar" @click="openCreateModal">
          <PlusOutlined :style="{ color: '#A3A4A9', fontSize: '16px' }" />
        </div>
      </div>
      <div class="channel-box__list">
        <div
          class="list-item"
          v-for="channel in channelList"
          :key="channel.channelId"
          :class="{
            active:
              currentChannel && currentChannel.channelId === channel.channelId,
          }"
          @click="setCurChannel(channel)"
        >
          <div class="item-name">
            <NumberOutlined class="item-name-icon" />
            <!-- <Typography :ellipsis="true"></Typography> -->
            <span>{{ channel.name }}</span>
          </div>
          <div class="item-bar">
            <Badge
              :count="getUnreadCount(channel)"
              :number-style="{
                marginRight: '15px',
                height: '18px',
                backgroundColor: '#ff4d4f',
                color: '#fff',
                boxShadow: '0 0 0 1px #ff4d4f inset',
              }"
            >
            </Badge>
            <UserAddOutlined
              class="item-bar__icon"
              @click="gotoServerInvite(channel.serverId)"
            />
            <SettingOutlined
              class="item-bar__icon"
              @click.stop="gotoChannelSettings(channel)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <Modal
    v-model:visible="createVisible"
    :title="$t('创建新频道')"
    class="light"
    :footer="null"
    :width="520"
  >
    <template #closeIcon>
      <CloseCircleOutlined />
    </template>
    <!-- <template #footer>
      <a-button
        key="submit"
        type="primary"
        @click="handleOk"
        >{{ $t("频道名") }}</a-button
      >
    </template> -->
    <Form
      ref="formRef"
      class="create-form form--light"
      :hideRequiredMark="true"
      :model="formState"
      layout="vertical"
      :rules="rules"
    >
      <FormItem :label="$t('频道名称')" name="name">
        <Input
          v-model:value="formState.name"
          :maxlength="50"
          :placeholder="$t('请输入频道名称')"
        ></Input>
      </FormItem>
      <FormItem :label="$t('频道主题')" name="topic">
        <Textarea
          :rows="3"
          v-model:value="formState.topic"
          :maxlength="64"
          :placeholder="$t('请输入频道主题')"
        ></Textarea>
      </FormItem>
      <FormItem :label="$t('私密频道')" name="viewMode">
        <div class="tip">
          {{ $t("将频道设为私密，则只有白名单成员能够查看此频道") }}
        </div>
        <Switch
          v-model:checked="formState.viewMode"
          :checkedValue="1"
          :unCheckedValue="0"
        ></Switch>
      </FormItem>
      <div class="bottom-button">
        <Button type="primary" :loading="buttonVisible" @click="onSubmit"
          >创建</Button
        >
      </div>
    </Form>
  </Modal>

  <Modal
    :visible="settingsVisible"
    :footer="null"
    width="1000px"
    :mask="false"
    centered
    @cancel="handleModalCancel"
  >
    <template #closeIcon>
      <CloseCircleOutlined />
    </template>
    <ChannelSettings
      @modalClose="settingsVisible = false"
      @deleteChannelEvent="receiveDeleteChannelEvent"
    ></ChannelSettings>
  </Modal>

  <ServerInvite
    :visible="serverInviteVisible"
    :id="serverInviteId"
    :modalClose="handleServerInviteClose"
  ></ServerInvite>
</template>

<script lang="ts">
import {
  computed,
  onBeforeMount,
  reactive,
  ref,
  toRaw,
  UnwrapRef,
  watch,
} from "vue";
import { useStore } from "vuex";
import { ChannelInfo } from "../types/v2-compat";
import {
  PlusOutlined,
  NumberOutlined,
  SettingOutlined,
  CloseCircleOutlined,
  UserAddOutlined,
} from "@ant-design/icons-vue";
import {
  Form,
  Modal,
  Input,
  Button,
  Switch,
  Badge,
  message,
} from "ant-design-vue";
import { useI18n } from "vue-i18n";
import ChannelSettings from "./ChannelSettings/index.vue";
import SeverSetting from "./ServerSettings/index.vue";
import ServerInvite from "./ServerInvite.vue";

const FormItem = Form.Item;
const Textarea = Input.TextArea;

interface FormState {
  serverId: string;
  name: string;
  topic: string;
  viewMode: number;
}

export default {
  name: "ChannelBar",
  components: {
    Form,
    Modal,
    Input,
    Button,
    FormItem,
    Textarea,
    Switch,
    Badge,
    PlusOutlined,
    NumberOutlined,
    SettingOutlined,
    CloseCircleOutlined,
    UserAddOutlined,
    ChannelSettings,
    SeverSetting,
    ServerInvite,
  },
  setup() {
    const { t: $t } = useI18n();
    const store = useStore();
    const createVisible = ref<boolean>(false);
    const settingsVisible = ref<boolean>(false);
    const buttonVisible = ref<boolean>(false);
    const serverInviteVisible = ref<boolean>(false);
    const serverInviteId = ref<string>("");
    const channelList = computed(() => store.state.channel.channelList);
    const currentChannel = computed(() => store.state.channel.currentChannel);
    const curServer = computed(() => store.state.server.curServer || {});

    // 获取频道未读数量，当前选中的频道不显示未读数
    const getUnreadCount = (channel: ChannelInfo) => {
      if (
        currentChannel.value &&
        currentChannel.value.channelId === channel.channelId
      ) {
        // 当前选中的频道不显示未读数
        return 0;
      }
      return channel.unreadCount || 0;
    };
    const setCurChannel = (channel: ChannelInfo) => {
      if (
        !store.state.server.curServer ||
        !store.state.server.curServer.serverId
      ) {
        console.warn("当前没有选中的服务器，无法设置频道");
        return;
      }

      store.commit("channel/setCurChannel", channel);
      store.commit("channel/resetChannelUnReadCount");
      store
        .dispatch("channel/getMembersByPage", {
          serverId: store.state.server.curServer.serverId,
          channelId: channel.channelId,
          timestamp: 0,
          limit: 100,
        })
        .then((res) => {
          store.commit("channel/setChannelMembers", res);
          store.commit("server/setSeverMembers", res);
        });
    };
    const receiveDeleteChannelEvent = (data) => {
      settingsVisible.value = false;
      if (
        !store.state.server.curServer ||
        !store.state.server.curServer.serverId
      ) {
        console.warn("当前没有选中的服务器");
        return;
      }
      // 重新请求频道列表
      store
        .dispatch("channel/getChannelsByPage", {
          serverId: store.state.server.curServer.serverId,
          timestamp: 0,
        })
        .then((resp) => {
          // 默认进入频道1
          if (
            store.state.channel.channelList &&
            store.state.channel.channelList.length > 0
          ) {
            setCurChannel(store.state.channel.channelList[0]);
          }
        });
    };

    onBeforeMount(() => {
      if (
        store.state.server.curServer &&
        store.state.server.curServer.serverId
      ) {
        store.dispatch("server/getSeverMembers", {
          serverId: store.state.server.curServer.serverId,
          timestamp: 0,
        });
      }
    });

    // 表单元素
    const formState: UnwrapRef<FormState> = reactive({
      serverId: "",
      name: "",
      topic: "",
      viewMode: 0,
    });

    const formRef = ref();

    // 表单校验规则
    const rules = {
      name: [
        {
          required: true,
          message: $t("请输入频道名称"),
          trigger: "blur",
        },
      ],
      // topic: [
      //   {
      //     required: true,
      //     message: $t("请输入频道主题"),
      //     trigger: "blur",
      //   },
      // ],
    };

    // 监听当前服务器变化
    watch(
      () => store.state.server.curServer,
      async (curServer: ChannelInfo) => {
        if (!curServer || !curServer.serverId) {
          console.warn("当前没有选中的服务器");
          return;
        }

        // UIKit已经保证SDK已初始化，直接获取频道列表
        console.log("QChat ChannelBar: 获取频道列表...");

        formState.serverId = curServer.serverId;
        try {
          await store.dispatch("channel/getChannelsByPage", {
            serverId: curServer.serverId,
            timestamp: 0,
          });
          // 使用 nextTick 确保频道列表更新后再设置当前频道
          await new Promise((resolve) => setTimeout(resolve, 100));
          // 默认选中该 server 下的第一个 channel
          if (
            channelList.value &&
            channelList.value.length > 0 &&
            !store.state.channel.currentChannel
          ) {
            console.log("设置默认频道:", channelList.value[0]);
            setCurChannel(channelList.value[0]);
          }
        } catch (error) {
          console.error("获取频道列表失败:", error);
        }
      },
      {
        immediate: true,
      },
    );

    // UIKit已经处理了SDK初始化，不需要再监听SDK状态
    console.log("QChat ChannelBar: UIKit已保证SDK初始化完成");

    return {
      channelList,
      currentChannel,
      curServer,
      getUnreadCount,
      receiveDeleteChannelEvent,
      setCurChannel,
      // 表单相关
      onSubmit: () => {
        buttonVisible.value = true;
        formRef.value
          .validate()
          .then(async () => {
            try {
              const formdata = toRaw(formState);
              await store.dispatch("channel/createChannel", formdata);
              await store.dispatch("channel/getChannelsByPage", {
                serverId: formdata.serverId,
                timestamp: 0,
              });

              await setCurChannel(channelList.value[0]);
              formState.name = "";
              formState.topic = "";
              formState.viewMode = 0;
              createVisible.value = false;
              buttonVisible.value = false;
              message.success($t("频道创建成功"));
            } catch (error: any) {
              console.error("创建频道失败:", error);

              // 根据错误类型给出不同的提示
              let errorMsg = $t("频道创建失败");
              if (error.code === 403) {
                errorMsg = $t("没有创建频道的权限，请联系管理员");
              } else if (error.message) {
                errorMsg = $t("频道创建失败") + ": " + error.message;
              }

              message.error(errorMsg);
              // 重置按钮状态
              buttonVisible.value = false;
            }
          })
          .catch(() => {
            // 表单验证失败时也重置按钮状态
            buttonVisible.value = false;
          });
      },
      formRef,
      createVisible,
      formState,
      rules,

      serverInviteVisible,
      serverInviteId,

      // 设置弹窗
      settingsVisible,
      buttonVisible,
      gotoChannelSettings(channel: ChannelInfo) {
        store.commit("channel/setCurChannel", channel);
        settingsVisible.value = true;
      },
      handleModalCancel() {
        settingsVisible.value = false;
      },
      gotoServerInvite(serverId: string) {
        serverInviteId.value = serverId;
        serverInviteVisible.value = true;
      },
      handleServerInviteClose() {
        serverInviteVisible.value = false;
      },

      // 打开创建频道模态框
      openCreateModal() {
        // 确保在打开模态框时设置正确的serverId
        if (
          store.state.server.curServer &&
          store.state.server.curServer.serverId
        ) {
          formState.serverId = store.state.server.curServer.serverId;
          createVisible.value = true;
          console.log("打开创建频道模态框，serverId:", formState.serverId);
        } else {
          console.warn("没有选择服务器，无法创建频道");
          // 可以显示提示消息
        }
      },
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.channel-bar-container {
  text-align: left;
  background-color: #fafafa;
  color: #262626;
  height: 100%;
}
.container__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 17px 20px 8px;
  line-height: 28px;
  font-size: 16px;
  border-bottom: 1px solid #e8e8e8;
  position: relative;
  background-color: #fafafa;
  color: #262626;
  .server-name {
    width: 170px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
.channel-box__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 14px 8px 14px;
  font-size: 14px;
  color: #8c8c8c;
  .header-bar {
    cursor: pointer;
    &:hover {
      color: #262626;
    }
  }
}
.channel-box__list {
  font-size: 14px;
  .list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 14px;
    height: 30px;
    color: #262626;
    &.active {
      background: #e6f7ff;
      border-radius: 4px;
      margin: 0 8px;
      width: calc(100% - 16px);
    }
    &:hover:not(.active) {
      background: #f5f5f5;
      border-radius: 4px;
      margin: 0 8px;
      width: calc(100% - 16px);
    }
  }
  .item-name {
    flex: 1;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-right: 10px;
  }
  .item-name-icon {
    color: #8c8c8c;
    font-size: 14px;
    margin-right: 4px;
  }
}
.item-bar__icon {
  color: #8c8c8c;
  font-size: 12px;
  margin-right: 16px;
  cursor: pointer;
  &:last-child {
    margin-right: 0px;
  }
  &:hover {
    color: #1890ff;
  }
}

.create-form {
  .bottom-button {
    margin: 0 -24px;
    padding: 16px 20px 0;
    border-top: 1px solid #e8e8e8;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
  .tip {
    margin-bottom: 8px;
    font-size: 12px;
    color: #8c8c8c;
  }
}
</style>
