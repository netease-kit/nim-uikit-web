import React, { FC } from 'react'

export interface RichTextProps {
  ref?: React.RefObject<HTMLDivElement>
  className?: string
  placeholder?: string
  children?: React.ReactNode
  disabled?: boolean
  onInput?: React.FormEventHandler<HTMLDivElement>
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>
  onPressEnter?: (event: React.KeyboardEvent<HTMLDivElement>) => void
  onClick?: React.MouseEventHandler<HTMLDivElement>

  prefix?: string
}

export const RichText: FC<RichTextProps> = ({
  ref,
  className = '',
  children,
  onInput,
  onKeyDown,
  onPressEnter,
  onClick,
  prefix = 'common',
}) => {
  const _prefix = `${prefix}-rich-text`

  const handleOnKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onPressEnter?.(event)
      return
    }

    onKeyDown?.(event)
  }

  return (
    <div
      ref={ref}
      className={`${_prefix} ${className}`}
      contentEditable={true}
      onInput={onInput}
      onKeyDown={handleOnKeyDown}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
