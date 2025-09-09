/// <reference types="vite/client" />
import { NIM } from 'nim-web-sdk-ng/dist/esm/nim'
import RootStore from "@xkit-yx/im-store-v2";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $NIM: V2NIM;
    $UIKitStore: RootStore;
  }
}
