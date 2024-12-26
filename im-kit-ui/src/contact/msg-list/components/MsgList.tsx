import React, { FC } from 'react'
import { useStateContext, useTranslation } from '../../../common'
import { MsgItem, TMsgItem, TMsgItemType } from './MsgItem'
import { Spin, Empty } from 'antd'
import {
  V2NIMFriendAddApplicationForUI,
  V2NIMTeamJoinActionInfoForUI,
} from '@xkit-yx/im-store-v2/dist/types/types'

export interface MsgListProps {
  msgs: TMsgItem[]
  listLoading?: boolean
  applyTeamLoaidng?: boolean
  teamInviteLoading?: boolean
  applyFriendLoading?: boolean
  onAcceptApplyTeamClick?: (actionInfo: V2NIMTeamJoinActionInfoForUI) => void
  onRejectApplyTeamClick?: (actionInfo: V2NIMTeamJoinActionInfoForUI) => void
  onAcceptTeamInviteClick?: (actionInfo: V2NIMTeamJoinActionInfoForUI) => void
  onRejectTeamInviteClick?: (actionInfo: V2NIMTeamJoinActionInfoForUI) => void
  onAcceptApplyFriendClick?: (
    application: V2NIMFriendAddApplicationForUI
  ) => void
  onRejectApplyFriendClick?: (
    application: V2NIMFriendAddApplicationForUI
  ) => void
  afterSendMsgClick?: () => void
  renderMsgListHeader?: () => JSX.Element
  renderMsgListEmpty?: () => JSX.Element
  prefix?: string
  commonPrefix?: string
}

export const MsgList: FC<MsgListProps> = ({
  msgs,
  listLoading = false,
  applyTeamLoaidng = false,
  teamInviteLoading = false,
  applyFriendLoading = false,
  onAcceptApplyTeamClick,
  onRejectApplyTeamClick,
  onAcceptTeamInviteClick,
  onRejectTeamInviteClick,
  onAcceptApplyFriendClick,
  onRejectApplyFriendClick,
  afterSendMsgClick,
  renderMsgListHeader,
  renderMsgListEmpty,
  prefix = 'contact',
  commonPrefix = 'common',
}) => {
  const _prefix = `${prefix}-msg`

  const { store } = useStateContext()

  const { t } = useTranslation()

  return (
    <div className={`${_prefix}-wrapper`}>
      <div className={`${_prefix}-title`}>
        {renderMsgListHeader ? renderMsgListHeader() : t('msgListTitle')}
      </div>
      {listLoading ? (
        <Spin />
      ) : !msgs.length ? (
        renderMsgListEmpty ? (
          renderMsgListEmpty()
        ) : (
          <Empty style={{ marginTop: 10 }} />
        )
      ) : (
        <div className={`${_prefix}-content`}>
          {msgs.map((item) => (
            <MsgItem
              key={
                item.messageType === TMsgItemType.FRIEND
                  ? store.sysMsgStore.createFriendApplyMsgKey(
                      item as V2NIMFriendAddApplicationForUI
                    )
                  : store.sysMsgStore.createTeamJoinActionMsgKey(
                      item as V2NIMTeamJoinActionInfoForUI
                    )
              }
              msg={item}
              applyTeamLoaidng={applyTeamLoaidng}
              teamInviteLoading={teamInviteLoading}
              applyFriendLoading={applyFriendLoading}
              onAcceptApplyTeamClick={onAcceptApplyTeamClick}
              onRejectApplyTeamClick={onRejectApplyTeamClick}
              onAcceptTeamInviteClick={onAcceptTeamInviteClick}
              onRejectTeamInviteClick={onRejectTeamInviteClick}
              onAcceptApplyFriendClick={onAcceptApplyFriendClick}
              onRejectApplyFriendClick={onRejectApplyFriendClick}
              afterSendMsgClick={afterSendMsgClick}
              prefix={prefix}
              commonPrefix={commonPrefix}
            />
          ))}
        </div>
      )}
    </div>
  )
}
