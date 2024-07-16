import React, { useEffect, useState } from 'react'
import { Modal, Input, Radio, Button, Checkbox } from 'antd'
import { CloseOutlined, SearchOutlined } from '@ant-design/icons'
import { useTranslation } from '../../../common'

export interface SelectModalItemProps {
  key: string
  label: string
  disabled?: boolean
  hide?: boolean
}

export interface SelectModalProps {
  tabRenderer?: React.ReactNode
  datasource: SelectModalItemProps[]
  visible: boolean
  onSearchChange?: (value: string) => void
  onSelectChange?: (value: SelectModalItemProps[]) => void
  onDelete?: (value: SelectModalItemProps) => void
  onOk: (data: SelectModalItemProps[]) => Promise<void>
  onCancel: () => void
  okText?: string
  title?: string
  defaultValue?: string[]
  bottomRenderer?: React.ReactNode
  itemAvatarRender?: (data: SelectModalItemProps) => React.ReactNode
  recentRenderer?: React.ReactNode
  type?: 'radio' | 'checkbox'
  max?: number
  min?: number
  searchPlaceholder?: string
  leftTitle?: string
  showLeftTitle?: boolean
  rightTitle?: string
  closable?: boolean
  width?: number

  prefix?: string
}

const emptyArr = []

export const SelectModal: React.FC<SelectModalProps> = ({
  tabRenderer,
  datasource,
  visible,
  onSearchChange,
  onSelectChange,
  onDelete,
  onOk,
  onCancel,
  okText,
  title,
  defaultValue = emptyArr,
  bottomRenderer,
  itemAvatarRender,
  recentRenderer,
  type = 'radio',
  max = Infinity,
  min = 0,
  searchPlaceholder,
  leftTitle,
  showLeftTitle = true,
  rightTitle,
  closable = true,
  width = 720,

  prefix = 'common',
}) => {
  const { t } = useTranslation()

  const [searchText, setSearchText] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [sending, setSending] = useState(false)

  searchPlaceholder = searchPlaceholder ?? t('searchText')
  leftTitle = leftTitle ?? t('searchText')
  rightTitle =
    rightTitle ?? `${t('selectedText')}: ${selected.length} ${t('personUnit')}`

  useEffect(() => {
    // 打开时给默认状态
    if (visible) {
      setSelected(defaultValue)
    }
  }, [defaultValue, visible])

  useEffect(() => {
    // 关闭时重置状态
    if (!visible) {
      resetState()
    }
  }, [visible])

  // const finalDatasource = useMemo(() => {
  //   return datasource.filter((item) => item.label.includes(searchText))
  // }, [searchText, datasource])

  const _prefix = `${prefix}-select-modal`

  const getItemsFromKeys = (keys: string[]) => {
    return datasource
      .filter((item) => keys.some((j) => j === item.key))
      .reduce((unique, item) => {
        if (!unique.some((uniqueItem) => uniqueItem.key === item.key)) {
          unique.push(item)
        }

        return unique
      }, [] as SelectModalItemProps[])
  }

  const handleSearchTextChange = (e: any) => {
    const value = e.target.value

    setSearchText(value)
    onSearchChange?.(value)
  }

  const handleSelect = (e: any) => {
    let value: string[] = []

    if (type === 'radio') {
      value = [e.target.value]
    } else {
      value = e
    }

    setSelected(value)
    onSelectChange?.(getItemsFromKeys(value))
  }

  const handleSelectDelete = (item: SelectModalItemProps) => {
    setSelected(selected.filter((i) => i !== item.key))
    onDelete?.(item)
  }

  const resetState = () => {
    setSearchText('')
    setSelected([])
    setSending(false)
  }

  const handleOk = async () => {
    try {
      setSending(true)
      await onOk(getItemsFromKeys(selected))
    } catch (error) {
      //
    } finally {
      setSending(false)
    }
  }

  const renderRadio = () => {
    return (
      <Radio.Group
        onChange={handleSelect}
        value={selected[0]}
        style={{ width: '100%' }}
      >
        {datasource.map((item, index) => {
          const isVisible = !item.hide && item.label.includes(searchText)

          return (
            <div
              className={`${_prefix}-content-item ${
                item.key === selected[0] ? `${_prefix}-content-item-focus` : ''
              }`}
              key={`${item.key}_${index}`}
              style={{ display: isVisible ? 'flex' : 'none' }}
            >
              <Radio value={item.key} disabled={item.disabled} />
              {itemAvatarRender?.(item)}
              <span className={`${_prefix}-content-text`}>{item.label}</span>
            </div>
          )
        })}
      </Radio.Group>
    )
  }

  const renderCheckbox = () => {
    return (
      <Checkbox.Group
        onChange={handleSelect}
        value={selected}
        style={{ width: '100%' }}
        disabled={selected.length >= max}
      >
        {datasource.map((item, index) => {
          const isVisible = !item.hide && item.label.includes(searchText)

          return (
            <div
              className={`${_prefix}-content-item ${
                item.key === selected[0] ? `${_prefix}-content-item-focus` : ''
              }`}
              key={`${item.key}_${index}`}
              style={{ display: isVisible ? 'flex' : 'none' }}
            >
              <Checkbox value={item.key} disabled={item.disabled} />
              {itemAvatarRender?.(item)}
              <span className={`${_prefix}-content-text`}>{item.label}</span>
            </div>
          )
        })}
      </Checkbox.Group>
    )
  }

  const renderSelected = () => {
    return selected.length
      ? selected.map((key) => {
          const item = datasource.find((item) => item.key === key)

          if (!item) {
            return null
          }

          return (
            <div className={`${_prefix}-content-chose`} key={key}>
              {itemAvatarRender?.(item)}
              <span className={`${_prefix}-content-text`}>{item.label}</span>
              <Button
                style={{ marginLeft: 'auto' }}
                type="text"
                icon={<CloseOutlined className={`${_prefix}-content-close`} />}
                onClick={() => {
                  handleSelectDelete(item)
                }}
              ></Button>
            </div>
          )
        })
      : null
  }

  return (
    <Modal
      okText={okText}
      title={title}
      okButtonProps={{ disabled: selected.length < min, loading: sending }}
      width={width}
      closable={closable}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
    >
      <div className={`${_prefix}-content`}>
        <div className={`${_prefix}-content-left`}>
          <Input
            className={`${_prefix}-input`}
            value={searchText}
            prefix={<SearchOutlined style={{ color: '#b3b7bc' }} />}
            allowClear
            onChange={handleSearchTextChange}
            placeholder={searchPlaceholder}
          />
          {!searchText ? recentRenderer : null}
          {showLeftTitle ? (
            <div className={`${_prefix}-content-l-title`}>
              {searchText ? t('searchText') : leftTitle}
            </div>
          ) : null}
          {tabRenderer}
          <div className={`${_prefix}-content-l-list`}>
            {!datasource.filter(
              (item) => !item.hide && item.label.includes(searchText)
            ).length ? (
              <div className={`${_prefix}-content-empty`}>
                {t('searchNoResText')}
              </div>
            ) : type === 'radio' ? (
              renderRadio()
            ) : (
              renderCheckbox()
            )}
          </div>
        </div>
        <div className={`${_prefix}-content-right`}>
          <div className={`${_prefix}-content-r-title`}>{rightTitle}</div>
          <div className={`${_prefix}-content-r-list`}>{renderSelected()}</div>
        </div>
      </div>
      {bottomRenderer}
    </Modal>
  )
}
