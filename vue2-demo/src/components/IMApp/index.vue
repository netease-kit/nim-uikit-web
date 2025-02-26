<template>
  <div>
    <div :class="$style.container">
      <!-- IMUIKIT 相关内容 -->
      <div :class="$style.header">
        <div :class="$style.search" ref="search" />
        <div :class="$style.add" ref="add" />
      </div>
      <div :class="$style.content">
        <div :class="$style.left">
          <div :class="$style['avatar-icon']" ref="avatar" />
          <div
            :class="{
              [$style['chat-icon']]: true,
              [$style.active]: model === 'chat',
            }"
            @click="() => (model = 'chat')"
          >
            <i
              :class="{
                [$style['iconfont']]: true,
                iconfont: true,
                'icon-im': true,
              }"
            />
            <div :class="$style['icon-label']">会话</div>
          </div>
          <div
            :class="{
              [$style['contact-icon']]: true,
              [$style.active]: model === 'collect',
            }"
            @click="
              () => {
                model = 'collect';
                renderCollection();
              }
            "
          >
            <i
              :class="{
                [$style['iconfont']]: true,
                iconfont: true,
                'icon-daohang-shoucang': true,
              }"
            />
            <div :class="$style['icon-label']">收藏</div>
          </div>
          <div
            :class="{
              [$style['contact-icon']]: true,
              [$style.active]: model === 'contact',
            }"
            @click="() => (model = 'contact')"
          >
            <i
              :class="{
                [$style['iconfont']]: true,
                iconfont: true,
                'icon-tongxunlu-weixuanzhong': true,
              }"
            />
            <div :class="$style['icon-label']">通讯录</div>
          </div>
        </div>
        <div :class="$style.right" v-show="model === 'chat'">
          <div :class="$style['right-list']" ref="conversation" />
          <div :class="$style['right-content']" ref="chat" />
        </div>
        <div :class="$style.right" v-show="model === 'contact'">
          <div :class="$style['right-list']" ref="contactList" />
          <div :class="$style['right-content']" ref="contactInfo" />
        </div>
        <div :class="$style.collect" v-if="model === 'collect'">
          <div :class="$style.collectRight" ref="collect"></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
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
export default {
  name: "IMApp",

  data: function () {
    return {
      model: "chat",
    };
  },
  methods: {
    renderCollection() {
      setTimeout(() => {
        window.$uikit.render(ChatCollectionList, null, this.$refs.collect);
      }, 0);
    },
  },
  mounted() {
    window.$uikit.render(
      SearchContainer,
      {
        onClickChat: () => {
          this.model = "chat";
        },
      },
      this.$refs.search
    );
    window.$uikit.render(
      AddContainer,
      {
        onClickChat: () => {
          this.model = "chat";
        },
      },
      this.$refs.add
    );
    window.$uikit.render(MyAvatarContainer, null, this.$refs.avatar);
    window.$uikit.render(
      ConversationContainer,
      {
        // renderCustomP2pConversation: (props) => {
        //   console.log(props);
        //   return compile(`<div>${props.conversation.conversationId}</div>`);
        // },
      },
      this.$refs.conversation
    );
    window.$uikit.render(
      ChatContainer,
      {
        // 以下是自定义渲染，用 compile 函数包裹 html 就可以了，注意 class 要写成 className
        // 安装并引入： import { compile } from "jsx-web-compiler";
        // renderHeader: () => compile(`<div className="my-header">123</div>`),
        // renderEmpty: () => compile("<div>This is empty</div>"),
        // renderHeader: () => {
        //   //...
        //   return compile(
        //     `<div style={{display: 'flex', alignItems: 'center',fontWeight: 'bold', color: 'red'}}>
        //        3333
        //       </div>`,
        //     {},
        //   );
        // },
      },
      this.$refs.chat
    );
    window.$uikit.render(ContactListContainer, null, this.$refs.contactList);
    window.$uikit.render(
      ContactInfoContainer,
      {
        afterSendMsgClick: () => {
          this.model = "chat";
        },
        onGroupItemClick: () => {
          this.model = "chat";
        },
      },
      this.$refs.contactInfo
    );
  },
};
</script>

<style module>
body {
  background: #d8dee5;
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
  min-width: 60px;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  box-sizing: border-box;
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
