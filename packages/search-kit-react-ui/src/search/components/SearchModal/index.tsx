import React, { useState, useEffect } from 'react'
import { Modal } from 'antd'
import { SearchInput, CrudeAvatar, useTranslation } from '@xkit-yx/common-ui'
import { CrudeAvatarProps } from '@xkit-yx/common-ui/lib/components/CrudeAvatar'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { Team } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'

export interface SearchItemProps extends CrudeAvatarProps {
  onClick?: (id: string) => void
  prefix?: string
}

const SearchItem: React.FC<SearchItemProps> = ({
  onClick,
  prefix = 'search',
  ...props
}) => {
  const _prefix = `${prefix}-search-modal`

  return (
    <div
      className={`${_prefix}-content-section-item`}
      onClick={() => onClick?.(props.account)}
    >
      <CrudeAvatar {...props} />
      <span className={`${_prefix}-content-section-item-name`}>
        {props.nick || props.account}
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
  visible?: boolean
  dataSource?: Section[]
  onCancel?: () => void
  onResultItemClick?: (item: SectionListItem) => void
  prefix?: string
  commonPrefix?: string
}

const SearchModal: React.FC<SearchModalProps> = ({
  visible = false,
  dataSource,
  onCancel,
  onResultItemClick,
  prefix = 'search',
  commonPrefix = 'common',
}) => {
  const _prefix = `${prefix}-search-modal`

  const { t } = useTranslation()

  const [isEmpty, setIsEmpty] = useState(!dataSource || dataSource.length === 0)
  const [searchText, setSearchText] = useState('')
  const [searchResult, setSearchResult] = useState<Section[]>([])

  useEffect(() => {
    if (!visible) return
    const _searchResult: Section[] = []
    dataSource?.forEach((section) => {
      const _section = {
        ...section,
        list: section.list.filter((item) => {
          if ((item as NimKitCoreTypes.IFriendInfo).account) {
            // @ts-ignore
            return (item.nick || item.account).includes(searchText)
          } else if ((item as Team).teamId) {
            // @ts-ignore
            return (item.name || item.teamId).includes(searchText)
          }
          return false
        }),
      }
      if (_section.list.length !== 0) _searchResult.push(_section)
    })
    if (_searchResult.length === 0) setIsEmpty(true)
    else {
      setIsEmpty(false)
      setSearchResult(_searchResult)
    }
  }, [visible, dataSource, searchText])

  return (
    <Modal
      className={_prefix}
      title={
        <SearchInput
          value={searchText}
          prefix={commonPrefix}
          onChange={setSearchText}
        />
      }
      onCancel={() => onCancel?.()}
      visible={visible}
      width={630}
      footer={null}
      afterClose={() => {
        setSearchText('')
        setSearchResult([])
      }}
    >
      {isEmpty ? (
        <div className={`${_prefix}-empty`}>{t('searchEmptyText')}</div>
      ) : (
        <div className={`${_prefix}-content`}>
          {searchResult.map((section) => (
            <div className={`${_prefix}-content-section`} key={section.id}>
              <div className={`${_prefix}-content-section-title`}>
                {section.title}
              </div>
              {section.list.map((item) => (
                <SearchItem
                  // @ts-ignore
                  key={item.account || item.teamId}
                  onClick={() => onResultItemClick?.(item)}
                  prefix={prefix}
                  // @ts-ignore
                  account={item.account || item.teamId}
                  avatar={item.avatar}
                  // @ts-ignore
                  nick={item.nick || item.name}
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
