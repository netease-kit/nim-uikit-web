import { APP_KEY } from "../../utils/constants";
const baseUrl = "https://yiyong-user-center-qa.netease.im";
// const baseUrl = "https://yiyong-user-center.netease.im";
// // @ts-ignore
// BUILD_ENV === 'prod'
//   ? 'https://yiyong-user-center.netease.im/'
//   : 'https://yiyong-user-center-qa.netease.im'

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
export const getLoginSmsCode = (data) => {
  const url = baseUrl + urlMap.getLoginSmsCode;

  return fetch(url, {
    method: "POST",
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
    return responseData.data;
  });
};

export const loginRegisterByCode = (data) => {
  const url = baseUrl + urlMap.loginRegisterByCode;

  return fetch(url, {
    method: "POST",
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
    return responseData.data;
  });
};
