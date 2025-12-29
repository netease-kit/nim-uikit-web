import { EventTracking } from "@xkit-yx/utils";
import sdkPkg from "nim-web-sdk-ng/package.json";

export const trackInit = (component, appkey) => {
  const eventTracking = new EventTracking({
    appKey: appkey,
    version: "10.0.0",
    component: component,
    imVersion: sdkPkg.version,
    platform: "WEB",
    channel: "netease",
    os: "",
    framework: "",
    language: "Vue2",
    container: "PC",
  });
  eventTracking.track("init", "");
};
