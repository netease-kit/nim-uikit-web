import React from 'react'
import { Login, Session } from './index'
import './style'

export default {
  title: 'login-react-ui/Demo',
}

export const Primary = () => {
  const props = {
    autoLogin: true,
    componentTag: 'call',
    ...(process.env.LOGIN_OPTIONS as any),
    success: (res) => {
      console.log('登录成功的回调', res)
    },
    fail: () => {
      console.log('登录失败的回调')
    },
  }
  return (
    <Session {...props} memoryMode="localStorage">
      <Login />
    </Session>
  )
}
