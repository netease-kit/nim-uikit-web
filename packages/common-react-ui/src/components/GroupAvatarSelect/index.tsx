import React, { FC, useMemo, useState, useEffect } from 'react'
import { Tooltip, Button } from 'antd'
import { CrudeAvatar, CrudeAvatarProps } from '../CrudeAvatar'
export interface GroupAvatarSelectProps extends CrudeAvatarProps {
  onSelect: (url: string) => void
  prefix?: string
}

export const urls = [
  'https://yx-web-nosdn.netease.im/common/1c12d39e5a00f6e9e37cd7c110d8b4f0/头像1.png',
  'https://yx-web-nosdn.netease.im/common/0602f7ead8e878b2beb4e3c17aa32584/头像2.png',
  'https://yx-web-nosdn.netease.im/common/0782789dabb67f098fa4a80aab4194f6/头像3.png',
  'https://yx-web-nosdn.netease.im/common/4779f3843a6c67013b3f546a7343e1df/头像4.png',
  'https://yx-web-nosdn.netease.im/common/415cabb01d1931282fe5ee28fc50251a/头像5.png',
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
            <img src={url} />
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
