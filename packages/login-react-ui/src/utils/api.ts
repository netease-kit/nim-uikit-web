import { request as http, Storage, StorageInterface } from '@xkit-yx/utils'
import { ACCOUNTID_NAME_DEFAULT, TOKEN_NAME_DEFAULT } from '../constant'

const LOGIN_RES_DATA = 'LOGIN_RES_DATA'

type URLMap = {
  loginRegisterByCode: string
  getLoginSmsCode: string
  loginRegisterByToken?: string
  logout?: string
}

export interface IAPI {
  baseDomain: string
  appKey: string
  parentScope: string | number
  scope: string | number
  componentTag: number | string
  memoryMode?: 'localStorage' | 'sessionStorage' | 'memory'
  urlMap?: URLMap
}

let loginStorage: StorageInterface
let TOKEN_NAME = TOKEN_NAME_DEFAULT
let ACCOUNTID_NAME = ACCOUNTID_NAME_DEFAULT
let baseDomain = ''
let loginByCodeHeader = {}
let logoutHeader = {}
let loginByTokenHeader = {}
let urlMap: URLMap = {
  logout: '/userCenter/v1/auth/logout',
  loginRegisterByCode: '/userCenter/v1/auth/loginRegisterByCode',
  loginRegisterByToken: '/userCenter/v1/auth/loginByToken',
  getLoginSmsCode: '/userCenter/v1/auth/sendLoginSmsCode',
}

const request = async <T>({
  url,
  data,
  headers,
}: {
  url: string
  data?: any
  headers?: any
}): Promise<T> => {
  try {
    const res = await http<T>({
      url: `${baseDomain}${url}`,
      data,
      headers,
    })
    if (res.code === 200) {
      return res.data
    }
    if (res.code === 401) {
      // 没有登录，返回登录页
      loginStorage.remove(TOKEN_NAME)
      loginStorage.remove(ACCOUNTID_NAME)
      throw res
    }
    loginStorage.remove(TOKEN_NAME)
    loginStorage.remove(ACCOUNTID_NAME)
    throw res
  } catch (err) {
    return Promise.reject(err)
  }
}

export const initRequst = (data: IAPI) => {
  baseDomain = data.baseDomain
  loginByCodeHeader = {
    appKey: data.appKey,
    parentScope: data.parentScope || 4,
    scope: data.scope || 9,
  }
  // 获取存储方式
  loginStorage = new Storage(data.memoryMode, 'login-ui-kit')
  // 获取用户信息存储字段
  TOKEN_NAME = TOKEN_NAME_DEFAULT + '_' + data.componentTag
  ACCOUNTID_NAME = ACCOUNTID_NAME_DEFAULT + '_' + data.componentTag
  const accessToken = loginStorage.get(TOKEN_NAME)
  const accountId = loginStorage.get(ACCOUNTID_NAME)
  loginByTokenHeader = { ...loginByCodeHeader, accessToken }
  logoutHeader = { ...loginByCodeHeader, accessToken, accountId }
  data.urlMap && (urlMap = data.urlMap)
}

/**
 * 获取验证码
 * @param {string} mobile - 手机号
 */
export const getLoginSmsCode = (data: { mobile: string }) =>
  request<{
    isFirstRegister: string
    msg: string
  }>({
    url: urlMap.getLoginSmsCode,
    headers: loginByCodeHeader,
    data,
  }).then((res) => {
    return res
  })

export const loginRegisterByCode = (data: {
  mobile: string
  smsCode: string
}) =>
  request<{
    accountId: string
    accessToken: string
  }>({
    url: urlMap.loginRegisterByCode,
    headers: loginByCodeHeader,
    data,
  }).then((res) => {
    loginStorage.set(LOGIN_RES_DATA, res)
    loginStorage.set(TOKEN_NAME, res.accessToken)
    loginStorage.set(ACCOUNTID_NAME, res.accountId)
    return res
  })

export const loginRegisterByToken = () => {
  if (urlMap.loginRegisterByToken) {
    return request<{
      accountId: string
      accessToken: string
    }>({
      url: urlMap.loginRegisterByToken,
      headers: loginByTokenHeader,
      data: {
        accountId: loginStorage.get(ACCOUNTID_NAME),
      },
    }).then((res) => {
      loginStorage.set(TOKEN_NAME, res.accessToken)
      loginStorage.set(ACCOUNTID_NAME, res.accountId)
      return res
    })
  } else {
    if (loginStorage.get(TOKEN_NAME) && loginStorage.get(LOGIN_RES_DATA)) {
      return Promise.resolve(loginStorage.get(LOGIN_RES_DATA))
    } else {
      return Promise.reject()
    }
  }
}

export const logout = () => {
  if (urlMap.logout) {
    return request<{
      code: number
      msg: string
    }>({
      url: urlMap.logout,
      headers: logoutHeader,
    }).then((res) => {
      loginStorage.remove(TOKEN_NAME)
      loginStorage.remove(ACCOUNTID_NAME)
      return res
    })
  } else {
    loginStorage.remove(TOKEN_NAME)
    loginStorage.remove(ACCOUNTID_NAME)
    return Promise.resolve()
  }
}
