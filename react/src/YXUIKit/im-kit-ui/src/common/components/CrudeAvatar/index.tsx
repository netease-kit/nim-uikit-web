import React, { FC, useEffect, useMemo, useState } from 'react'
import { Avatar, Badge } from 'antd'
import { Storage } from '@xkit-yx/utils'
import { urls } from '../GroupAvatarSelect'

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

  useEffect(() => {
    const colorMap: { [key: number]: string } = {
      0: '#60CFA7',
      1: '#53C3F3',
      2: '#537FF4',
      3: '#854FE2',
      4: '#BE65D9',
      5: '#E9749D',
      6: '#F9B751',
    }
    const store = new Storage('localStorage', '__xkit__')
    const key = `avatarColor-${account}`
    let bgColor = store.get(key)
    if (!bgColor) {
      bgColor = colorMap[Math.floor(Math.random() * 7)]
      store.set(key, bgColor)
    }
    setBgColor(bgColor)
  }, [account])

  useEffect(() => {
    let webUrl = ''
    if (avatar) {
      setImgFailed(false)
      webUrl = appUrlMap[avatar]
    }
    setWebAvatar(webUrl ? webUrl : avatar)
  }, [avatar])

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

  return (
    <Badge
      dot={dot}
      count={count}
      color="red"
      overflowCount={99}
      showZero={false}
    >
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
    </Badge>
  )
}
