import React, { useMemo, useState } from 'react'
import { message } from 'antd'
import {
  ComplexAvatarContainer,
  useStateContext,
  useTranslation,
  SelectModal,
} from '../../../common'
import { SelectModalItemProps } from '../../../common/components/SelectModal'
import { V2NIMTeamMember } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMTeamService'
import { V2NIMConst } from 'nim-web-sdk-ng'
import { observer } from 'mobx-react'

interface GroupActionModalProps {
  visible: boolean
  members: V2NIMTeamMember[] // 成员列表
  onOk: () => void // 确认操作的回调函数
  onCancel: () => void
  commonPrefix?: string
  teamId: string
}

const GroupTransferModal: React.FC<GroupActionModalProps> = observer(
  ({ members, onOk, visible, onCancel, teamId, commonPrefix = 'common' }) => {
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
          case 109427:
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
      const aiUsers = store.aiUserStore.getAIUserList()
      const _showMembers = members
        .filter((item) =>
          aiUsers.every((ai) => ai.accountId !== item.accountId)
        )
        .map((item) => {
          return {
            ...item,
            key: item.accountId,
            disabled:
              item.memberRole ===
              V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_OWNER,
            label: store.uiStore.getAppellation({
              account: item.accountId,
              teamId: item.teamId,
            }),
          }
        })

      return _showMembers
    }, [members, store.uiStore, store.aiUserStore])

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
)

export default GroupTransferModal
