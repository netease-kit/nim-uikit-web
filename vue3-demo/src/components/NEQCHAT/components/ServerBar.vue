<template>
  <div class="server-bar-container">
    <!-- <UserSettings></UserSettings> -->
    <div class="server-bar-container-line"></div>
    <div class="server-list" @scroll="handleScroll">
      <div
        class="server-bar-server-item"
        v-for="server in serverList"
        :key="server.serverId"
        :class="{ active: curServer && curServer.serverId === server.serverId }"
        @click="setCurServer(server)"
      >
        <div v-if="server.unReadInfo > 0">
          <Badge
            dot
            :offset="[-5, 18]"
            :numberStyle="{ width: '10px', height: '10px' }"
          >
            <Avatar
              v-if="server.icon"
              style="background-color: #ffffff"
              :size="42"
              :src="server.icon ? server.icon : ''"
            ></Avatar>
            <CommonAvatar
              v-if="!server.icon"
              :nick="server.name"
              :accid="server.serverId"
              :width="42"
              :border="0"
            ></CommonAvatar>
          </Badge>
        </div>
        <div v-if="server.unReadInfo < 1">
          <Avatar
            v-if="server.icon"
            style="background-color: #ffffff"
            :size="42"
            :src="server.icon ? server.icon : ''"
          ></Avatar>
          <CommonAvatar
            v-if="!server.icon"
            :nick="server.name"
            :accid="server.serverId"
            :width="42"
            :border="0"
          ></CommonAvatar>
        </div>
      </div>
    </div>
    <div class="server-bar-server-item" @click="initModal">
      <Avatar style="background-color: #f0f0f0" :size="42">
        <template #icon
          ><PlusOutlined :style="{ color: '#337EFF', fontSize: '16px' }"
        /></template>
      </Avatar>
    </div>
    <!-- <div class="server-bar-server-item" @click="initModalBack">
      <Avatar style="background-color: #f5f5f5" :size="42">
        <template #icon
          ><HomeOutlined :style="{ color: '#337EFF', fontSize: '16px' }"
        /></template>
      </Avatar>
    </div> -->
  </div>
  <Modal
    v-model:visible="visible"
    :title="step === 3 ? $t('加入服务器') : $t('创建服务器')"
    class="light"
    :footer="null"
    :width="426"
    @cancel="handleModalCancel"
  >
    <div class="step" v-show="step === 1">
      <div class="create-server-option" @click="step = 2">
        <div class="left">
          <div class="icon first">
            <IconFont type="icon-chuangjianfuwuqi" />
          </div>
          <div class="title">{{ $t("自己创建") }}</div>
        </div>
        <div class="right">
          <RightOutlined />
        </div>
      </div>
      <div class="create-server-option" @click="step = 3">
        <div class="left">
          <div class="icon second">
            <IconFont type="icon-jiarubierenfuwuqi" />
          </div>
          <div class="title">{{ $t("加入别人服务器") }}</div>
        </div>
        <div class="right">
          <RightOutlined />
        </div>
      </div>
    </div>
    <div class="step" v-show="step === 2 || step === 3">
      <div class="create-box" v-show="step === 2">
        <div class="upload">
          <Upload :show-upload-list="false" :before-upload="beforeUpload">
            <div class="upload-button" v-show="!serverIcon">
              <IconFont type="icon-shangchuanzhaopian" />
              <p>{{ $t("上传头像") }}</p>
            </div>
            <img class="upload-button" v-show="serverIcon" :src="serverIcon" />
          </Upload>
        </div>
        <Input
          allowClear
          v-model:value="serverName"
          :maxlength="50"
          :placeholder="$t('请输入服务器名称 (1-50个字符)')"
        />
      </div>
      <div class="join-box" v-show="step === 3">
        <Input
          allowClear
          v-model:value="searchServerId"
          :placeholder="$t('请输入服务器ID')"
          @pressEnter="getServers"
        >
          <template #prefix>
            <SearchOutlined style="color: #8c8c8c" />
          </template>
        </Input>
        <div class="search-server" v-if="searchServer.owner">
          <div class="left">
            <div class="icon">{{ searchServer.name.slice(-2) }}</div>
            <div class="info">
              <div class="name">{{ searchServer.name }}</div>
              <div class="accid">{{ searchServer.owner }}</div>
            </div>
          </div>
          <div class="right" @click="applySeverJoin">{{ $t("加入") }}</div>
        </div>
      </div>
      <div class="bottom-button">
        <div class="left" @click="step = 1">
          <IconFont type="icon-fanhui" />
          {{ $t("返回") }}
        </div>
        <div class="right" v-show="step === 2">
          <Button
            type="primary"
            @click="createServer"
            :disabled="!serverName"
            :loading="buttonload"
            >{{ $t("创建") }}</Button
          >
        </div>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import { ServerInfo } from "../types/v2-compat";
import { computed, onBeforeMount, onMounted, ref, watch } from "vue";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import CommonAvatar from "./CommonAvatar.vue";
import {
  Avatar,
  Modal,
  Input,
  Button,
  Upload,
  message,
  Badge,
} from "ant-design-vue";
import {
  PlusOutlined,
  RightOutlined,
  SearchOutlined,
  HomeOutlined,
} from "@ant-design/icons-vue";
import IconFont from "./IconFont";
import UserSettings from "./UserSettings/index.vue";
import { getCloudStorageService } from "../utils/v2nim";

export default {
  components: {
    Avatar,
    PlusOutlined,
    // HomeOutlined,
    RightOutlined,
    SearchOutlined,
    Modal,
    Input,
    Button,
    Upload,
    IconFont,
    CommonAvatar,
    Badge,
  },
  setup() {
    const { t: $t } = useI18n();
    const visible = ref<boolean>(false);
    const serverIcon = ref<string>("");
    const serverName = ref<string>("");
    const searchServerId = ref<string>("");
    const searchServer = ref({});
    const step = ref<number>(1);
    const loadingMoreRef = ref<boolean>(false);
    const store = useStore();
    const buttonload = ref<boolean>(false);

    // 点击首页服务器模块
    watch(
      () => store.state.server.searchServerId,
      async (serverId) => {
        if (serverId) {
          visible.value = true;
          step.value = 3;
          searchServerId.value = serverId;
          const res = await store.dispatch("server/getServers", {
            serverIds: [searchServerId.value],
          });
          if (res.length) {
            searchServer.value = res[0];
          } else {
            searchServer.value = {};
            message.error($t("未查询到sever"));
          }
        }
      },
    );

    // 组件挂载时直接获取服务器列表，不需要验证SDK状态
    onMounted(async () => {
      console.log("ServerBar: 开始获取服务器列表...");
      try {
        await store.dispatch("server/getSeverList", { timestamp: 0 });
        console.log("ServerBar: 服务器列表获取成功");

        // 检查是否需要自动选择默认服务器和频道
        const serverList = store.state.server.serverList;
        const curServer = store.state.server.curServer;
        const curChannel = store.state.channel.currentChannel;

        // 只有在没有选中任何服务器且有服务器列表时才自动选择
        if (serverList && serverList.length > 0 && !curServer) {
          console.log("ServerBar: 首次进入，自动选择第一个服务器");
          const firstServer = serverList[0];
          store.commit("server/setCurServer", firstServer);

          // 获取第一个服务器的频道列表
          await store.dispatch("channel/getChannelsByPage", {
            serverId: firstServer.serverId,
            limit: 100,
          });

          // 只有在没有当前频道时才自动选择第一个频道
          const channelList = store.state.channel.channelList;
          if (channelList && channelList.length > 0 && !curChannel) {
            console.log("ServerBar: 自动选择第一个频道");
            store.commit("channel/setCurChannel", channelList[0]);
          }
        }
      } catch (error) {
        console.error("ServerBar: 获取服务器列表失败:", error);
      }
    });

    return {
      serverIcon,
      visible,
      step,
      serverName,
      searchServerId,
      searchServer,
      buttonload,
      serverList: computed(() => store.state.server.serverList),
      curServer: computed(() => store.state.server.curServer),
      beforeUpload: async (file: File) => {
        let res: { url: string } = { url: "" };
        const isJpgOrPng =
          file.type === "image/jpeg" ||
          file.type === "image/png" ||
          file.type === "image/jpg";
        if (!isJpgOrPng) {
          message.error($t("请选择图片格式文件"));
          return Promise.reject();
        }
        const isOverSize = file.size / 1024 / 1024 < 5;
        if (!isOverSize) {
          message.error($t("请选择小于5MB的文件"));
          return Promise.reject();
        }
        try {
          res = await getCloudStorageService().uploadFile({
            file,
            type: "image",
          });
          if (res.url.indexOf("_im_url=1") > 0)
            res.url = await getCloudStorageService().getOriginUrl(res.url);
        } catch (e) {
          message.error($t("sdk 上传失败！"));
          return Promise.reject();
        }
        serverIcon.value = res.url;
        return Promise.reject();
      },
      setCurServer: async (server: ServerInfo) => {
        store.commit("server/setCurServer", server);
        // 设置当前服务器后，获取该服务器的频道列表
        await store.dispatch("channel/getChannelsByPage", {
          serverId: server.serverId,
          limit: 100,
        });

        // 设置第一个频道为当前频道
        const channelList = store.state.channel.channelList;
        if (channelList && channelList.length > 0) {
          store.commit("channel/setCurChannel", channelList[0]);
        }
      },

      createServer: async () => {
        buttonload.value = true;
        try {
          const res = await store.dispatch("server/createServer", {
            icon: serverIcon.value,
            name: serverName.value,
            inviteMode: 1,
          });
          if (res && res.serverId) {
            message.success($t("创建成功！"));
            buttonload.value = false;
            visible.value = false;
            await store.dispatch("server/subscribeServer", {
              type: 4,
              /**
               * 操作类型 1订阅 2取消订阅
               */
              opeType: 1,
              servers: [res.serverId],
            });
            await store.dispatch("server/getSeverList", { timestamp: 0 });
            // 默认选择刚创建完成
            store.commit(
              "server/setCurServer",
              store.state.server.serverList[0],
            );
            // 创建服务器成功后新建两个频道
            try {
              await store.dispatch("channel/createChannel", {
                serverId: res.serverId,
                viewMode: 0,
                name: "频道1",
              });
              await store.dispatch("channel/createChannel", {
                serverId: res.serverId,
                viewMode: 0,
                name: "频道2",
              });
              // 重新请求频道列表
              await store.dispatch("channel/getChannelsByPage", {
                serverId: res.serverId,
                timestamp: 0,
              });
              // 默认进入频道1
              store.commit(
                "channel/setCurChannel",
                store.state.channel.channelList[0],
              );
            } catch (channelError) {
              console.warn("创建默认频道失败:", channelError);
              // 服务器创建成功但频道创建失败，给出提示但不阻塞流程
              message.warning(
                $t("服务器创建成功，但创建默认频道失败，请手动创建"),
              );
            }
          }
        } catch (error: any) {
          console.error("创建服务器失败:", error);

          // 根据错误类型给出不同的提示
          let errorMsg = $t("服务器创建失败");
          if (error.code === 403) {
            errorMsg = $t("没有创建服务器的权限");
          } else if (error.code === 429) {
            errorMsg = $t("创建过于频繁，请稍后再试");
          } else if (error.message) {
            errorMsg = $t("服务器创建失败") + ": " + error.message;
          }

          message.error(errorMsg);
          // 重置按钮状态
          buttonload.value = false;
        }
      },
      getServers: async () => {
        if (!searchServerId.value) {
          message.error($t("请输入服务器Id"));
          return;
        }
        const res = await store.dispatch("server/getServers", {
          serverIds: [searchServerId.value],
        });
        if (res.length) {
          searchServer.value = res[0];
        } else {
          searchServer.value = {};
          message.error($t("暂无你要的服务器ID"));
        }
      },
      applySeverJoin: async () => {
        try {
          await store.dispatch("server/applySeverJoin", {
            serverId: searchServerId.value,
            ps: "",
          });
          message.success($t("加入成功"));
          await store.dispatch("server/subscribeServer", {
            type: 4,
            /**
             * 操作类型 1订阅 2取消订阅
             */
            opeType: 1,
            servers: [searchServerId.value],
          });
          await store.dispatch("server/getSeverList", { timestamp: 0 });
          visible.value = false;
          store.commit("server/setCurServer", store.state.server.serverList[0]);
        } catch (e: any) {
          console.error("加入服务器失败:", e);

          // 根据错误类型给出不同的提示
          let errorMsg = $t("加入失败");
          if (e.code === 417) {
            // 已经加入过
            message.warning($t("您已经是该服务器的成员"));
            visible.value = false;
            const server = store.state.server.serverList.find(
              (item: { serverId: string }) =>
                item.serverId === searchServerId.value,
            );
            if (server) store.commit("server/setCurServer", server);
            return;
          } else if (e.code === 403) {
            errorMsg = $t("没有权限加入该服务器，可能需要邀请");
          } else if (e.code === 404) {
            errorMsg = $t("服务器不存在或已被删除");
          } else if (e.message) {
            errorMsg = $t("加入失败") + ": " + e.message;
          }

          message.error(errorMsg);
        }
      },
      initModal: () => {
        visible.value = true;
        step.value = 1;
        serverIcon.value = "";
        serverName.value = "";
        searchServerId.value = "";
        searchServer.value = {};
      },
      initModalBack: () => {
        location.reload();
      },
      handleScroll: async (e: any) => {
        if (loadingMoreRef.value || !store.state.server.listQueryTag.hasMore) {
          return;
        }
        const serverDomHeight = 52;
        const hiddenHeight =
          store.state.server.serverList.length * serverDomHeight -
          e.target.clientHeight -
          e.target.scrollTop;
        if (hiddenHeight >= 10) return;
        loadingMoreRef.value = true;
        await store.dispatch("server/appendServerList", {
          timestamp: store.state.server.listQueryTag.nextTimetag,
        });
        loadingMoreRef.value = false;
      },
      handleModalCancel: () => {
        store.commit("server/setSearchServerId", "");
      },
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.server-bar-container {
  padding: 10px;
  background-color: #f8f9fa;
  height: 100%;
  .ant-avatar {
    border: 2px solid transparent;
    transition: all 0.3s ease;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    &:hover {
      border-color: #1890ff;
    }

    // 确保图标在Avatar中完全居中
    .anticon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }
  }
  .server-bar-container-line {
    margin: 0 auto;
    width: 32px;
    height: 1px;
    background: #d9d9d9;
  }
  .server-list {
    max-height: calc(100vh - 188px);
    overflow-x: hidden;
    overflow-y: auto;
    margin: 0 -10px;
  }
  .server-bar-server-item {
    cursor: pointer;
    position: relative;
    margin-top: 5px;
    transition: all 0.3s ease;
    display: flex;
    justify-content: center;
    align-items: center;
    &.active {
      &::before {
        position: absolute;
        content: "1";
        font-size: 0;
        border-radius: 3px;
        width: 3px;
        height: 40px;
        background: #1890ff;
        left: 0;
        top: 10px;
      }
    }
    &:hover {
      transform: translateX(2px);
    }
  }
}
.step {
  height: 302px;
  .create-server-option {
    cursor: pointer;
    font-size: 16px;
    color: #262626;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 0 20px;
    width: 378px;
    height: 60px;
    background: #ffffff;
    border: 1px solid #d9d9d9;
    box-sizing: border-box;
    border-radius: 8px;
    transition: all 0.3s ease;
    &:hover {
      border-color: #1890ff;
      box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
    }
    .left {
      display: flex;
      align-items: center;
      .icon {
        width: 36px;
        height: 36px;
        border-radius: 18px;
        margin-right: 8px;
        text-align: center;
        line-height: 36px;
        font-size: 28px;
        color: #ffffff;
        &.first {
          background: #52c41a;
        }
        &.second {
          background: #1890ff;
        }
      }
    }
  }
  .join-box,
  .create-box {
    height: 254px;
    .upload {
      margin-top: 32px;
      margin-bottom: 30px;
      text-align: center;
      .upload-button {
        margin: 0 auto;
        text-align: center;
        color: #8c8c8c;
        cursor: pointer;
        width: 80px;
        height: 80px;
        border-radius: 40px;
        background: #fafafa;
        border: 1px dashed #d9d9d9;
        transition: all 0.3s ease;
        &:hover {
          border-color: #1890ff;
          color: #1890ff;
        }
        .anticon {
          font-size: 24px;
          margin-top: 10px;
        }
      }
    }
    input.ant-input {
      color: #262626;
      background: #ffffff;
      border: 1px solid #d9d9d9;
    }
  }
  .join-box {
    .search-server {
      margin-top: 16px;
      display: flex;
      height: 60px;
      align-items: center;
      justify-content: space-between;
      .left {
        display: flex;
        align-items: center;
        .icon {
          width: 36px;
          height: 36px;
          text-align: center;
          line-height: 36px;
          border-radius: 18px;
          background: #60cfa7;
          margin-right: 12px;
        }
        .info {
          .name {
            font-size: 14px;
          }
          .accid {
            font-size: 12px;
            color: #a3a4a9;
          }
        }
      }
      .right {
        cursor: pointer;
      }
    }
  }
  .bottom-button {
    margin: 0 -24px;
    padding: 0 20px;
    border-top: 1px solid #f0f0f0;
    position: relative;
    bottom: 0;
    height: 72px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .left {
      cursor: pointer;
      color: #262626;
    }
  }
}
</style>
