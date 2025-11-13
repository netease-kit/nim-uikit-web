import { t } from '../../utils/i18n'

Component({
  properties: {
    lastMessage: {
      type: Object,
      value: {}
    }
  },

  data: {
    messageType: 'text',
    lastMessageState: 0,
    sendingState: 0,
    imgMsgText: t('imgMsgText'),
    audioMsgText: t('audioMsgText'),
    videoMsgText: t('videoMsgText'),
    fileMsgText: t('fileMsgText'),
    geoMsgText: t('geoMsgText'),
    notiMsgText: t('conversationNotificationText'),
    callMsgText: t('callMsgText'),
    tipMsgText: t('tipMsgText'),
    robotMsgText: t('robotMsgText'),
    customMsgText: t('customMsgText'),
    unknowMsgText: t('unknowMsgText'),
    recallText: t('recall'),
    sendFailText: t('conversationSendFailText')
  },

  observers: {
    'lastMessage': function(lastMessage) {
      this.updateMessageType(lastMessage)
    }
  },

  methods: {
    updateMessageType(lastMessage: any) {
      if (!lastMessage) {
        this.setData({ 
          messageType: 'text',
          lastMessageState: 0,
          sendingState: 0
        })
        return
      }
      
      const messageType = this.getMessageTypeString(lastMessage.messageType)
      const lastMessageState = lastMessage.lastMessageState || 0
      const sendingState = lastMessage.sendingState || 0
      
      this.setData({ 
        messageType,
        lastMessageState,
        sendingState
      })
    },

    getMessageTypeString(messageType: number): string {
      switch (messageType) {
        case 0: // V2NIM_MESSAGE_TYPE_TEXT
          return 'text'
        case 1: // V2NIM_MESSAGE_TYPE_IMAGE
          return 'image'
        case 2: // V2NIM_MESSAGE_TYPE_AUDIO
          return 'audio'
        case 3: // V2NIM_MESSAGE_TYPE_VIDEO
          return 'video'
        case 4: // V2NIM_MESSAGE_TYPE_LOCATION
          return 'location'
        case 5: // V2NIM_MESSAGE_TYPE_NOTIFICATION
          return 'notification'
        case 6: // V2NIM_MESSAGE_TYPE_FILE
          return 'file'
        case 7: // V2NIM_MESSAGE_TYPE_AVCHAT
          return 'avchat'
        case 10: // V2NIM_MESSAGE_TYPE_TIPS
          return 'tips'
        case 11: // V2NIM_MESSAGE_TYPE_ROBOT
          return 'robot'
        case 12: // V2NIM_MESSAGE_TYPE_CALL
          return 'call'
        case 100: // V2NIM_MESSAGE_TYPE_CUSTOM
          return 'custom'
        default:
          return 'unknown'
      }
    }
  }
})