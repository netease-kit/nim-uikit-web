const { V2NIMConst, default: V2NIM } = require("./libs/NIM_MINIAPP_SDK.js");
const { default: RootStore } = require("./libs/store.js");

// 类型定义
interface V2NIMMessage {
  msg: any;
  conversationId: string;
  serverExtension?: Record<string, unknown>;
}

// 扩展IAppOption接口
interface IAppOptionExtended extends IAppOption {
  checkLoginStatus(): void;
  initIMLogin(imAccid: string, imToken: string): void;
}

const APP_KEY = "3e215d27b6a6a9e27dad7ef36dd5b65c";
const LOGIN_BY_PHONE_CODE = true;
const ACCID = "your_accid";
const TOKEN = "your_token";

// app.ts
App<IAppOptionExtended>({
  globalData: {
    nim: null,
    store: null,
  },
  onLaunch() {
    const nim = V2NIM.getInstance(
      {
        appkey: APP_KEY,
        needReconnect: true,
        debugLevel: "debug",
        apiVersion: "v2",
        enableV2CloudConversation: wx.getStorageSync('enableV2CloudConversation') === 'on' || false,
      },
      {
        V2NIMLoginServiceConfig: {
          lbsUrls: ["https://lbs.netease.im/lbs/wxwebconf.jsp"],
          linkUrl: "wlnimsc0.netease.im",
        },
        reporterConfig: {
          enableCompass: false,
          compassDataEndpoint: 'https://statistic.live.126.net',
          isDataReportEnable: false
        },
      }
    );

    // 初始化store
    const store = new RootStore(
      // @ts-ignore
      nim,
      {
        // 添加好友是否需要验证
        addFriendNeedVerify: false,
        // 是否需要显示 p2p 消息、p2p会话列表消息已读未读，默认 false
        p2pMsgReceiptVisible: true,
        // 是否需要显示群组消息已读未读，默认 false
        teamMsgReceiptVisible: true,
        // 群组被邀请模式，默认需要验证
        teamAgreeMode:
          V2NIMConst.V2NIMTeamAgreeMode.V2NIM_TEAM_AGREE_MODE_NO_AUTH,
        // 发送消息前回调, 可对消息体进行修改，添加自定义参数
        sendMsgBefore: async (options: {
          msg: V2NIMMessage;
          conversationId: string;
          serverExtension?: Record<string, unknown>;
        }) => {
          return { ...options };
        },
      },
      "H5"
    );

    // 将nim、store挂载到全局
    this.globalData.nim = nim;
    this.globalData.store = store;

    if (!LOGIN_BY_PHONE_CODE) {
      // OPTION A: 直接登录
      this.initIMLogin(ACCID, TOKEN);
    }else{
      // OPTION B: 通过登录页进行登录
      this.checkLoginStatus();
    }

  },

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    try {
      const imAccid = wx.getStorageSync('imAccid');
      const imToken = wx.getStorageSync('imToken');
      
      if (!imAccid || !imToken) {
        // 未登录，跳转到登录页
        wx.reLaunch({
          url: '/pages/login/index'
        });
        return;
      }

      // 有登录信息，尝试自动登录
      this.initIMLogin(imAccid, imToken);
    } catch (error) {
      console.error('检查登录状态失败:', error);
      // 出错时跳转到登录页
      wx.reLaunch({
        url: '/pages/login/index'
      });
    }
  },

  /**
   * 初始化IM登录
   */
  initIMLogin(imAccid: string, imToken: string) {
    const nim = this.globalData.nim;
    
    if (!nim) {
      console.error('NIM实例未初始化');
      wx.reLaunch({
        url: '/pages/login/index'
      });
      return;
    }

    nim.V2NIMLoginService.login(imAccid, imToken).then(() => {
      // 登录成功后跳转到会话列表页面
      wx.reLaunch({
        url: '/pages/conversation/conversation-list/index'
      });
    }).catch((error: any) => {
      console.error('IM自动登录失败:', error);
      // 登录失败，清除本地存储并跳转到登录页
      wx.removeStorageSync('imAccid');
      wx.removeStorageSync('imToken');
      wx.removeStorageSync('accessToken');
      wx.reLaunch({
        url: '/pages/login/index'
      });
    });
  }
})