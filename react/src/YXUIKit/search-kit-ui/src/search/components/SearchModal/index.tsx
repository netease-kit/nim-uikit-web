import React, { useState, useMemo } from 'react'
import { Modal } from 'antd'
import { SearchInput, CrudeAvatar, useTranslation } from '../../../../../common-ui/src'
import { CrudeAvatarProps } from '../../../../../common-ui/src/components/CrudeAvatar'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { Team } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'

export interface SearchItemProps extends CrudeAvatarProps {
  onClick: () => void
  prefix?: string
}

const SearchItem: React.FC<SearchItemProps> = ({
  onClick,
  prefix = 'search',
  ...props
}) => {
  const _prefix = `${prefix}-search-modal`

  return (
    <div className={`${_prefix}-content-section-item`} onClick={onClick}>
      {/* TODO CrudeAvatar 可以不用了，p2p 都用 ComplexAvatar */}
      <CrudeAvatar {...props} />
      <span className={`${_prefix}-content-section-item-name`}>
        {props.alias || props.nick || props.account}
      </span>
    </div>
  )
}

export type SectionListItem = NimKitCoreTypes.IFriendInfo | Team

export type Section = {
  id: string
  title: string
  list: SectionListItem[]
}

export interface SearchModalProps {
  visible: boolean
  friends: NimKitCoreTypes.IFriendInfo[]
  teams: Team[]
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
                (item as NimKitCoreTypes.IFriendInfo).alias ||
                (item as NimKitCoreTypes.IFriendInfo).nick ||
                (item as NimKitCoreTypes.IFriendInfo).account
              ).includes(searchText)
            }),
          }
        }
        if (item.id === 'groups') {
          return {
            ...item,
            list: item.list.filter((item) => {
              return ((item as Team).name || (item as Team).teamId).includes(
                searchText
              )
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
                  // @ts-ignore
                  key={item.account || item.teamId}
                  onClick={() => handleItemClick(item)}
                  prefix={prefix}
                  // @ts-ignore
                  account={item.account || item.teamId}
                  avatar={item.avatar}
                  // @ts-ignore
                  nick={item.nick || item.name}
                  // @ts-ignore
                  alias={item.alias || ''}
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
