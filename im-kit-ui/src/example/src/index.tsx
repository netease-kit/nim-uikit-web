import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Provider, // 全局上下文
} from "../../index";
import "../../style/index";
import { ConfigProvider } from "antd";
//antd 国际化
import zhCN from "antd/es/locale/zh_CN";
import enUS from "antd/es/locale/en_US";
//UIKit 国际化
import en from "./locales/en";
import zh from "./locales/zh";
import "antd/es/badge/style";
import "./iconfont.css";
import "./index.less";
import { LocalOptions } from "@xkit-yx/im-store-v2/dist/types/types";
import V2NIM from "nim-web-sdk-ng";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import { V2NIMAIUser } from "nim-web-sdk-ng/dist/esm/nim/src/V2NIMAIService";
import { NIMOtherOptions } from "nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/NIMInterface";

import IMApp from "./IMApp";

interface IMContainerProps {
  appkey: string; //传入您的App Key
  account: string; // 传入您的云信IM账号
  token: string; // 传入您的Token
  otherOptions?: NIMOtherOptions;
  onLogout?: () => void;
  changeLanguage?: (value: "zh" | "en") => void;
}

const IMAppContainer: React.FC<IMContainerProps> = (props) => {
  const { appkey, account, token, otherOptions, onLogout } = props;
  // 国际化语言类型
  const [curLanguage, setCurLanguage] = useState<"zh" | "en">("zh");
  // 添加好友是否需要验证
  const [addFriendNeedVerify, setAddFriendNeedVerify] = useState<boolean>(true);
  //单聊消息是否显示已读未读
  const [p2pMsgReceiptVisible, setP2pMsgReceiptVisible] =
    useState<boolean>(true);
  //群聊消息是否显示已读未读
  const [teamMsgReceiptVisible, setTeamMsgReceiptVisible] =
    useState<boolean>(true);
  // 是否需要@消息
  const [needMention, setNeedMention] = useState<boolean>(true);
  // 是否开启群管理员功能
  const [teamManagerVisible, setTeamManagerVisible] = useState<boolean>(true);
  const languageMap = useMemo(() => ({ zh, en }), []);

  // 本地默认行为参数
  const localOptions: Partial<LocalOptions> = useMemo(() => {
    return {
      // 添加好友模式，默认需要验证
      addFriendNeedVerify,
      // 群组被邀请模式，默认不需要验证
      teamAgreeMode:
        V2NIMConst.V2NIMTeamAgreeMode.V2NIM_TEAM_AGREE_MODE_NO_AUTH,
      // 单聊消息是否显示已读未读
      p2pMsgReceiptVisible,
      // 群聊消息是否显示已读未读
      teamMsgReceiptVisible,
      // 是否需要@消息
      needMention,
      // 是否开启群管理员
      teamManagerVisible,
      // 是否显示在线离线状态
      loginStateVisible: false,
      // 是否允许转让群主
      allowTransferTeamOwner: true,
      // AI 功能是否开启
      aiVisible: true,
      // AI 提供者
      aiUserAgentProvider: {
        /**
         * 注册 AI 划词数字人
         */
        getAISearchUser: (users: V2NIMAIUser[]): V2NIMAIUser | void => {
          // demo 根据 accid 匹配，具体值根据业务后台配置的来
          return users.find((item) => item.accountId === "search");
        },
        /**
         * 注册 AI 翻译数字人
         */
        getAITranslateUser: (users: V2NIMAIUser[]): V2NIMAIUser | void => {
          // demo 根据 accid 匹配，具体值根据业务后台配置的来
          return users.find((item) => item.accountId === "translation");
        },
        /**
         * 注册 AI 翻译语言
         */
        getAITranslateLangs: (users: V2NIMAIUser[]): string[] => {
          return ["英语", "日语", "韩语", "俄语", "法语", "德语"];
        },
      },
    };
  }, [
    addFriendNeedVerify,
    needMention,
    p2pMsgReceiptVisible,
    teamManagerVisible,
    teamMsgReceiptVisible,
  ]);

  // 此处是为了便于demo体验，实际开发中请根据业务需求配置
  useEffect(() => {
    const _languageType = sessionStorage.getItem("languageType") as "zh" | "en";
    const _addFriendNeedVerify = sessionStorage.getItem("addFriendNeedVerify");
    const _p2pMsgReceiptVisible = sessionStorage.getItem(
      "p2pMsgReceiptVisible"
    );
    const _teamMsgReceiptVisible = sessionStorage.getItem(
      "teamMsgReceiptVisible"
    );
    const _needMention = sessionStorage.getItem("needMention");
    const _teamManagerVisible = sessionStorage.getItem("teamManagerVisible");

    setCurLanguage(_languageType || "zh");
    if (_p2pMsgReceiptVisible) {
      setP2pMsgReceiptVisible(_p2pMsgReceiptVisible === "true");
    }

    if (_teamMsgReceiptVisible) {
      setTeamMsgReceiptVisible(_teamMsgReceiptVisible === "true");
    }

    if (_addFriendNeedVerify) {
      setAddFriendNeedVerify(_addFriendNeedVerify === "true");
    }

    if (_needMention) {
      setNeedMention(_needMention === "true");
    }

    if (_teamManagerVisible) {
      setTeamManagerVisible(_teamManagerVisible === "true");
    }
  }, []);

  const nim = useMemo(() => {
    console.log(
      "V2NIM.getInstance: ",
      {
        appkey,
        debugLevel: "debug",
        apiVersion: "v2",
      },
      otherOptions
    );
    const nim = V2NIM.getInstance(
      {
        appkey,
        debugLevel: "debug",
        apiVersion: "v2",
      },
      otherOptions
    );

    return nim;
  }, [appkey, otherOptions]);

  useEffect(() => {
    if (
      account &&
      token &&
      // @ts-ignore
      nim.V2NIMLoginService.getLoginStatus() ===
        V2NIMConst.V2NIMLoginStatus.V2NIM_LOGIN_STATUS_LOGOUT
    ) {
      nim.V2NIMLoginService.login(account, token, {
        retryCount: 5,
      }).catch((err) => {
        console.log("登录失败的回调", err);
      });
    }
  }, [account, token, nim.V2NIMLoginService]);

  const handleLogout = useCallback(async () => {
    await nim.V2NIMLoginService.logout();
    onLogout?.();
  }, [onLogout, nim.V2NIMLoginService]);

  return (
    <ConfigProvider locale={curLanguage === "zh" ? zhCN : enUS}>
      <div className="im-app-example">
        <div className="container">
          <Provider
            localeConfig={languageMap[curLanguage]}
            localOptions={localOptions}
            // @ts-ignore
            nim={nim}
            singleton={true}
          >
            <IMApp
              onLogout={handleLogout}
              appkey={appkey}
              account={account}
              locale={curLanguage}
              addFriendNeedVerify={addFriendNeedVerify}
              p2pMsgReceiptVisible={p2pMsgReceiptVisible}
              teamMsgReceiptVisible={teamMsgReceiptVisible}
              needMention={needMention}
              teamManagerVisible={teamManagerVisible}
            />
          </Provider>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default IMAppContainer;
