import React from 'react'
import { Form, Switch } from 'antd'
import classnames from 'classnames'
import { useTranslation } from '../../../common'
import { Team } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'

export interface GroupPowerProps {
  onUpdateTeamInfo: (team: Partial<Team>) => void
  onTeamMuteChange: (mute: boolean) => void
  team: Team
  hasPower: boolean

  prefix?: string
}

const GroupPower: React.FC<GroupPowerProps> = ({
  onUpdateTeamInfo,
  onTeamMuteChange,
  team,
  hasPower,

  prefix = 'chat',
}) => {
  const { t } = useTranslation()
  const _prefix = `${prefix}-group-power`

  return (
    <div className={classnames(`${_prefix}-wrap`)}>
      <Form>
        <Form.Item name="updateTeamMode" label={t('teamManagerLimitText')}>
          <Switch
            checked={team.updateTeamMode === 'manager'}
            disabled={!hasPower}
            onChange={(checked) => {
              onUpdateTeamInfo({ updateTeamMode: checked ? 'manager' : 'all' })
            }}
          />
        </Form.Item>
        <Form.Item name="mute" label={t('teamMuteText')}>
          <Switch
            checked={team.mute}
            disabled={!hasPower}
            onChange={onTeamMuteChange}
          />
        </Form.Item>
        <Form.Item name="inviteMode" label={t('teamInviteModeText')}>
          <Switch
            checked={team.inviteMode === 'manager'}
            disabled={!hasPower}
            onChange={(checked) => {
              onUpdateTeamInfo({ inviteMode: checked ? 'manager' : 'all' })
            }}
          />
        </Form.Item>
      </Form>
    </div>
  )
}

export default GroupPower
