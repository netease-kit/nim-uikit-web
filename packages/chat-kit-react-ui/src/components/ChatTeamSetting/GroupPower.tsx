import React from 'react'
import { Form, Switch } from 'antd'
import classnames from 'classnames'
import { useTranslation } from '@xkit-yx/common-ui'
import { Team } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'

interface GroupPowerProps {
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

  const [form] = Form.useForm<Partial<Team>>()

  return (
    <div className={classnames(`${_prefix}-wrap`)}>
      <Form form={form}>
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
      </Form>
    </div>
  )
}

export default GroupPower
