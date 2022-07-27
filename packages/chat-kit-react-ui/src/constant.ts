export const REEDIT_RECALL_MSG_TIME = 1000 * 60 * 2

export const SHOW_RECALL_BTN_MSG_TIME = 1000 * 60 * 2

export const MIN_VALUE = Number.MIN_VALUE

export const MAX_UPLOAD_FILE_SIZE = 100

export enum CHAT_SETTING_TYPE {
  group = 'group',
  person = 'person',
}

export enum CHAT_ACTION {
  chatSetting = 'chatSetting',
  chatRecord = 'chatRecord',
}

export const enum GROUP_SETTING_TYPE {
  home = 'home',
  list = 'list',
  detail = 'detail',
  power = 'power',
}

export const enum SCROLL_MSG_TYPE {
  send = 'send',
  resend = 'resend',
  history = 'history',
  receive = 'receive',
  delete = 'delete',
  recall = 'recall',
}
