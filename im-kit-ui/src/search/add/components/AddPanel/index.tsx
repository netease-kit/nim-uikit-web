import { Popover } from 'antd'
import React, { useState } from 'react'
import AddList, { AddListProps } from '../AddList'
import { CommonIcon, useTranslation } from '../../../../common'
import { PanelScene } from '../../Container'

export interface AddPanelProps {
  trigger: string // hover || focus || click
  onClick: (scene: PanelScene) => void
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

  const props: AddListProps = {
    list: [
      {
        scene: 'addFriend',
        icon: 'icon-tianjiahaoyou',
        content: t('addFriendText'),
        onClick,
      },
      {
        scene: 'createTeam',
        icon: 'icon-chuangjianqunzu',
        content: t('createTeamText'),
        onClick,
      },
      {
        scene: 'joinTeam',
        icon: 'icon-jiaruqunzu',
        content: t('joinTeamText'),
        onClick,
      },
    ],
    prefix,
  }

  const content = (
    <div onClick={() => setVisible(false)}>
      <AddList {...props} />
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
