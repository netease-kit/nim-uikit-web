import React from 'react'
import { useTranslation } from '../../hooks/useTranslation'

export interface WelcomeProps {
  prefix?: string
}

export const Welcome: React.FC<WelcomeProps> = ({ prefix = 'common' }) => {
  const _prefix = `${prefix}-welcome`

  const { t } = useTranslation()

  return (
    <div className={`${_prefix}-wrap`}>
      <img src="https://yx-web-nosdn.netease.im/common/630b48dc545af0633aaaa53bbd65cbb0/欢迎使用云信.png" />
      {t('welcomeText')}
    </div>
  )
}
