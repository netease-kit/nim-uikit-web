import React, { useMemo } from 'react'
import { Form, Switch } from 'antd'
import classnames from 'classnames'
import { ITeamInfo } from '../../types'
import { useTranslation } from '@xkit-yx/common-ui'

interface GroupPowerProps {
  prefix?: string
  onUpdateTeamPowerInfo: (type: string, checked: boolean) => void
  teamInfo: ITeamInfo
  isGroupOwner: boolean
  isGroupManager: boolean
}

const GroupPower: React.FC<GroupPowerProps> = ({
  prefix = 'chat',
  onUpdateTeamPowerInfo,
  teamInfo,
  isGroupOwner,
  isGroupManager,
}) => {
  const { t } = useTranslation()
  const _prefix = `${prefix}-group-power`

  const [form] = Form.useForm()

  const isManager = useMemo(() => {
    return isGroupOwner || isGroupManager
  }, [isGroupOwner, isGroupManager])

  return (
    <div className={classnames(`${_prefix}-wrap`)}>
      <Form form={form}>
        <Form.Item name="updateTeamMode" label={t('teamManagerLimitText')}>
          <Switch
            checked={teamInfo.updateTeamMode === 'manager'}
            disabled={!isManager}
            onChange={(checked) =>
              onUpdateTeamPowerInfo('updateTeamMode', checked)
            }
          />
        </Form.Item>
        <Form.Item name="mute" label={t('teamMuteText')}>
          <Switch
            checked={teamInfo.mute}
            disabled={!isManager}
            onChange={(checked) => onUpdateTeamPowerInfo('muteMode', checked)}
          />
        </Form.Item>
      </Form>
    </div>
  )
}

export default GroupPower
