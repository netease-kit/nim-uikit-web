import React from 'react'
import { Login, Session } from './index'
import './style'

export default {
  title: 'login-react-ui/Demo',
}

const baseDomain = 'https://yiyong-user-center-qa.netease.im/'
const appKey = '45c6af3c98409b18a84451215d0bdd6e'
const parentScope = 2
const scope = 7

export const Primary = () => {
  const props = {
    autoLogin: true,
    componentTag: 'call',
    baseDomain,
    appKey,
    parentScope,
    scope,
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
