import React, { useState, useMemo, useCallback } from 'react'
import { Modal } from 'antd'
import { SearchInput, CrudeAvatar, useTranslation } from '../../../../common'
import { CrudeAvatarProps } from '../../../../common/components/CrudeAvatar'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { Team } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import { AutoSizer, List } from 'react-virtualized'

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

export type SectionListItem = NimKitCoreTypes.IFriendInfo | Team

export type Section = {
  id: 'friends' | 'groups'
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
        id: 'friends' as Section['id'],
        list: friends,
      },
      {
        id: 'groups' as Section['id'],
        list: teams,
      },
    ].filter((item) => !!item.list.length)
  }, [friends, teams])

  const searchedSections: (SectionListItem | 'friends' | 'groups')[] =
    useMemo(() => {
      const finalSections = sections
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

      const res: (SectionListItem | 'friends' | 'groups')[] = []

      finalSections.forEach((item) => {
        if (item.id === 'friends') {
          res.push('friends')
          item.list.forEach((item) => {
            res.push(item)
          })
        } else if (item.id === 'groups') {
          res.push('groups')
          item.list.forEach((item) => {
            res.push(item)
          })
        }
      })

      return res
    }, [sections, searchText])

  const handleSearchChange = (value: string) => {
    setSearchText(value)
  }

  const resetState = useCallback(() => {
    setSearchText('')
  }, [])

  const handleItemClick = useCallback(
    (data: SectionListItem) => {
      onResultItemClick(data)
      resetState()
    },
    [onResultItemClick, resetState]
  )

  const handleCancel = () => {
    onCancel()
    resetState()
  }

  const rowRenderer = useCallback(
    ({ index, key, style }) => {
      const item = searchedSections[index]

      if (typeof item === 'string') {
        return (
          <div style={style} key={key}>
            <div className={`${_prefix}-content-section-title`}>
              {t(item === 'friends' ? 'searchFriendTitle' : 'searchTeamTitle')}
            </div>
          </div>
        )
      }

      return (
        <div style={style} key={key}>
          <SearchItem
            key={
              (item as NimKitCoreTypes.IFriendInfo).account ||
              (item as Team).teamId
            }
            onClick={() => handleItemClick(item)}
            prefix={prefix}
            account={
              (item as NimKitCoreTypes.IFriendInfo).account ||
              (item as Team).teamId
            }
            avatar={item.avatar}
            nick={
              (item as NimKitCoreTypes.IFriendInfo).nick || (item as Team).name
            }
            alias={(item as NimKitCoreTypes.IFriendInfo).alias || ''}
          />
        </div>
      )
    },
    [_prefix, prefix, searchedSections, t, handleItemClick]
  )

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
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                overscanRowCount={10}
                rowCount={searchedSections.length}
                rowHeight={52}
                rowRenderer={rowRenderer}
                width={width}
              />
            )}
          </AutoSizer>
        </div>
      )}
    </Modal>
  )
}

export default SearchModal
