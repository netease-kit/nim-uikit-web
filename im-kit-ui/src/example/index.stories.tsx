import React from "react";
import IMApp from "./src/index";
import "./index.less";

export default {
  title: "IM UI KIT/示例",
};

const Primary: React.FC = () => {
  const loginInfo = {
    appkey: "", //您在云信控制台注册的appkey
    account: "", //云信控制台上的account
    token: "",

    otherOptions: {},
  };

  const handleLogout = () => {};
  return (
    <div className="im-app-example-wrapper">
      <IMApp
        appkey={loginInfo.appkey}
        account={loginInfo.account}
        token={loginInfo.token}
        otherOptions={loginInfo.otherOptions}
        onLogout={handleLogout}
      />
    </div>
  );
};

export { Primary };
