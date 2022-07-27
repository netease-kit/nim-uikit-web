import React from 'react'

interface ILoginContext {
  success?: (res: any) => void // 登录成功回调
  fail?: (error: any) => void // 登录失败回调
}

const LoginContext = React.createContext<ILoginContext>({})

export default LoginContext
