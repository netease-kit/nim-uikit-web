import React, { FC, useEffect, useMemo, useState } from 'react'
import { Avatar, Badge } from 'antd'
import { urls } from '../GroupAvatarSelect'
import { getAvatarBackgroundColor } from '../../../utils'

export interface CrudeAvatarProps {
  account: string
  avatar?: string
  nick?: string
  size?: number
  icon?: React.ReactNode
  count?: number
  dot?: boolean
}

// 原生端的群组头像，在 web 显示不了，需要做一下映射。后面等移动端上线后统一用下面的。
const appUrlMap = {
  'https://s.netease.im/safe/ABg8YjWQWvcqO6sAAAAAAAAAAAA?_im_url=1': urls[0],
  'https://s.netease.im/safe/ABg8YjmQWvcqO6sAAAAAAAABAAA?_im_url=1': urls[1],
  'https://s.netease.im/safe/ABg8YjyQWvcqO6sAAAAAAAABAAA?_im_url=1': urls[2],
  'https://s.netease.im/safe/ABg8YkCQWvcqO6sAAAAAAAABAAA?_im_url=1': urls[3],
  'https://s.netease.im/safe/ABg8YkSQWvcqO6sAAAAAAAABAAA?_im_url=1': urls[4],
}

export const CrudeAvatar: FC<CrudeAvatarProps> = ({
  nick,
  account,
  avatar,
  size = 36,
  icon,
  count = 0,
  dot = false,
}) => {
  const [imgFailed, setImgFailed] = useState(false)
  const [bgColor, setBgColor] = useState('')
  const [webAvatar, setWebAvatar] = useState<string | void>()

  const text = useMemo(() => {
    // 头像不用随备注而改变，产品需求
    return (nick || account || '').slice(-2)
  }, [nick, account])

  const avatarStyle = useMemo(() => {
    if (webAvatar && !imgFailed) {
      return {
        verticalAlign: 'middle',
      }
    }

    return {
      backgroundColor: bgColor,
      verticalAlign: 'middle',
    }
  }, [webAvatar, imgFailed, bgColor])

  useEffect(() => {
    try {
      /**
       * 原实现方案，改为和移动端统一方案
       const store = new Storage('localStorage', '__xkit__')
        const key = `avatarColor-${account}`
        let bgColor = store.get(key)

        if (!bgColor) {
          // 此处计算方式待优化
          bgColor = colorMap[Math.floor(Math.random() * 7)]
          store.set(key, bgColor)
        }
       */

      const bgColor = getAvatarBackgroundColor(account)

      setBgColor(bgColor)
    } catch (error) {
      console.log('CrudeAvatar avatarColor: ', error)
    }
  }, [account])

  useEffect(() => {
    let webUrl = ''

    if (avatar) {
      setImgFailed(false)
      webUrl = appUrlMap[avatar]
    }

    setWebAvatar(webUrl ? webUrl : avatar)
  }, [avatar])

  return (
    <Badge
      dot={dot}
      count={count}
      color="red"
      overflowCount={99}
      showZero={false}
    >
      {webAvatar ? (
        <Avatar
          style={avatarStyle}
          alt={text}
          src={webAvatar}
          size={size}
          icon={icon}
          onError={() => {
            setImgFailed(true)
            return true
          }}
        >
          {text}
        </Avatar>
      ) : (
        <div
          style={{
            ...avatarStyle,
            width: size + 'px',
            height: size + 'px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${size / 2.5}px`,
            color: '#fff',
          }}
        >
          {text}
        </div>
      )}
    </Badge>
  )
}
