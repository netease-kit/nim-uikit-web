import IMApp from "../components/IMApp";

export default function HomePage() {
  const initOptions = {
    appkey: "", // 请填写你的appkey
    account: "", // 请填写你的account
    token: "", // 请填写你的token
  };
  return <IMApp {...initOptions}></IMApp>;
}
