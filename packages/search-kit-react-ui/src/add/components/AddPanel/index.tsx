import { Popover } from 'antd'
import React, { useState } from 'react'
import AddList from '../AddList'
import { CommonIcon, useTranslation } from '@xkit-yx/common-ui'
export interface AddPanelProps {
  trigger: string // hover || focus || click
  onClick: (id: number) => void
  prefix?: string
}

const AddPanel: React.FC<AddPanelProps> = ({
  trigger,
  onClick,
  prefix = 'search',
}) => {
  const _prefix = `${prefix}-add-panel`

  const { t } = useTranslation()

  const [visible, setVisible] = useState(false)
  const handleVisibleChange = (newVisible: boolean) => {
    setVisible(newVisible)
  }
  const friend = {
    id: 0,
    icon: 'icon-tianjiahaoyou',
    content: t('addFriendText'),
    onClick: onClick,
  }
  const groupChat = {
    id: 1,
    icon: 'icon-chuangjianqunzu',
    content: t('createTeamText'),
    onClick: onClick,
  }

  const group = {
    id: 2,
    icon: 'icon-jiaruqunzu',
    content: t('joinTeamText'),
    onClick: onClick,
  }

  const props = {
    list: [friend, groupChat, group],
  }

  const content = (
    <div onClick={() => setVisible(false)}>
      <AddList {...props} prefix={prefix} />
    </div>
  )
  return (
    <div className={_prefix}>
      <Popover
        content={content}
        trigger={trigger}
        visible={visible}
        onVisibleChange={handleVisibleChange}
        placement="bottom"
      >
        <div className={`${_prefix}-btn`}>
          <CommonIcon
            className={`${_prefix}-btn-img`}
            type="icon-tianjiaanniu"
          />
        </div>
      </Popover>
    </div>
  )
}

export default AddPanel
