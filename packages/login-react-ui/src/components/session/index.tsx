import React, { useEffect } from 'react'
import { initRequst, IAPI, loginRegisterByToken } from '../../utils/api'
import LoginContext from '../context'

export interface SessionProps extends IAPI {
  autoLogin?: boolean
  redirectPath?: string // 重定向地址
  success?: (res: any) => void // 登录成功回调
  fail?: (error: any) => void // 登录失败回调
  theme?: {
    // UI相关设置，例如icon、文案等，这期暂无，预留字段
    [key: string]: any
  }
}

const Session: React.FC<SessionProps> = (props) => {
  const { autoLogin, redirectPath, success, fail, theme, children, ...rest } =
    props
  useEffect(() => {
    initRequst(rest)
    // 自动登录
    if (autoLogin) {
      loginRegisterByToken()
        .then((res) => {
          success && success(res)
        })
        .catch((err) => {
          fail && fail(err)
        })
    }
  }, [])

  return (
    <LoginContext.Provider value={{ success, fail }}>
      {children}
    </LoginContext.Provider>
  )
}

export default Session
