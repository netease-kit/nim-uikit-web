/// <reference types="vite/client" />
import type { V2NIM } from "nim-web-sdk-ng/dist/esm/nim";
import type RootStore from "@xkit-yx/im-store-v2";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $NIM: V2NIM;
    $UIKitStore: RootStore;
  }
}

declare global {
  interface Window {
    nim: any;
    qchat: any;
  }
}
