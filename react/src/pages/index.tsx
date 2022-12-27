import IMApp, { IMAppProps } from "../components/IMApp";

export default function HomePage() {
  const initOptions: IMAppProps = {
    appkey: "", // 请填写你的appkey
    account: "", // 请填写你的account
    token: "", // 请填写你的token
    sdkVersion: 1, // 请填写你的使用的sdk版本
  };
  return <IMApp {...initOptions}></IMApp>;
}
