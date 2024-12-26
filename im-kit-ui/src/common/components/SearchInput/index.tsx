import React from 'react'
import { Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useTranslation } from '../../hooks/useTranslation'

export interface SearchInputProps {
  placeholder?: string
  value?: string
  disabled?: boolean
  onChange?: (val: string) => void
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  prefix?: string
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder,
  value,
  disabled = false,
  onChange,
  onClick,
  prefix = 'common',
}) => {
  const _prefix = `${prefix}-searchinput`

  const { t } = useTranslation()

  placeholder = placeholder || t('searchInputPlaceholder')

  return (
    <div className={`${_prefix}-wrap`} onClick={(e) => onClick?.(e)}>
      <Input
        prefix={<SearchOutlined className={`${_prefix}-icon`} />}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
      />
    </div>
  )
}

export default SearchInput
