# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits] for commit guidelines.

## [0.1.5] (2022-08-03)

### Bug Fixes

- 撤回、重新编辑样式和逻辑整理 
- 去掉多余字 

# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits] for commit guidelines.

## [0.1.4] (2022-07-29)

### Bug Fixes

- **core-kit:** 🐛 修复 getNIM 返回类型问题;hijack 代码优化;init 参数必传;

# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits] for commit guidelines.

## [0.1.3] (2022-07-28)

**Note:** Version bump only for package @xkit-yx/common-ui

# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits] for commit guidelines.

## [0.1.2] (2022-07-27)

### Bug Fixes

- **workspace:** 🐛 头像更改、不支持类型消息提示

# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits] for commit guidelines.

## [0.1.1] (2022-07-27)

### Bug Fixes

- **workspace:** 🐛 解决幽灵依赖和无用依赖

# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits] for commit guidelines.

# 0.1.0 (2022-07-26)

### Bug Fixes

- 表情包测试文案映射修改
- 代码整理、bug 修复
- 历史记录功能传参修正、store 从 common 迁移、发送 bug 修复
- 上传图片和文件添加 loading、创建群聊头像默认选中等
- 添加非重复 key、滚动位置逻辑添加
- 文案修改
- **chat-kit-react-ui:** 🐛 更换大小写
- **common-react-ui:** 🐛 会话过滤高级群
- **common-react-ui:** 🐛 扩展 nimWrapper nim1.ts
- **common-react-ui:** 🐛 扩展 nimwrapper 方法
- **common-react-ui:** 🐛 跑冒烟用例过程中的修改
- **common-react-ui:** 🐛 删除好友确认弹窗
- **common-react-ui:** 🐛 修复 Provider 没有 disconnect 的问题
- **common-react-ui:** 🐛 修复测试 bug
- **common-react-ui:** 🐛 修复好友列表更新时机以及会话列表请求时机的问题
- **common-react-ui:** 🐛 修复群头像某些情况还存在背景色的问题;导出群头像图片地址
- **common-react-ui:** 🐛 修复自测发现的一些问题
- **common-react-ui:** 🐛 修复 common 组件互相引用没有引用样式的问题
- **common-react-ui:** 🐛 修复 ts 报错
- **common-react-ui:** 🐛 修改 deleteSessions 的 payload 类型
- **common-react-ui:** 🐛 优化 store 中 session 更新的逻辑
- **common-react-ui:** 🐛 complexAvatar afterSave 增加保存结果
- **conversation-kit-react-ui:** 🐛 修复撤回消息会话消失的问题
- **conversation-kit-react-ui:** 🐛 修复选中会话样式丢失;好友列表去聊天信息完善
- **core-kit:** 🐛 删除会话时,重置静音;临时会话统一增加 lastMsg
- **core-kit:** 🐛 avatar 图片加载失败的处理;保持会话状态;
- **core-kit:** 🐛 im1 兼容;头像未更改时保存后消失的 bug 修复
- **core-kit:** 🐛 im1 兼容;search-kit 样式优化
- **core-kit:** 🐛 relation 不再需要外部传给 avatar, avatar 内部消化
- **search-kit-react-ui:** 🐛 升级 log 库,补充 search-kit 缺失的样式
- **search-kit-react-ui:** 🐛 hover 样式优化

### Features

- 部分主题补充、支持 prefix 统一样式前缀
- 初步代码和功能迁移
- 单聊/群聊功能完善
- 发送内容格式保留
- 发送自定义消息支持 im1 和 im2
- 公共方法抽离
- 路径修改
- 群聊功能完善
- 适配 m1 功能 API 和群聊功能初步提交
- 属性 boolean 提示 warning，修改为 number
- 添加渲染文本的 key
- 添加 loading 效果、更改类型、通讯录支持自定义
- 头像选择更新方法事件等删除
- 消息模块渲染抽离公共组件
- 引入调整
- 暂不添加聊天背景图
- 增加变量样式
- 针对群名称、聊天头部信息添加单行省略点点点
- 支持更换个人头像更换用户 chat 个人信息
- 字体色修改
- 自测与功能添加
- 自定义样式 chat 模块初步提交
- **call-kit:** 🎸 chat-kit 增加国际化配置
- **chat-kit-react-ui:** 🎸 feat:入口引入变量 less、导出引入变量 less
- chat 聊天内容区支持头像资料查看
- **common-react-ui:** 🎸 兼容 IM1 与 IM2
- **common-react-ui:** 🎸 随机头像颜色固定存储
- **common-react-ui:** 🎸 增加 im1 的实现并替换
- **common-react-ui:** 🎸 增加 IM1-wrapper
- **common-react-ui:** 🎸 增加 useStateContext
- **common-react-ui:** 🎸 common 增加国际化配置
- common 组件样式变量添加
- **conversation-kit-react-ui:** 🎸 增加会话删除和免打扰变更事件
- **core-kit:** 🎸 将 sdk 相关的接口都挪到私有方法,为后面用户重载做好准备
- **core-kit:** 🎸 迁移 nimWrapperrapper
- **core-kit:** 🎸 IM 兼容老用户
- font-size 和 border-radius 抽离定义
- groupBy 按照 nick 排序
- im1 事件功能添加
- login、conversation 样式变量添加
- sdk 文件回退
- **workspace:** 🎸 国际化配置
- **workspace:** 🎸 迁移 IM UI Kit

# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits] for commit guidelines.

# [0.2.0] (2022-06-30)

### Bug Fixes

- **common-react-ui:** 🐛 会话过滤高级群
- **common-react-ui:** 🐛 修复测试 bug
- **common-react-ui:** 🐛 修复群头像某些情况还存在背景色的问题;导出群头像图片地址
- **common-react-ui:** 🐛 修改 deleteSessions 的 payload 类型
- **common-react-ui:** 🐛 删除好友确认弹窗
- **common-react-ui:** 🐛 跑冒烟用例过程中的修改
- **conversation-kit-react-ui:** 🐛 修复撤回消息会话消失的问题
- **conversation-kit-react-ui:** 🐛 修复选中会话样式丢失;好友列表去聊天信息完善
- **core-kit:** 🐛 avatar 图片加载失败的处理;保持会话状态;
- **core-kit:** 🐛 im1 兼容;search-kit 样式优化
- **core-kit:** 🐛 删除会话时,重置静音;临时会话统一增加 lastMsg
- **search-kit-react-ui:** 🐛 hover 样式优化
- **search-kit-react-ui:** 🐛 升级 log 库,补充 search-kit 缺失的样式
- 历史记录功能传参修正、store 从 common 迁移、发送 bug 修复
- 添加非重复 key、滚动位置逻辑添加

### Features

- **common-react-ui:** 🎸 随机头像颜色固定存储
- groupBy 按照 nick 排序
- 公共方法抽离
- 发送内容格式保留
- 消息模块渲染抽离公共组件
- 自测与功能添加

# [0.1.0] (2022-06-30)

### Bug Fixes

- **common-react-ui:** 🐛 会话过滤高级群
- **common-react-ui:** 🐛 修复测试 bug
- **common-react-ui:** 🐛 修复群头像某些情况还存在背景色的问题;导出群头像图片地址
- **common-react-ui:** 🐛 修改 deleteSessions 的 payload 类型
- **common-react-ui:** 🐛 删除好友确认弹窗
- **common-react-ui:** 🐛 跑冒烟用例过程中的修改
- **conversation-kit-react-ui:** 🐛 修复撤回消息会话消失的问题
- **conversation-kit-react-ui:** 🐛 修复选中会话样式丢失;好友列表去聊天信息完善
- **core-kit:** 🐛 avatar 图片加载失败的处理;保持会话状态;
- **core-kit:** 🐛 im1 兼容;search-kit 样式优化
- **core-kit:** 🐛 删除会话时,重置静音;临时会话统一增加 lastMsg
- **search-kit-react-ui:** 🐛 hover 样式优化
- **search-kit-react-ui:** 🐛 升级 log 库,补充 search-kit 缺失的样式
- 历史记录功能传参修正、store 从 common 迁移、发送 bug 修复
- 添加非重复 key、滚动位置逻辑添加

### Features

- **common-react-ui:** 🎸 随机头像颜色固定存储
- groupBy 按照 nick 排序
- 公共方法抽离
- 发送内容格式保留
- 消息模块渲染抽离公共组件
- 自测与功能添加
