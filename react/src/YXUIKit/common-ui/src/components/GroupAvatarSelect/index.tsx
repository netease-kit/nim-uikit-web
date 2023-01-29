import React, { FC, useMemo, useState, useEffect } from 'react'
import { Tooltip, Button } from 'antd'
import { CrudeAvatar, CrudeAvatarProps } from '../CrudeAvatar'
export interface GroupAvatarSelectProps extends CrudeAvatarProps {
  onSelect: (url: string) => void
  prefix?: string
}

export const urls = [
  'https://yx-web-nosdn.netease.im/common/2425b4cc058e5788867d63c322feb7ac/groupAvatar1.png',
  'https://yx-web-nosdn.netease.im/common/62c45692c9771ab388d43fea1c9d2758/groupAvatar2.png',
  'https://yx-web-nosdn.netease.im/common/d1ed3c21d3f87a41568d17197760e663/groupAvatar3.png',
  'https://yx-web-nosdn.netease.im/common/e677d8551deb96723af2b40b821c766a/groupAvatar4.png',
  'https://yx-web-nosdn.netease.im/common/fd6c75bb6abca9c810d1292e66d5d87e/groupAvatar5.png',
]

export const GroupAvatarSelect: FC<GroupAvatarSelectProps> = ({
  onSelect,
  prefix = 'common',
  ...props
}) => {
  const [avatar, setAvatar] = useState<string | undefined>(undefined)

  const _prefix = `${prefix}-group-avatar-select`

  const titleRenderer = useMemo(() => {
    return (
      <div className={`${_prefix}-content`}>
        {urls.map((url) => (
          <Button
            key={url}
            onClick={() => {
              setAvatar(url)
              onSelect(url)
            }}
            type="text"
            className={`${_prefix}-btn`}
          >
            <img className={`${_prefix}-btn-img`} src={url} />
          </Button>
        ))}
      </div>
    )
  }, [onSelect, _prefix])

  useEffect(() => {
    setAvatar(props.avatar)
  }, [props.avatar])

  return (
    <Tooltip
      title={titleRenderer}
      trigger={['click']}
      color="#fff"
      overlayClassName={`${_prefix}-wrapper`}
      placement="bottom"
      arrowPointAtCenter
    >
      <div className={`${_prefix}-main`}>
        <CrudeAvatar {...props} avatar={avatar} />
      </div>
    </Tooltip>
  )
}
