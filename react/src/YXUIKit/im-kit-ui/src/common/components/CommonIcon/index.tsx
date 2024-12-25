// import { createFromIconfontCN } from '@ant-design/icons'

// const CommonIcon = createFromIconfontCN({
//   scriptUrl: [
//     '//yx-web-nosdn.netease.im/sdk-release/yunxun-imweb-iconfont.js',
//     '//at.alicdn.com/t/c/font_3429868_blvaz7v7n6p.js',
//   ], // 在 iconfont.cn 上生成
// })

// export default CommonIcon

import React from 'react'
import { createFromIconfontCN } from '@ant-design/icons'
import { useStateContext } from '../../hooks/useStateContext'

interface CommonIconProps {
  type: string
  className?: string
  style?: React.CSSProperties
}

const CommonIcon: React.FC<CommonIconProps> = ({ type, className, style }) => {
  const { localOptions } = useStateContext()
  const iconfontUrl = localOptions.iconfontUrl || '' // 假设 iconfontUrl 是一个字符串而不是数组

  const Icon = createFromIconfontCN({
    scriptUrl: [
      'https://yx-web-nosdn.netease.im/sdk-release/yunxun-imweb-iconfont.js',
      'https://at.alicdn.com/t/c/font_3429868_blvaz7v7n6p.js',
      ...iconfontUrl,
    ],
  })

  return <Icon style={style} type={type} className={className} /> // 假设您有一个图标类型来传递
}

export default CommonIcon
