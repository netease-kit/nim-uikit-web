// ... existing code ...
import React, { useEffect, useMemo, useRef } from 'react'
import { Modal } from 'antd'

export interface VideoModalProps {
  visible: boolean
  url: string
  onCancel: () => void
  title?: string
  prefix?: string
  width?: number
  height?: number
  poster?: string
  autoplay?: boolean
  loop?: boolean
  muted?: boolean
  controls?: boolean
  // 允许透传更多 video 属性
  videoProps?: React.VideoHTMLAttributes<HTMLVideoElement>
}

const VideoModal: React.FC<VideoModalProps> = ({
  visible,
  url,
  onCancel,
  title,
  prefix = 'common',
  width = 720,
  height = 505,
  poster,
  autoplay = false,
  loop = false,
  muted = false,
  controls = true,
  videoProps,
}) => {
  const _prefix = useMemo(() => `${prefix}-video-modal`, [prefix])
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // 关闭时暂停并复位播放进度，避免声音残留
  useEffect(() => {
    if (!visible && videoRef.current) {
      try {
        videoRef.current.pause()
        videoRef.current.currentTime = 0
      } catch {
        // ignore
      }
    }
  }, [visible])

  return (
    <Modal
      className={_prefix}
      title={title}
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={width}
      destroyOnClose
      centered
    >
      <div className={`${_prefix}-content`} style={{ width: '100%' }}>
        <video
          key={url}
          ref={videoRef}
          src={url}
          poster={poster}
          controls={controls}
          autoPlay={autoplay}
          loop={loop}
          muted={muted}
          playsInline
          style={{
            width: '100%',
            height: height ?? 'auto',
            backgroundColor: '#000',
            outline: 'none',
          }}
          preload="metadata"
          {...videoProps}
        />
      </div>
    </Modal>
  )
}

export default VideoModal
// ... existing code ...
