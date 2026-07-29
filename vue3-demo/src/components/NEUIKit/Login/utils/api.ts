import { APP_KEY } from "../../utils/constants";
const baseUrl = import.meta.env.VITE_USER_CENTER_BASE_URL;

const loginByCodeHeader = {
  appKey: APP_KEY,
  parentScope: 2,
  scope: 7,
};
const urlMap = {
  getLoginSmsCode: "/userCenter/v1/auth/sendLoginSmsCode",
  loginRegisterByCode: "/userCenter/v1/auth/loginRegisterByCode",
  loginRegisterByToken: "/userCenter/v1/auth/loginByToken",
  logout: "/userCenter/v1/auth/logout",
};
type LoginSmsCodeRes = {
  isFirstRegister: boolean;
};
export const getLoginSmsCode = (data: {
  mobile: string;
}): Promise<LoginSmsCodeRes> => {
  const url = baseUrl + urlMap.getLoginSmsCode;

  return fetch(url, {
    method: "POST",
    //@ts-ignore
    headers: {
      "Content-Type": "application/json",
      ...loginByCodeHeader,
    },
    body: JSON.stringify(data),
  }).then(async (response) => {
    const responseData = await response.json();
    if (responseData.code !== 200) {
      throw responseData;
    }
    return responseData.data as LoginSmsCodeRes;
  });
};

export const loginRegisterByCode = (data: {
  mobile: string;
  smsCode: string;
}): Promise<LoginRegisterByCodeRes> => {
  const url = baseUrl + urlMap.loginRegisterByCode;

  return fetch(url, {
    method: "POST",
    //@ts-ignore
    headers: {
      "Content-Type": "application/json",
      ...loginByCodeHeader,
    },
    body: JSON.stringify(data),
  }).then(async (response) => {
    const responseData = await response.json();
    if (responseData.code !== 200) {
      throw responseData;
    }
    return responseData.data as LoginRegisterByCodeRes;
  });
};

type LoginRegisterByCodeRes = {
  accessToken: string;
  imAccid: string;
  imToken: string;
};
