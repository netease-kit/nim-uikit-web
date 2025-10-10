// 默认头像数组
const DEFAULT_AVATARS = [
  'https://yx-web-nosdn.netease.im/common/2425b4cc058e5788867d63c322feb7ac/groupAvatar1.png',
  'https://yx-web-nosdn.netease.im/common/62c45692c9771ab388d43fea1c9d2758/groupAvatar2.png',
  'https://yx-web-nosdn.netease.im/common/d1ed3c21d3f87a41568d17197760e663/groupAvatar3.png',
  'https://yx-web-nosdn.netease.im/common/e677d8551deb96723af2b40b821c766a/groupAvatar4.png',
  'https://yx-web-nosdn.netease.im/common/fd6c75bb6abca9c810d1292e66d5d87e/groupAvatar5.png'
]

Page({
  data: {
    teamId: '',
    team: null as any,
    currentAvatar: '',
    selectedIndex: -1,
    defaultAvatars: DEFAULT_AVATARS,
    hasPermission: false,
    loading: false,
    saving: false,
    loadingText: '加载中...',
    statusBarHeight: 0,
    avatarColor: '#ccc',
    displayName: '群'
  },

  /**
   * 获取全局store
   */
  getStore() {
    return getApp().globalData.store
  },

  onLoad(options: any) {
    // 获取状态栏高度
    const systemInfo = wx.getSystemInfoSync()
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight || 0,
      teamId: options.teamId || ''
    })

    if (this.data.teamId) {
      this.loadTeamInfo()
      this.checkPermission()
    }
  },

  /**
   * 加载团队信息
   */
  async loadTeamInfo() {
    try {
      this.setData({ loading: true, loadingText: '加载团队信息...' })
      
      const team = this.getStore().teamStore.teams.get(this.data.teamId)
      if (!team) {
        wx.showToast({
          title: '团队信息不存在',
          icon: 'error'
        })
        return
      }

      // 生成头像颜色和显示名称
      const avatarColor = this.generateAvatarColor(this.data.teamId)
      const displayName = this.getDisplayName(this.data.teamId)

      this.setData({
        team,
        currentAvatar: team.avatar || '',
        avatarColor,
        displayName
      })

      // 检查当前头像是否是默认头像之一
      const currentIndex = DEFAULT_AVATARS.findIndex(avatar => avatar === team.avatar)
      if (currentIndex !== -1) {
        this.setData({ selectedIndex: currentIndex })
      }

    } catch (error) {
      console.error('加载团队信息失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  /**
   * 检查编辑权限
   */
  async checkPermission() {
    try {
      const currentUserId = (this.getStore().userStore.myUserInfo && this.getStore().userStore.myUserInfo.accountId) ? this.getStore().userStore.myUserInfo.accountId : null
      if (!currentUserId) {
        return
      }

      const team = this.getStore().teamStore.teams.get(this.data.teamId)
      if (!team) {
        return
      }

      // 检查是否是群主
      const isOwner = team.ownerAccountId === currentUserId

      // 检查是否是管理员
      const teamMembers = this.getStore().teamMemberStore.getTeamMember(this.data.teamId)
      let isManager = false
      if (Array.isArray(teamMembers)) {
        isManager = teamMembers.some(member => 
          member.accountId === currentUserId && member.memberRole === 'manager'
        )
      }

      // 检查群设置：updateInfoMode 为 0 表示只有管理员和群主可以修改，为 1 表示任何人都可以修改
      const canEdit = isOwner || isManager || team.updateInfoMode === 1

      this.setData({ hasPermission: canEdit })

      if (!canEdit) {
        wx.showToast({
          title: '无权限修改群头像',
          icon: 'error'
        })
      }

    } catch (error) {
      console.error('检查权限失败:', error)
    }
  },

  /**
   * 返回上一页
   */
  handleBack() {
    wx.navigateBack()
  },

  /**
   * 选择默认头像
   */
  handleSelectAvatar(e: any) {
    const index = e.currentTarget.dataset.index
    const avatar = DEFAULT_AVATARS[index]
    
    this.setData({
      selectedIndex: index,
      currentAvatar: avatar
    })
  },

  /**
   * 自定义上传头像
   */
  handleCustomUpload() {
    wx.showActionSheet({
      itemList: ['拍照', '从相册选择'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.chooseImage('camera')
        } else if (res.tapIndex === 1) {
          this.chooseImage('album')
        }
      }
    })
  },

  /**
   * 选择图片
   */
  chooseImage(sourceType: 'camera' | 'album') {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: [sourceType],
      success: (res) => {
        const filePath = res.tempFiles[0].tempFilePath
        this.uploadAvatar(filePath)
      }
    })
  },

  /**
   * 上传头像
   */
  async uploadAvatar(filePath: string) {
    try {
      this.setData({ loading: true, loadingText: '上传头像中...' })

      // 使用store的上传方法
      const uploadResult = await this.getStore().storageStore.uploadFileActive(filePath)

      if (uploadResult) {
        this.setData({
          currentAvatar: uploadResult,
          selectedIndex: -1 // 清除默认头像选择
        })
        wx.showToast({
          title: '上传成功',
          icon: 'success'
        })
      } else {
        throw new Error('上传失败')
      }

    } catch (error) {
      console.error('上传头像失败:', error)
      wx.showToast({
        title: '上传失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  /**
   * 保存头像
   */
  async handleSave() {
    if (!this.data.currentAvatar) {
      wx.showToast({
        title: '请选择头像',
        icon: 'error'
      })
      return
    }

    try {
      this.setData({ saving: true })

      await this.getStore().teamStore.updateTeamActive({
        teamId: this.data.teamId,
        info: {
          avatar: this.data.currentAvatar
        }
      })

      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })

      // 延迟返回，让用户看到成功提示
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)

    } catch (error) {
      console.error('保存头像失败:', error)
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      })
    } finally {
      this.setData({ saving: false })
    }
  },

  /**
   * 生成头像颜色
   */
  generateAvatarColor(teamId: string): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ]
    
    let hash = 0
    for (let i = 0; i < teamId.length; i++) {
      const char = teamId.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    
    const index = Math.abs(hash) % colors.length
    return colors[index]
  },

  /**
   * 获取显示名称
   */
  getDisplayName(teamId: string): string {
    if (!teamId) return '群'
    
    // 取teamId的最后一个字符，如果是数字或英文则显示，否则显示'群'
    const lastChar = teamId.slice(-1)
    if (/[a-zA-Z0-9]/.test(lastChar)) {
      return lastChar.toUpperCase()
    }
    return '群'
  }
})