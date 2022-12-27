import React, { FC } from 'react'
import { useTranslation } from '../../../../common-ui/src'
import { MsgItem } from './MsgItem'
import { Spin, Empty } from 'antd'
import { SystemMessage } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/SystemMessageServiceInterface'

export interface MsgListProps {
  msgs: SystemMessage[]
  listLoading?: boolean
  applyTeamLoaidng?: boolean
  teamInviteLoading?: boolean
  applyFriendLoading?: boolean
  onAcceptApplyTeamClick?: (options: { teamId: string; from: string }) => void
  onRejectApplyTeamClick?: (options: { teamId: string; from: string }) => void
  onAcceptTeamInviteClick?: (options: { teamId: string; from: string }) => void
  onRejectTeamInviteClick?: (options: { teamId: string; from: string }) => void
  onAcceptApplyFriendClick?: (account: string) => void
  onRejectApplyFriendClick?: (account: string) => void
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
              key={`${item.idServer}_${item.from}_${item.to}_${item.type}`}
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
