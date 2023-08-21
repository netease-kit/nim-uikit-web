import React, { useMemo, useState } from 'react'
import { message } from 'antd'
import {
  ComplexAvatarContainer,
  useStateContext,
  useTranslation,
} from '../../../common'
import { TeamMember } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import { FriendProfile } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/FriendServiceInterface'
import { SelectModal } from '../../../common'
import { SelectModalItemProps } from '../../../common/components/SelectModal'
interface GroupActionModalProps {
  visible: boolean
  members: (TeamMember & Partial<FriendProfile>)[] // 成员列表
  onOk: () => void // 确认操作的回调函数
  onCancel: () => void
  commonPrefix?: string
  teamId: string
}

const GroupTransferModal: React.FC<GroupActionModalProps> = ({
  members,
  onOk,
  visible,
  onCancel,
  teamId,
  commonPrefix = 'common',
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>('') // 选中的成员 ID

  const { t } = useTranslation()

  const { store } = useStateContext()

  const handleCancel = () => {
    onCancel()
    setSelectedMemberId('')
  }

  const handleOk = async () => {
    try {
      await store.teamStore.transferTeamActive({
        account: selectedMemberId,
        teamId,
      })
      message.success(t('transferTeamSuccessText'))
      onOk()
    } catch (error: any) {
      switch (error?.code) {
        // 无权限
        case 802:
          message.error(t('noPermission'))
          break
        default:
          message.error(t('transferTeamFailedText'))
          break
      }
    }
  }

  const handleSelect = (value: SelectModalItemProps[]) => {
    setSelectedMemberId(value[0].key)
  }

  const datasource: SelectModalItemProps[] = useMemo(() => {
    const _showMembers = members.map((item) => {
      return {
        ...item,
        key: item.account,
        disabled: item.type === 'owner',
        label: store.uiStore.getAppellation({
          account: item.account,
          teamId: item.teamId,
        }),
      }
    })
    return _showMembers
  }, [[members]])

  const itemAvatarRender = (data: SelectModalItemProps) => {
    return (
      <ComplexAvatarContainer
        prefix={commonPrefix}
        canClick={false}
        account={data.key}
        size={32}
      />
    )
  }

  return (
    <SelectModal
      title={t('transferOwnerText')}
      searchPlaceholder={t('searchTeamMemberPlaceholder')}
      leftTitle={t('teamMemberText')}
      visible={visible}
      datasource={datasource}
      itemAvatarRender={itemAvatarRender}
      onSelectChange={handleSelect}
      type="radio"
      min={1}
      okText={t('okText')}
      onOk={handleOk}
      onCancel={handleCancel}
      prefix={commonPrefix}
    />
  )
}

export default GroupTransferModal
