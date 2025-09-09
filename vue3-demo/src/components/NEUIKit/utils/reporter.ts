import { EventTracking } from "@xkit-yx/utils";
import sdkPkg from "nim-web-sdk-ng/package.json";

export const trackInit = (
  component: "ChatUIKit" | "ContactUIKit" | "ConversationUIKit" | "SearchUIKit",
  appKey: string
): void => {
  const eventTracking = new EventTracking({
    appKey: appKey,
    version: "10.0.0",
    component: component,
    imVersion: sdkPkg.version,
    platform: "WEB",
    channel: "netease",
    os: "",
    framework: "",
    language: "Vue3",
    container: "PC",
  });
  eventTracking.track("init", "");
};
