import React, { FC, useEffect, useMemo, useState } from 'react'
import { Avatar, Badge } from 'antd'
import { UserNameCard } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/UserServiceInterface'
import { Storage } from '@xkit-yx/utils'

export interface CrudeAvatarProps
  extends Pick<UserNameCard, 'account' | 'avatar' | 'nick'> {
  size?: number
  icon?: React.ReactNode
  count?: number
  dot?: boolean
}

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
const key = 'avatarColor'
let bgColor = store.get(key)

if (!bgColor) {
  bgColor = colorMap[Math.floor(Math.random() * 7)]
  store.set(key, bgColor)
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

  const text = useMemo(() => {
    return (nick || account || '').slice(-2)
  }, [nick, account])

  useEffect(() => {
    if (avatar) {
      setImgFailed(false)
    }
  }, [avatar])

  const avatarStyle = useMemo(() => {
    if (avatar && !imgFailed) {
      return {
        verticalAlign: 'middle',
      }
    }
    return {
      backgroundColor: bgColor,
      verticalAlign: 'middle',
    }
  }, [avatar, imgFailed])

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
        src={avatar}
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
