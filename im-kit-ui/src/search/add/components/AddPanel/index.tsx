import { Popover } from 'antd'
import React, { useMemo, useState } from 'react'
import AddList, { AddListProps } from '../AddList'
import { CommonIcon, useStateContext, useTranslation } from '../../../../common'
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

  const { localOptions } = useStateContext()

  const props: AddListProps = useMemo(() => {
    return {
      list: [
        {
          scene: 'addFriend' as PanelScene,
          icon: 'icon-tianjiahaoyou',
          content: t('addFriendText'),
          onClick,
        },
        {
          scene: 'createTeam' as PanelScene,
          icon: 'icon-chuangjianqunzu',
          content: t('createTeamText'),
          onClick,
        },
        {
          scene: 'createDiscussion' as PanelScene,
          icon: 'icon-chuangjianqunzu',
          content: t('createDiscussionText'),
          onClick,
        },
        {
          scene: 'joinTeam' as PanelScene,
          icon: 'icon-jiaruqunzu',
          content: t('joinTeamText'),
          onClick,
        },
      ].filter((item) => {
        if (!localOptions.enableTeam) {
          return item.scene === 'addFriend'
        }

        return true
      }),
      prefix,
    }
  }, [prefix, onClick, localOptions.enableTeam, t])

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
        overlayClassName={`${_prefix}-popover`}
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
