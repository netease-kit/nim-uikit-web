import IMApp from "../components/IMApp";
import React from "react";
export default function HomePage() {
  const initOptions = {
    appkey: "", //您在云信控制台注册的appkey
    account: "", //云信控制台上的account
    token: "",
  };
  return <IMApp {...initOptions}></IMApp>;
}
