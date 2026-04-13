import axios, { AxiosResponse } from "axios";
import logger from "../utils/logger";

export interface ICommonRes {
  code: number;
  msg: string;
  requestId: string;
  data: any;
}

export interface ISendSmsCodeRes extends ICommonRes {
  isFirstRegister: boolean;
}

export interface ISmsLoginRes extends ICommonRes {
  user: string;
  accessToken: string;
  imAccid: string;
  imToken: string;
  avatar: string;
  avRoomUid: string;
  nickname: string;
  accountId: string;
}

export const urlMap = {
  sendSmsCode: "/userCenter/v1/auth/sendLoginSmsCode",
  smsLogin: "/userCenter/v1/auth/loginRegisterByCode",
};

const Request = {
  headers: {},

  baseDomain: "",

  setHeaders(headers: any) {
    Request.headers = headers;
  },

  setBaseDomain(baseDomain: string) {
    Request.baseDomain = baseDomain;
  },

  request: async <T>({
    method,
    url,
    data,
    domain,
  }: {
    method: "get" | "post";
    url: string;
    data?: any;
    domain?: string;
  }): Promise<T> => {
    try {
      logger.log(`request ${url}`, data);
      const baseDomain = domain
        ? domain
        : process.env.ENV === "mock"
        ? "/api"
        : Request.baseDomain;

      const res: AxiosResponse<T & ICommonRes> = await axios({
        method,
        url: `${baseDomain}${url}`,
        data,
        headers: Request.headers,
      });
      if (res.data.code !== 200) {
        logger.error(`request fail ${url}`, data, res);
        return Promise.reject(res.data);
      }
      logger.log(`request success ${url}`, data, res);
      return res.data.data;
    } catch (err) {
      logger.error(`request fail ${url}`, data, err);
      return Promise.reject(err);
    }
  },

  sendSmsCode: (mobile: string) => {
    return Request.request<ISendSmsCodeRes>({
      method: "post",
      url: urlMap.sendSmsCode,
      data: {
        mobile,
      },
    });
  },

  smsLogin: ({ mobile, code }: { mobile: string; code: string }) => {
    return Request.request<ISmsLoginRes>({
      method: "post",
      url: urlMap.smsLogin,
      data: {
        mobile,
        smsCode: code,
      },
    });
  },
};

export default Request;
