```
NEUIKit
├─ Chat                                    # 聊天模块
│  ├─ index.vue                           # 聊天主界面组件，包含消息列表、输入框、聊天头部等核心功能
│  ├─ message                             # 消息相关组件目录
│  │  ├─ chat-header.vue                  # 聊天头部组件，显示聊天对象信息、在线状态、操作按钮
│  │  ├─ face.vue                         # 表情选择器组件，提供表情包选择和插入功能
│  │  ├─ mention-choose-list.vue          # @提及选择列表组件，用于群聊中选择要@的成员
│  │  ├─ message-audio.vue                # 音频消息组件，支持音频播放、波形显示、时长显示
│  │  ├─ message-avatar.vue               # 消息头像组件，显示发送者头像，支持点击查看用户信息
│  │  ├─ message-bubble.vue               # 消息气泡组件，处理消息背景、样式、布局
│  │  ├─ message-dropdown.vue             # 消息操作下拉菜单，提供复制、转发、删除、撤回等功能
│  │  ├─ message-file.vue                 # 文件消息组件，支持文件预览、下载、大小显示
│  │  ├─ message-forward-modal.vue        # 消息转发弹窗，支持选择转发对象和添加转发说明
│  │  ├─ message-g2.vue                   # 音视频消息类型组件，处理特殊消息格式
│  │  ├─ message-image.vue                # 图片消息组件，支持图片预览、缩放、下载
│  │  ├─ message-input.vue                # 消息输入框组件，支持文本输入、表情、文件上传、@提及
│  │  ├─ message-item-content.vue         # 消息内容容器组件，根据消息类型渲染不同内容
│  │  ├─ message-item.vue                 # 消息项组件，包含头像、内容、时间、状态等完整消息结构
│  │  ├─ message-list.vue                 # 消息列表组件，支持虚拟滚动、历史消息加载、新消息提醒
│  │  ├─ message-notification.vue         # 消息通知组件，显示系统通知、入群退群等提示
│  │  ├─ message-read-info.vue            # 消息已读信息组件，显示消息已读状态和已读人员
│  │  ├─ message-read.vue                 # 消息已读状态组件，显示已读未读标识
│  │  ├─ message-reply.vue                # 消息回复组件，支持引用回复和回复内容显示
│  │  ├─ message-text.vue                 # 文本消息组件，支持富文本、链接识别、表情解析
│  │  ├─ message-video.vue                # 视频消息组件，支持视频播放、缩略图、时长显示
│  │  ├─ new-message-tip.vue              # 新消息提示组件，显示未读消息数量和快速定位
│  │  └─ not-friend-tip.vue               # 非好友提示组件，显示添加好友提示和操作按钮
│  └─ setting                             # 聊天设置模块
│     ├─ index.vue                        # 设置主界面，提供各种聊天设置选项入口
│     ├─ p2p                              # 单聊设置
│     │  └─ index.vue                     # 单聊设置页面，包含消息免打扰、聊天背景等设置
│     └─ team                             # 群聊设置
│        ├─ add-team-member-modal.vue     # 添加群成员弹窗，支持搜索和选择用户加入群聊
│        ├─ index.vue                     # 群聊设置主页面，包含群信息、成员管理、权限设置
│        ├─ team-info-setting.vue         # 群信息设置组件，支持修改群名称、群介绍、群头像
│        └─ team-member.vue               # 群成员组件，显示成员列表、角色、在线状态，支持成员管理
├─ CommonComponents                       # 通用组件库
│  ├─ Appellation.vue                     # 称谓组件，显示用户昵称、备注名等信息
│  ├─ Avatar.vue                          # 头像组件，支持用户头像、群头像显示，可自定义大小和样式
│  ├─ Badge.vue                           # 徽章组件，显示未读数量、状态标识等
│  ├─ BottomPopup.vue                     # 底部弹窗组件，提供从底部滑出的弹窗容器
│  ├─ Button.vue                          # 按钮组件，提供各种样式和状态的按钮
│  ├─ Drawer.vue                          # 抽屉组件，侧边滑出的面板容器
│  ├─ Dropdown.vue                        # 下拉菜单组件，提供下拉选择和操作菜单
│  ├─ Empty.vue                           # 空状态组件，显示无数据时的占位内容
│  ├─ FormInput.vue                       # 表单输入组件，提供标准化的表单输入框
│  ├─ Icon.vue                            # 图标组件，支持多种图标资源和自定义样式
│  ├─ Input.vue                           # 输入框组件，支持文本输入、验证、事件处理
│  ├─ Loading.vue                         # 加载组件，显示加载状态和进度指示
│  ├─ MessageOneLine.vue                  # 单行消息组件，用于显示简化的消息内容
│  ├─ Modal.vue                           # 模态框组件，提供弹窗容器和遮罩层
│  ├─ NetworkAlert.vue                    # 网络状态提醒组件，显示网络连接状态
│  ├─ PersonSelect.vue                    # 人员选择组件，支持多选用户和搜索功能
│  ├─ Popover.vue                         # 气泡提示组件，提供悬浮提示和操作面板
│  ├─ PreviewImage.vue                    # 图片预览组件，支持图片放大、缩放、旋转
│  ├─ Switch.vue                          # 开关组件，提供开关切换功能
│  ├─ Toast.vue                           # 提示组件，显示临时提示信息
│  ├─ UserCardModal.vue                   # 用户信息卡片弹窗，显示用户详细信息和操作按钮
│  └─ Welcome.vue                         # 欢迎页组件，显示欢迎信息和引导内容
├─ Contact                                # 联系人模块
│  ├─ black-list.vue                      # 黑名单列表组件，显示和管理被拉黑的用户
│  ├─ friend-list.vue                     # 好友列表组件，显示好友列表，支持搜索和分组
│  ├─ index.vue                           # 联系人主界面，提供好友、群组、黑名单等标签切换
│  ├─ team-list.vue                       # 群组列表组件，显示已加入的群组列表
│  └─ valid-list.vue                      # 验证消息列表组件，显示好友申请和群邀请
├─ Conversation                           # 会话列表模块
│  ├─ conversation-item-last-msg-content.vue  # 会话最后一条消息内容组件，显示消息预览
│  ├─ conversation-item-read.vue          # 会话已读状态组件，显示未读消息数量
│  ├─ conversation-item.vue               # 会话项组件，显示会话头像、名称、最后消息、时间
│  └─ conversation-list.vue               # 会话列表组件，支持虚拟滚动、置顶、删除、免打扰等操作
├─ Login                                  # 登录模块
│  ├─ components                          # 登录相关组件
│  │  ├─ form-input.vue                   # 登录表单输入组件，提供账号密码输入框
│  │  ├─ login-form.vue                   # 登录表单组件，处理登录逻辑和验证
│  │  └─ welcome.vue                      # 登录欢迎组件，显示欢迎信息和品牌标识
│  ├─ i18n                                # 登录模块国际化
│  │  └─ zh-cn.ts                         # 中文语言包
│  ├─ index.vue                           # 登录主页面，整合登录表单和欢迎页面
│  ├─ static                              # 登录页面静态资源
│  │  ├─ bg.png                           # 背景图片
│  │  ├─ welcome-bottom.png               # 欢迎页底部图片
│  │  └─ welcome.png                      # 欢迎页图片
│  └─ utils                               # 登录工具函数
│     └─ api.ts                           # 登录相关API接口
├─ Search                                 # 搜索模块
│  ├─ add                                 # 添加功能子模块
│  │  ├─ add-friend-modal.vue             # 添加好友弹窗，支持搜索用户和发送好友申请
│  │  ├─ create-team-modal.vue            # 创建群组弹窗，支持设置群信息和邀请成员
│  │  ├─ index.vue                        # 添加功能主组件，提供添加好友、创建群组等入口
│  │  └─ join-team-modal.vue              # 加入群组弹窗，支持搜索和申请加入群组
│  ├─ index.vue                           # 搜索主界面，提供搜索入口和添加功能按钮
│  ├─ search-modal.vue                    # 搜索弹窗，支持搜索好友、群组，并快速进入聊天
│  └─ search-result-item.vue              # 搜索结果项组件，显示搜索到的用户或群组信息
├─ User                                   # 用户模块
│  ├─ index.vue                           # 用户主页面，显示当前用户头像和基本信息
│  └─ my-user-card.vue                    # 个人信息卡片组件，显示和编辑个人详细信息
├─ locale                                 # 国际化语言包
│  ├─ en.ts                               # 英文语言包
│  └─ zh-Hans.ts                          # 简体中文语言包
└─ utils                                  # 工具函数库
   ├─ constants.ts                        # 常量定义
   ├─ date.ts                             # 日期时间处理工具
   ├─ emoji.ts                            # 表情处理工具
   ├─ encodeText.ts                       # 文本编码处理
   ├─ eventBus.ts                         # 事件总线
   ├─ friend.ts                           # 好友相关工具函数
   ├─ i18n.ts                             # 国际化工具
   ├─ index.ts                            # 工具函数入口文件
   ├─ init.ts                             # 初始化工具
   ├─ loading.ts                          # 加载状态管理
   ├─ matrix.ts                           # 矩阵计算工具
   ├─ modal.ts                            # 弹窗管理工具
   ├─ msg.ts                              # 消息处理工具
   ├─ parseText.ts                        # 文本解析工具
   ├─ permission.ts                       # 权限管理工具
   ├─ reporter.ts                         # 数据上报工具
   ├─ toast.ts                            # 提示消息工具
   
