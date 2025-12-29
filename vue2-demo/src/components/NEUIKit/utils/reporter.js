import { EventTracking } from "@xkit-yx/utils";
import sdkPkg from "nim-web-sdk-ng/package.json";
import { IM_UIKIT_VERSION } from "./constants";

export const trackInit = (component, appkey) => {
  const eventTracking = new EventTracking({
    appKey: appkey,
    version: IM_UIKIT_VERSION,
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
