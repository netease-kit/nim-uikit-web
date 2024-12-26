import React, { useCallback, MutableRefObject } from 'react'

interface useImgPasteProps {
  focus?: boolean
  textareaRef?: MutableRefObject<HTMLTextAreaElement | undefined>
  onSendImg: (file: File) => void
}

export const useImgPaste = (props: useImgPasteProps) => {
  const { textareaRef, onSendImg } = props

  const handleImgPaste = useCallback(
    async (e: React.ClipboardEvent | any) => {
      if (!(e.clipboardData && e.clipboardData.items)) {
        return
        // 右键粘贴
      } else if (e.clipboardData.files.length) {
        if (e.clipboardData.files[0].type.match(/^image\//i)) {
          return onSendImg && onSendImg(e.clipboardData.files[0])
        }
      }

      const { types, items } = e.clipboardData

      types.find((type, index) => {
        const item = items[index]

        switch (type) {
          case 'Files': {
            const file = item.getAsFile()

            if (item && item.kind === 'file' && item.type.match(/^image\//i)) {
              onSendImg && onSendImg(file)
            }

            return true
          }

          default:
            return true
        }
      })
    },
    [textareaRef, onSendImg]
  )

  return {
    handleImgPaste,
  }
}
