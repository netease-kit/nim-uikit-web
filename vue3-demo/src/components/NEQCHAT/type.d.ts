import V2NIM from "nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK";

declare global {
  interface Window {
    V2NIM: typeof V2NIM;
    qchat: InstanceType<typeof V2NIM> | null;
  }
}

declare module "*.css";
declare module "*.less";
declare module "*.png";
