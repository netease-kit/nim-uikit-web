import React, { useMemo } from "react";
import {
  Provider, // 全局上下文
  ConversationContainer, // 会话列表组件
  ChatContainer, // 聊天（会话消息）组件
  AddContainer, // 搜索——添加按钮组件
  SearchContainer, // 搜索——搜索组件
  ContactListContainer, // 通讯录——通讯录导航组件
  ContactInfoContainer, // 通讯录——通讯录详情组件，包含好友列表、群组列表以及黑名单列表
  MyAvatarContainer,
  useStateContext, // 用户资料组件
  ContextManagerTypes,
} from "../../YXUIKit/im-kit-ui/src";

import LoginOutlined from "@ant-design/icons/LoginOutlined";
import { ConfigProvider, Badge } from "antd";
import zhCN from "antd/es/locale/zh_CN";
import classNames from "classnames";
import { observer } from "mobx-react";

import "antd/es/badge/style";
import "../../YXUIKit/im-kit-ui/src/style";
import "./iconfont.css";
import "./index.less";

export interface IMAppProps {
  appkey: string; //传入您的App Key
  account: string; // 传入您的云信IM账号
  token: string; // 传入您的Token
  sdkVersion: 1 | 2;
  onLogout?: () => void;
}
// @ts-ignore: Unreachable code error

const IMApp: React.FC<Pick<IProps, "onLogout">> = observer((props) => {
  const { onLogout } = props;
  const [model, setModel] = React.useState<"chat" | "contact">("chat");
  const { store } = useStateContext();

  return (
    <>
      <div className="header">
        <div className="search">
          <SearchContainer />
        </div>
        <div className="add">
          <AddContainer />
        </div>
      </div>
      <div className="content">
        <div className="left">
          <div className="avatar-icon">
            <MyAvatarContainer />
          </div>
          <Badge dot={false}>
            <div
              className={classNames("chat-icon", {
                active: model === "chat",
              })}
              onClick={() => setModel("chat")}
            >
              <i className="iconfont icon-message_fill_light" />
              <div className="icon-label">会话</div>
            </div>
          </Badge>
          <Badge dot={!!store.uiStore.systemMsgUnread}>
            <div
              className={classNames("contact-icon", {
                active: model === "contact",
              })}
              onClick={() => setModel("contact")}
            >
              <i className="iconfont icon-tongxunlu1" />
              <div className="icon-label">通讯录</div>
            </div>
          </Badge>
          <div className="logout-icon" onClick={() => onLogout?.()}>
            <LoginOutlined />
            <div className="icon-label">退出</div>
          </div>
        </div>
        {model === "chat" && (
          <div className="right">
            <div className="right-list">
              <ConversationContainer />
            </div>
            <div className="right-content">
              <ChatContainer />
            </div>
          </div>
        )}
        {model === "contact" && (
          <div className="right">
            <div className="right-list">
              <ContactListContainer />
            </div>
            <div className="right-content">
              <ContactInfoContainer
                afterSendMsgClick={() => setModel("chat")}
                onGroupItemClick={() => setModel("chat")}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
});

const IMAppContainer: React.FC<IMAppProps> = (props) => {
  const { appkey, account, token, sdkVersion, onLogout } = props;

  const initOptions = useMemo(() => {
    return {
      appkey,
      account,
      token,
      lbsUrls: ["https://lbs.netease.im/lbs/webconf.jsp"],
      linkUrl: "weblink.netease.im",
      needReconnect: true,
      reconnectionAttempts: 5,
    };
  }, [appkey, account, token]);

  return (
    <ConfigProvider locale={zhCN}>
      <div className="im-app-example">
        <div className="container">
          <Provider sdkVersion={sdkVersion} initOptions={initOptions}>
            <IMApp onLogout={onLogout} />
          </Provider>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default IMAppContainer;
