import React, { useState, useMemo } from 'react'
import { Modal } from 'antd'
import { SearchInput, CrudeAvatar, useTranslation } from '../../../../common'
import { CrudeAvatarProps } from '../../../../common/components/CrudeAvatar'
import { V2NIMTeam } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMTeamService'
import { V2NIMFriend } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMFriendService'
import { V2NIMUser } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMUserService'

export interface SearchItemProps extends CrudeAvatarProps {
  onClick: () => void
  prefix?: string
  alias?: string
}

const SearchItem: React.FC<SearchItemProps> = ({
  onClick,
  prefix = 'search',
  ...props
}) => {
  const _prefix = `${prefix}-search-modal`

  return (
    <div className={`${_prefix}-content-section-item`} onClick={onClick}>
      <CrudeAvatar {...props} />
      <span className={`${_prefix}-content-section-item-name`}>
        {props.alias || props.nick || props.account}
      </span>
    </div>
  )
}

export type SectionListItem = (V2NIMFriend & V2NIMUser) | V2NIMTeam

export type Section = {
  id: string
  title: string
  list: SectionListItem[]
}

export interface SearchModalProps {
  visible: boolean
  friends: (V2NIMFriend & V2NIMUser)[]
  teams: V2NIMTeam[]
  onCancel: () => void
  onResultItemClick: (item: SectionListItem) => void
  renderEmpty?: () => JSX.Element
  renderSearchResultEmpty?: () => JSX.Element

  prefix?: string
  commonPrefix?: string
}

const SearchModal: React.FC<SearchModalProps> = ({
  visible,
  friends,
  teams,
  onCancel,
  onResultItemClick,
  renderEmpty,
  renderSearchResultEmpty,
  prefix = 'search',
  commonPrefix = 'common',
}) => {
  const _prefix = `${prefix}-search-modal`

  const { t } = useTranslation()

  const [searchText, setSearchText] = useState('')

  const sections: Section[] = useMemo(() => {
    return [
      {
        id: 'friends',
        title: t('searchFriendTitle'),
        list: friends,
      },
      {
        id: 'groups',
        title: t('searchTeamTitle'),
        list: teams,
      },
    ].filter((item) => !!item.list.length)
  }, [friends, teams, t])

  const searchedSections: Section[] = useMemo(() => {
    return sections
      .map((item) => {
        if (item.id === 'friends') {
          return {
            ...item,
            list: item.list.filter((item) => {
              return (
                (item as V2NIMFriend & V2NIMUser).alias ||
                (item as V2NIMFriend & V2NIMUser).name ||
                (item as V2NIMFriend & V2NIMUser).accountId
              ).includes(searchText)
            }),
          }
        }
        if (item.id === 'groups') {
          return {
            ...item,
            list: item.list.filter((item) => {
              return (
                (item as V2NIMTeam).name || (item as V2NIMTeam).teamId
              ).includes(searchText)
            }),
          }
        }
        return { ...item }
      })
      .filter((item) => !!item.list.length)
  }, [sections, searchText])

  const handleSearchChange = (value: string) => {
    setSearchText(value)
  }

  const handleItemClick = (data: SectionListItem) => {
    onResultItemClick(data)
    resetState()
  }

  const handleCancel = () => {
    onCancel()
    resetState()
  }

  const resetState = () => {
    setSearchText('')
  }

  return (
    <Modal
      className={_prefix}
      title={
        <SearchInput
          value={searchText}
          prefix={commonPrefix}
          onChange={handleSearchChange}
        />
      }
      onCancel={handleCancel}
      visible={visible}
      width={630}
      footer={null}
      destroyOnClose={true}
    >
      {!sections.length ? (
        renderEmpty ? (
          renderEmpty()
        ) : (
          <div className={`${_prefix}-empty`}>{t('searchEmptyText')}</div>
        )
      ) : !searchedSections.length ? (
        renderSearchResultEmpty ? (
          renderSearchResultEmpty()
        ) : (
          <div className={`${_prefix}-empty`}>{t('searchNoResText')}</div>
        )
      ) : (
        <div className={`${_prefix}-content`}>
          {searchedSections.map((section) => (
            <div className={`${_prefix}-content-section`} key={section.id}>
              <div className={`${_prefix}-content-section-title`}>
                {section.title}
              </div>
              {section.list.map((item) => (
                <SearchItem
                  key={
                    (item as V2NIMFriend & V2NIMUser).accountId ||
                    (item as V2NIMTeam).teamId
                  }
                  onClick={() => handleItemClick(item)}
                  prefix={prefix}
                  account={
                    (item as V2NIMFriend & V2NIMUser).accountId ||
                    (item as V2NIMTeam).teamId
                  }
                  avatar={item.avatar}
                  nick={item.name}
                  alias={(item as V2NIMFriend & V2NIMUser).alias || ''}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}

export default SearchModal
