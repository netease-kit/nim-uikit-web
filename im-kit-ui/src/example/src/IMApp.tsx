import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  ConversationContainer, // 会话列表组件
  ChatContainer, // 聊天（会话消息）组件
  ChatCollectionList,
  AddContainer, // 搜索——添加按钮组件
  SearchContainer, // 搜索——搜索组件
  ContactListContainer, // 通讯录——通讯录导航组件
  ContactInfoContainer, // 通讯录——通讯录详情组件，包含好友列表、群组列表以及黑名单列表
  MyAvatarContainer,
  useStateContext,
  ComplexAvatarContainer,
  Utils,
} from "../../index";
import { Badge, Button, Popover, message, Dropdown, Menu } from "antd";
import classNames from "classnames";
import { observer } from "mobx-react";
import "../../style/index";
import "antd/es/badge/style";
import "./iconfont.css";
import "./index.less";
// 左下角菜单组件
import SettingModal from "./components/Setting";
import Menus from "./components/Menus";
// 呼叫组件
import {
  CallViewProvider,
  CallViewProviderRef,
  //@ts-ignore
} from "@xkit-yx/call-kit-react-ui";
import "@xkit-yx/call-kit-react-ui/es/style";
import Calling from "./components/call";
//demo国际化函数
import { convertSecondsToTime, g2StatusMap, t } from "./util";
import { DeleteOutlined } from "@ant-design/icons";
import {
  pauseAllAudio,
  pauseAllVideo,
} from "../../common/components/CommonParseSession";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import { RenderP2pCustomMessageOptions } from "../../chat/components/ChatP2pMessageList";

interface IMAppProps {
  appkey: string; //传入您的App Key
  account: string; // 传入您的云信IM账号
  onLogout?: () => void;
  locale: "zh" | "en";
  addFriendNeedVerify: boolean;
  p2pMsgReceiptVisible: boolean;
  teamMsgReceiptVisible: boolean;
  needMention: boolean;
  teamManagerVisible: boolean;
}
const IM: React.FC<IMAppProps> = observer((props) => {
  const {
    onLogout,
    locale,
    addFriendNeedVerify,
    appkey,
    p2pMsgReceiptVisible,
    teamMsgReceiptVisible,
    needMention,
    teamManagerVisible,
  } = props;
  const callViewProviderRef = useRef<CallViewProviderRef>(null);
  const [model, setModel] = useState<"chat" | "contact" | "collection">("chat");
  const [isSettingModalOpen, setIsSettingModalOpen] = useState<boolean>(false);
  // 是否显示呼叫弹窗
  const [callingVisible, setCallingVisible] = useState<boolean>(false);
  // IMUIKit store 与 nim sdk 实例
  const { store, nim } = useStateContext();

  // const conversationId = store.uiStore.selectedConversation
  const conversationType = nim.V2NIMConversationIdUtil.parseConversationType(
    store.uiStore.selectedConversation
  );
  const receiverId = nim.V2NIMConversationIdUtil.parseConversationTargetId(
    store.uiStore.selectedConversation
  );

  const { relation } = store.uiStore.getRelation(receiverId);

  const messageActionDropdownContainerRef = useRef<HTMLDivElement>(null);

  const handleSettingCancel = () => {
    setIsSettingModalOpen(false);
  };

  const openSettingModal = () => {
    setIsSettingModalOpen(true);
  };

  // 发起呼叫
  const handleCall = useCallback(
    async (callType) => {
      try {
        await callViewProviderRef.current?.call?.({
          accId: receiverId,
          callType,
        });
        setCallingVisible(false);
      } catch (error) {
        // @ts-ignore
        switch (error.code) {
          // 忙线
          case "105":
            message.error(t("inCallText"));
            break;
          // 无网络
          case "Error_Internet_Disconnected":
            message.error(t("networkDisconnectText"));
            break;
          default:
            // 处理其他错误
            message.error(t("callFailed"));
            break;
        }
      }
    },
    [receiverId]
  );

  // 重新渲染发送按钮，增加呼叫按钮
  const actions = useMemo(
    () => [
      {
        action: "emoji",
        visible: true,
      },
      {
        action: "sendImg",
        visible: true,
      },
      {
        action: "sendFile",
        visible: true,
      },
      { action: "aiTranslate" },
      {
        action: "calling",
        visible:
          conversationType ===
            V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P &&
          relation !== "ai",
        render: () => {
          return (
            <Button type="text" disabled={false}>
              <Popover
                trigger="click"
                visible={callingVisible}
                content={<Calling handleCall={handleCall} />}
                onVisibleChange={(newVisible) => setCallingVisible(newVisible)}
              >
                <i className="calling-icon iconfont icon-shipinyuyin" />
              </Popover>
            </Button>
          );
        },
      },
      {
        action: "sendMsg",
        visible: true,
      },
    ],
    [callingVisible, handleCall, conversationType, relation]
  );

  // 根据msg.type 自定义渲染话单消息，当msg.type 为 g2 代表的是话单消息，使用renderP2pCustomMessage进行自定义渲染
  const renderP2pCustomMessage = useCallback(
    (options: RenderP2pCustomMessageOptions) => {
      const msg = options.msg;

      // msg.type 为 g2 代表的是话单消息 renderP2pCustomMessage 返回 null 就会按照组件默认的逻辑进行展示消息
      if (
        msg.messageType !== V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CALL
      ) {
        return null;
      }

      const attach = msg.attachment as any;
      const raw = JSON.parse(attach?.raw || "{}");
      const duration = raw.durations[0]?.duration;
      const status = raw.status;
      const type = raw.type;
      const icon = type == 1 ? "icon-yuyin8" : "icon-shipin8";
      const myAccount = store.userStore.myUserInfo.accountId;
      //判断当前消息是发出的消息还是接收的消息
      const isSelf = msg.senderId === myAccount;
      const account = isSelf ? myAccount : receiverId;
      const deleteG2Message = (msg) => {
        store.msgStore.deleteMsgActive([msg]);
      };

      return (
        <div className={classNames("wrapper", { "wrapper-self": isSelf })}>
          <ComplexAvatarContainer account={account} />
          <Dropdown
            key={msg.messageClientId}
            trigger={["contextMenu"]}
            getPopupContainer={(triggerNode) =>
              messageActionDropdownContainerRef.current || triggerNode
            }
            overlay={
              <Menu
                onClick={() => deleteG2Message(msg)}
                items={[
                  {
                    label: t("deleteText"),
                    key: "delete",
                    icon: <DeleteOutlined />,
                  },
                ]}
              />
            }
          >
            <div
              className={classNames("g2-msg-wrapper", {
                "g2-msg-wrapper-self": isSelf,
              })}
              ref={messageActionDropdownContainerRef}
            >
              <div className="appellation">
                {store.uiStore.getAppellation({ account })}
              </div>

              <div
                className={classNames("g2-msg", { "g2-msg-self": isSelf })}
                onClick={() => handleCall(type.toString())}
              >
                <i className={classNames("iconfont", "g2-icon", icon)}></i>
                <span>{g2StatusMap[status]}</span>
                {duration ? (
                  <span className="g2-time">
                    {convertSecondsToTime(duration)}
                  </span>
                ) : null}
              </div>
              <div className="time">{Utils.formatDate(msg.createTime)}</div>
            </div>
          </Dropdown>
        </div>
      );
    },
    [
      handleCall,
      receiverId,
      store.uiStore,
      store.msgStore,
      store.userStore.myUserInfo.accountId,
    ]
  );

  const goChat = useCallback(() => {
    setModel("chat");
  }, []);

  const afterAcceptApplyFriend = useCallback(
    (data) => {
      const textMsg = nim.V2NIMMessageCreator.createTextMessage(
        t("passFriendAskText")
      );

      store.msgStore
        .sendMessageActive({
          msg: textMsg,
          conversationId: nim.V2NIMConversationIdUtil.p2pConversationId(
            data.operatorAccountId
          ),
        })
        .then(() => {
          setModel("chat");
        });
    },
    [nim.V2NIMConversationIdUtil, nim.V2NIMMessageCreator, store.msgStore]
  );

  useEffect(() => {
    if (callViewProviderRef.current?.neCall) {
      //注册呼叫结束事件监听
      callViewProviderRef.current?.neCall?.on("onRecordSend", (options) => {
        //@ts-ignore
        store.msgStore.addMsg(options.conversationId, [options]);
        document.getElementById(options.messageClientId)?.scrollIntoView({
          block: "nearest", // 滚动到目标元素的最近可见位置
          inline: "nearest", // 避免水平方向的滚动
        });
      });
      // 设置呼叫超时时间
      callViewProviderRef.current?.neCall?.setTimeout(30);
      // 接通成功事件
      callViewProviderRef.current?.neCall?.on("onCallConnected", () => {
        // 暂停音视频消息的播放
        pauseAllAudio();
        pauseAllVideo();
      });
    }
  }, [callViewProviderRef.current?.neCall, store.msgStore]);

  const renderContent = useCallback(() => {
    return (
      <>
        <div className="header">
          <div className="search">
            <SearchContainer onClickChat={goChat} />
          </div>
          <div className="add">
            <AddContainer onClickChat={goChat} />
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
                <i className="iconfont">&#xe6c9;</i>
                <div className="icon-label">{t("session")}</div>
              </div>
            </Badge>
            <Badge dot={false}>
              <div
                className={classNames("collection-icon", {
                  active: model === "collection",
                })}
                onClick={() => setModel("collection")}
              >
                <i className="iconfont">&#xe73d;</i>
                <div className="icon-label">{t("collectionText")}</div>
              </div>
            </Badge>
            <Badge dot={!!store.sysMsgStore.getTotalUnreadMsgsCount()}>
              <div
                className={classNames("contact-icon", {
                  active: model === "contact",
                })}
                onClick={() => setModel("contact")}
              >
                <i className="iconfont">&#xe6c4;</i>
                <div className="icon-label">{t("addressText")}</div>
              </div>
            </Badge>
            <Menus
              onLogout={() => {
                onLogout && onLogout();
                store.resetState();
              }}
              locale={locale}
              openSettingModal={openSettingModal}
            />
          </div>
          {/* 若您复制IMUIKit demo至您的工程，SettingModal相关代码可以删除 */}
          <SettingModal
            isSettingModalOpen={isSettingModalOpen}
            handleSettingCancel={handleSettingCancel}
            p2pMsgReceiptVisible={p2pMsgReceiptVisible}
            teamMsgReceiptVisible={teamMsgReceiptVisible}
            addFriendNeedVerify={addFriendNeedVerify}
            needMention={needMention}
            teamManagerVisible={teamManagerVisible}
            locale={locale}
          />
          {model === "chat" && (
            <div className="right">
              <div className="security-tip">{t("securityTipText")}</div>
              <div className="right-content-wrap">
                <div className="right-list">
                  <ConversationContainer />
                </div>
                <div className="right-content">
                  <ChatContainer
                    actions={actions}
                    renderP2pCustomMessage={renderP2pCustomMessage}
                  />
                </div>
              </div>
            </div>
          )}
          {model === "contact" && (
            <div className="right">
              <div className="security-tip">{t("securityTipText")}</div>
              <div className="right-content-wrap">
                <div className="right-list">
                  <ContactListContainer />
                </div>
                <div className="right-content">
                  <ContactInfoContainer
                    afterSendMsgClick={goChat}
                    onGroupItemClick={goChat}
                    afterAcceptApplyFriend={afterAcceptApplyFriend}
                  />
                </div>
              </div>
            </div>
          )}
          {model === "collection" && <ChatCollectionList />}
        </div>
      </>
    );
  }, [
    actions,
    addFriendNeedVerify,
    isSettingModalOpen,
    locale,
    model,
    onLogout,
    p2pMsgReceiptVisible,
    teamMsgReceiptVisible,
    renderP2pCustomMessage,
    store.sysMsgStore,
    needMention,
    teamManagerVisible,
    afterAcceptApplyFriend,
    goChat,
  ]);

  return (
    <CallViewProvider
      ref={callViewProviderRef}
      neCallConfig={{
        // @ts-ignore
        nim,
        appkey,
        debug: true,
      }}
      position={{
        x: 400,
        y: 10,
      }}
    >
      {renderContent()}
    </CallViewProvider>
  );
});

export default IM;
