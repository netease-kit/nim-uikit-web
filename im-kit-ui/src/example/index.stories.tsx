import React, { useCallback, useEffect, useState } from "react";
import IMApp from "./src/index";
import "./index.less";

//@ts-ignore
const loginOpt = process.env.LOGIN_OPTIONS as any;
const appKey = loginOpt.appKey;

export default {
  title: "IM UI KIT/示例",
};

const Primary: React.FC = () => {
  const loginInfo = {
    appkey: "", // 请填写你的appkey
    account: "", // 请填写你的account
    token: "", // 请填写你的token
    initOptions: {},
    otherOptions: {},
  };

  const handleLogout = () => {};
  return (
    <div className="im-app-example-wrapper">
      <IMApp
        appkey={loginInfo.appkey}
        account={loginInfo.account}
        token={loginInfo.token}
        initOptions={loginInfo.initOptions}
        otherOptions={loginInfo.otherOptions}
        onLogout={handleLogout}
      />
    </div>
  );
};

export { Primary };
