import React, { useEffect, useState } from 'react'
import { Button } from 'antd'
import LoginForm from './form'
const logoUrl = require('../../assets/logo.png')
const CompanyNameUrl = require('../../assets/company_name.png')

const Login: React.FC = () => {
  const [loginFormVisile, setLoginFormVisile] = useState(false)
  return (
    <div className="login">
      {loginFormVisile ? (
        <LoginForm handleBack={() => setLoginFormVisile(false)} />
      ) : (
        <div className="login-center">
          <div className="login-img-wrap">
            <img className="login-logo" src={logoUrl} alt="" />
            <img className="company-name" src={CompanyNameUrl} alt="" />
          </div>
          <Button
            className="login-btn primary"
            onClick={() => setLoginFormVisile(true)}
            type="primary"
            block
          >
            注册/登录
          </Button>
          <div className="login-img-small">
            <img className="login-logo" src={logoUrl} alt="" />
            <img className="company-name" src={CompanyNameUrl} alt="" />
          </div>
        </div>
      )}
    </div>
  )
}

export default Login
