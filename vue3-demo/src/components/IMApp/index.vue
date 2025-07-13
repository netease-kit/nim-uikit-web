<template>
  <div class="chat-container">
    <div class="container">
      <div class="header">
        <div class="search" ref="searchRef" />
        <div class="add" ref="addRef" />
      </div>
      <div class="content">
        <div class="left">
          <div class="avatar-icon" ref="avatarRef" />
          <div
            class="chat-icon"
            :class="{
              active: model === 'chat',
            }"
            @click="() => (model = 'chat')"
          >
            <i
              class="iconfont icon-im"
              :class="{
                iconfont: true,
                'icon-im': true,
              }"
            />
            <div class="icon-label">会话</div>
          </div>
          <div
            class="contact-icon"
            :class="{
              active: model === 'collect',
            }"
            @click="
              () => {
                model = 'collect';
                renderCollection();
              }
            "
          >
            <i
              class="iconfont icon-daohang-shoucang"
              :class="{
                iconfont: true,
                'icon-daohang-shoucang': true,
              }"
            />
            <div class="icon-label">收藏</div>
          </div>
          <div
            class="contact-icon"
            :class="{
              active: model === 'contact',
            }"
            @click="() => (model = 'contact')"
          >
            <i
              class="iconfont icon-tongxunlu-weixuanzhong"
              :class="{
                iconfont: true,
                'icon-tongxunlu-weixuanzhong': true,
              }"
            />
            <div class="icon-label">通讯录</div>
          </div>
          <div class="logout-icon"></div>
        </div>
        <div class="right" v-show="model === 'chat'">
          <div class="right-list" ref="conversationRef" />
          <div class="right-content" ref="chatRef" />
        </div>
        <div class="right" v-show="model === 'contact'">
          <div class="right-list" ref="contactListRef" />
          <div class="right-content" ref="contactInfoRef" />
        </div>
        <div class="collect" v-if="model === 'collect'">
          <div class="collectRight" ref="collectRef"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="ChatRoom">
import { IMUIKit } from "@xkit-yx/im-kit-ui";
import V2NIM from "nim-web-sdk-ng";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import { ref, onMounted, nextTick } from "vue";
import {
  ConversationContainer, // 会话列表组件
  ChatContainer, // 聊天（会话消息）组件
  AddContainer, // 搜索——添加按钮组件
  SearchContainer, // 搜索——搜索组件
  ContactListContainer, // 通讯录——通讯录导航组件
  ContactInfoContainer, // 通讯录——通讯录详情组件，包含好友列表、群组列表以及黑名单列表
  MyAvatarContainer, // 用户资料组件
  ChatCollectionList, // 收藏组件
} from "@xkit-yx/im-kit-ui";
import "@xkit-yx/im-kit-ui/es/style/css";
import "./iconfont.css";

//需要用到的 ref
const searchRef = ref();
const addRef = ref();
const avatarRef = ref();
const conversationRef = ref();
const chatRef = ref();
const contactListRef = ref();
const contactInfoRef = ref();
const collectRef = ref();
let uikit;

const initOptions = {
  appkey: "",
  account: "",
  token: "",
};
// 默认菜单
const model = ref("chat");
// 聊天室配置
const localOptions = {
  // 添加好友模式，默认需要验证
  addFriendNeedVerify: true,
  // 群组加入模式，默认不需要验证
  //@ts-ignore
  teamJoinMode: V2NIMConst.V2NIMTeamJoinMode.V2NIM_TEAM_JOIN_MODE_FREE,
  // 群组被邀请模式，默认不需要验证
  teamAgreeMode:
    //@ts-ignore
    V2NIMConst.V2NIMTeamAgreeMode.V2NIM_TEAM_AGREE_MODE_NO_AUTH,
  // 单聊消息是否显示已读未读 默认 false
  p2pMsgReceiptVisible: true,
  // 群聊消息是否显示已读未读 默认 false
  teamMsgReceiptVisible: true,
  // 是否需要@消息 默认 true
  needMention: true,
  // 是否显示在线离线状态 默认 true
  loginStateVisible: true,
  // 是否允许转让群主
  allowTransferTeamOwner: true,
  // 是否需要显示群管理员相关主动功能，默认 false
  teamManagerVisible: true,
};
// 初始化IM系统
async function initIMSystem() {
  // 检查IM信息
  if (!initOptions?.appkey || !initOptions?.account || !initOptions?.token) {
    alert("缺少IM认证信息，请补充参数");
    throw new Error("缺少IM认证信息，请补充参数");
  }

  const nim = V2NIM.getInstance({
    ...initOptions,
    // 是否开启云端会话，默认不开启
    enableV2CloudConversation: false,
    debugLevel: "debug",
    apiVersion: "v2",
  });

  // IM 连接
  nim.V2NIMLoginService.login(initOptions.account, initOptions.token, {
    retryCount: 5,
  });

  // 添加连接状态监听
  nim.V2NIMLoginService.on("onLoginStatus", (status) => {
    console.log("IM登录状态变化:", status);
  });

  // 初始化 UIKit 实例
  uikit = new IMUIKit({
    nim,
    singleton: true,
    localOptions,
  });

  try {
    // 使用 Promise.all 等待所有 render 完成
    await Promise.all([
      uikit.render(
        SearchContainer,
        {
          onClickChat: () => {
            model.value = "chat";
          },
        },
        searchRef.value
      ),
      uikit.render(
        AddContainer,
        {
          onClickChat: () => {
            model.value = "chat";
          },
        },
        addRef.value
      ),
      uikit.render(MyAvatarContainer, null, avatarRef.value),
      uikit.render(ConversationContainer, null, conversationRef.value),
      uikit.render(
        ChatContainer,
        {
          // 自定义渲染配置
        },
        chatRef.value
      ),
      uikit.render(ContactListContainer, null, contactListRef.value),
      uikit.render(
        ContactInfoContainer,
        {
          afterSendMsgClick: () => {
            model.value = "chat";
          },
          onGroupItemClick: () => {
            model.value = "chat";
          },
        },
        contactInfoRef.value
      ),
    ]);

    // 在这里执行需要等待所有 render 完成后的操作
    nextTick(() => {
      console.log("所有组件渲染完成");
    });
  } catch (error) {
    console.error("组件渲染失败:", error);
  }
}

function renderCollection() {
  setTimeout(() => {
    uikit.render(ChatCollectionList, null, collectRef.value);
  }, 0);
}

onMounted(() => {
  initIMSystem();
});
</script>

<style scoped>
body {
  background: #d8dee5;
}

.containerWrapper {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-image: url("../../static/bg.png");
}
.container {
  width: 1070px;
  height: 670px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
}

.header {
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #e8e8e8;
}

.search {
  width: 50%;
}

.add {
  margin-left: 20px;
}

.content {
  width: 100%;
  height: 610px;
  display: flex;
}

.left {
  width: 60px;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  box-sizing: border-box;
  min-width: 60px;
}

.avatar-icon {
  margin: 20px 0 25px 0;
  border-radius: 50%;
  border: 1px solid #e8e8e8;
}

.iconfont {
  font-size: 24px;
}

.chat-icon,
.contact-icon {
  margin: 0 0 25px 0;
  font-size: 22px;
  color: rgba(0, 0, 0, 0.6);
  height: 45px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.active {
  color: #2a6bf2;
}

.logout-icon {
  position: absolute;
  bottom: 10px;
  font-size: 22px;
  color: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.icon-label {
  font-size: 12px;
  text-align: center;
}

.right {
  flex: 1;
  display: flex;
}

.right-list {
  width: 200px;
  border-right: 1px solid #e8e8e8;
}

.right-content {
  flex: 1;
}
.collect {
  width: 100%;
  height: 100%;
}
.collectRight {
  width: 100%;
  height: 100%;
}
</style>
