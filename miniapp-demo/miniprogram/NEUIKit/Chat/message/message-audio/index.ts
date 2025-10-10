Component({
  properties: {
    msg: {
      type: Object,
      value: {}
    },
    mode: {
      type: String,
      value: ''
    }
  },

  data: {
    audioIconType: 'icon-yuyin3',
    animationFlag: false,
    isAudioPlaying: false,
    audioContainerWidth: 50,
    duration: 1,
    audioContext: null as any
  },

  observers: {
    'msg': function(msg: any) {
      if (msg && msg.attachment) {
        const duration = this.formatDuration(msg.attachment.duration)
        const maxWidth = 180
        const width = 50 + 8 * (duration - 1) > maxWidth 
          ? maxWidth 
          : 50 + 8 * (duration - 1)
        
        this.setData({
          duration,
          audioContainerWidth: width
        })
      }
    }
  },

  lifetimes: {
    attached() {
      const audioContext = wx.createInnerAudioContext()
      this.setData({ audioContext })
      this.setupAudioEvents()
    },
    
    detached() {
      if (this.data.audioContext) {
        this.data.audioContext.destroy()
      }
    }
  },

  methods: {
    formatDuration(duration: number): number {
      return Math.round(duration / 1000) || 1
    },

    setupAudioEvents() {
      const audioContext = this.data.audioContext
      if (!audioContext) return

      audioContext.onPlay(() => {
        this.setData({ isAudioPlaying: true })
        this.playAudioAnimation()
      })

      audioContext.onPause(() => {
        this.setData({ 
          animationFlag: false, 
          isAudioPlaying: false 
        })
      })

      audioContext.onEnded(() => {
        this.setData({ 
          animationFlag: false, 
          isAudioPlaying: false 
        })
      })

      audioContext.onError((error: any) => {
        console.warn('音频播放出错:', error)
        this.setData({ 
          animationFlag: false, 
          isAudioPlaying: false 
        })
      })
    },

    togglePlay() {
      const audioContext = this.data.audioContext
      if (!audioContext) return

      if (this.data.isAudioPlaying) {
        audioContext.pause()
        audioContext.seek(0)
      } else {
        // 通知其他音频停止播放
        this.triggerEvent('audioPlayChange', { 
          messageId: this.properties.msg.messageClientId 
        })
        
        audioContext.src = (this.properties.msg.attachment && this.properties.msg.attachment.url) ? this.properties.msg.attachment.url : ''
        audioContext.play()
      }
    },

    playAudioAnimation() {
      this.setData({ animationFlag: true })
      
      const animateIcons = () => {
        if (!this.data.animationFlag) return
        
        const icons = ['icon-yuyin1', 'icon-yuyin2', 'icon-yuyin3']
        let currentIndex = 0
        
        const animate = () => {
          if (!this.data.animationFlag) return
          
          this.setData({ 
            audioIconType: icons[currentIndex] 
          })
          
          currentIndex = (currentIndex + 1) % icons.length
          
          setTimeout(animate, 300)
        }
        
        animate()
      }
      
      animateIcons()
    },

    stopAudio() {
      if (this.data.audioContext && this.data.isAudioPlaying) {
        this.data.audioContext.pause()
        this.data.audioContext.seek(0)
        this.setData({ 
          isAudioPlaying: false, 
          animationFlag: false 
        })
      }
    }
  }
})