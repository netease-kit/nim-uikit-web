// 登录相关 API 调用
const baseUrl = 'https://yiyong-user-center.netease.im'

const loginByCodeHeader = {
  'Content-Type': 'application/json',
  'appKey': '3e215d27b6a6a9e27dad7ef36dd5b65c',
  'parentScope': 2,
  'scope': 7
}

const urlMap = {
  getLoginSmsCode: '/userCenter/v1/auth/sendLoginSmsCode',
  loginRegisterByCode: '/userCenter/v1/auth/loginRegisterByCode',
  loginRegisterByToken: '/userCenter/v1/auth/loginByToken',
  logout: '/userCenter/v1/auth/logout'
}

// 类型定义
export interface LoginSmsCodeRes {
  isFirstRegister: boolean
}

export interface LoginRegisterByCodeRes {
  accessToken: string
  imAccid: string
  imToken: string
}

// 获取登录验证码
export const getLoginSmsCode = (data: {
  mobile: string
}): Promise<LoginSmsCodeRes> => {
  const url = baseUrl + urlMap.getLoginSmsCode

  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: 'POST',
      header: loginByCodeHeader,
      data,
      success: (res: any) => {
        if (res.data.code === 200) {
          resolve(res.data.data as LoginSmsCodeRes)
        } else {
          reject(res.data)
        }
      },
      fail: (error) => {
        reject(error)
      }
    })
  })
}

// 验证码登录
export const loginRegisterByCode = (data: {
  mobile: string
  smsCode: string
}): Promise<LoginRegisterByCodeRes> => {
  const url = baseUrl + urlMap.loginRegisterByCode

  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: 'POST',
      header: loginByCodeHeader,
      data,
      success: (res: any) => {
        if (res.data.code === 200) {
          resolve(res.data.data as LoginRegisterByCodeRes)
        } else {
          reject(res.data)
        }
      },
      fail: (error) => {
        reject(error)
      }
    })
  })
}

// 工具函数：验证手机号
export const validateMobile = (mobile: string): boolean => {
  const mobileReg = /^1[3-9]\d{9}$/
  return mobileReg.test(mobile)
}

// 工具函数：验证验证码
export const validateSmsCode = (code: string): boolean => {
  const codeReg = /^\d{4}$/
  return codeReg.test(code)
}