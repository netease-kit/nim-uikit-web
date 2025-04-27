src
├─ chat # 聊天模块
│ ├─ Container.tsx # 聊天容器组件
│ ├─ components # 聊天相关组件
│ │ ├─ ChatAISearch # AI 搜索功能组件
│ │ ├─ ChatAITranslate # 消息翻译功能组件
│ │ ├─ ChatActionBar # 聊天操作栏组件
│ │ ├─ ChatAddMembers # 添加群成员组件
│ │ ├─ ChatCollectionList # 消息收藏列表组件
│ │ ├─ ChatForwardModal # 消息转发弹窗
│ │ ├─ ChatGroupTransferModal # 群主转让弹窗
│ │ ├─ ChatHeader # 聊天窗口头部组件
│ │ ├─ ChatMessageInput # 消息输入框组件
│ │ ├─ ChatMessageItem # 单条消息组件
│ │ ├─ ChatP2pMessageList # 点对点聊天消息列表
│ │ ├─ ChatP2pSetting # 点对点聊天设置
│ │ ├─ ChatSettingDrawer # 聊天设置抽屉组件
│ │ ├─ ChatTeamMemberModal # 群成员管理弹窗
│ │ ├─ ChatTeamMessageList # 群聊消息列表
│ │ ├─ ChatTeamSetting # 群聊设置组件
│ │ └─ ChatTopMsg # 置顶消息组件
│ └─ containers # 聊天容器组件
├─ p2pChatContainer.tsx # 点对点聊天容器
└─ teamChatContainer.tsx # 群聊容器

├─ common # 通用组件
│ ├─ components
│ │ ├─ CommonIcon # 通用图标组件
│ │ ├─ CommonParseSession # 会话解析组件
│ │ ├─ ComplexAvatar # 复杂头像组件
│ │ ├─ CreateTeamModal # 创建群组弹窗
│ │ ├─ CrudeAvatar # 基础头像组件
│ │ ├─ FriendSelect # 好友选择组件
│ │ ├─ GroupAvatarSelect # 群头像选择组件
│ │ ├─ MyAvatar # 个人头像组件
│ │ ├─ MyUserCard # 个人名片组件
│ │ ├─ ReadPercent # 消息已读百分比组件
│ │ ├─ RichText # 富文本组件
│ │ ├─ SearchInput # 搜索输入框组件
│ │ ├─ SelectModal # 通用选择弹窗
│ │ ├─ UserCard # 用户名片组件
│ │ └─ Welcome # 欢迎页组件

├─ contact # 通讯录模块
│ ├─ ai-list # AI 助手列表
│ ├─ black-list # 黑名单列表
│ ├─ contact-info # 联系人信息
│ ├─ contact-list # 通讯录列表
│ ├─ friend-list # 好友列表
│ ├─ group-list # 群组列表
│ └─ msg-list # 消息通知列表

├─ conversation # 会话列表模块
│ ├─ components
│ │ ├─ ConversationItem # 会话列表项组件
│ │ ├─ ConversationList # 会话列表组件
│ │ ├─ GroupItem # 群会话项组件
│ │ ├─ P2PItem # 点对点会话项组件
│ │ ├─ pinAIItem # 置顶 AI 会话项组件
│ │ └─ pinAIList # 置顶 AI 会话列表组件

├─ search # 搜索模块
│ ├─ add # 添加联系人/群组
│ │ ├─ components
│ │ │ ├─ AddFriendModal # 添加好友弹窗
│ │ │ ├─ AddItem # 搜索结果项
│ │ │ ├─ AddList # 搜索结果列表
│ │ │ ├─ AddPanel # 添加面板
│ │ │ └─ JoinTeamModal # 加入群组弹窗
│ └─ search # 搜索功能
└─ components
└─ SearchModal # 搜索弹窗

├─ uploadingTask.ts # 文件上传任务管理
├─ urlToBlob.ts # URL 转 Blob 工具
└─ utils.ts # 通用工具函数
