import React, { FC } from 'react'
import '../index.less'
import { callTypeMap, t } from '../util'

interface IProps {
  handleCall: (callType: string) => void
}
const Call: FC<IProps> = ({ handleCall }) => {
  return (
    <div>
      <div
        onClick={() => handleCall(callTypeMap['audio'])}
        className="calling-item"
      >
        <i className="calling-item-icon iconfont icon-yuyin8" />
        <span>{t('voiceCallText')}</span>
      </div>
      <div
        onClick={() => handleCall(callTypeMap['vedio'])}
        className="calling-item"
      >
        <i className="calling-item-icon iconfont icon-shipin8" />
        <span>{t('vedioCallText')}</span>
      </div>
    </div>
  )
}

export default Call
