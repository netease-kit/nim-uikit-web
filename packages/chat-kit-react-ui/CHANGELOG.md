# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits] for commit guidelines.

## [0.1.1] (2022-07-26)

### Bug Fixes

- 样式添加、依赖添加

# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits] for commit guidelines.

# 0.1.0 (2022-07-26)

### Bug Fixes

- 测试 bug 修复
- 代码整理、bug 修复
- 当场景变化时清除设置内容
- 更改容器宽度
- 历史记录功能传参修正、store 从 common 迁移、发送 bug 修复
- 历史记录去重重复元素
- 历史记录问题、滚动问题修复
- 群信息兜底展示 teamId、更新成员 account 替换
- 删除无关依赖包
- 上传图片和文件添加 loading、创建群聊头像默认选中等
- 提示修改
- 添加非重复 key、滚动位置逻辑添加
- 修复 sdk 事件监听 bug
- 样式优化
- 移除群成员和添加群成员增加提示
- 引用变量修改
- **chat-kit-react-ui:** 🐛 发送已读回执没有达到想象中的效果,先屏蔽
- **chat-kit-react-ui:** 🐛 发送自定义内容改为发送文本
- **chat-kit-react-ui:** 🐛 更换大小写
- **chat-kit-react-ui:** 🐛 冒烟测试
- **chat-kit-react-ui:** 🐛 删除无用逻辑
- **chat-kit-react-ui:** 🐛 删除 debugger
- **chat-kit-react-ui:** 🐛 文件删除
- **chat-kit-react-ui:** 🐛 修复历史记录死循环的问题
- **common-react-ui:** 🐛 修改 deleteSessions 的 payload 类型
- **common-react-ui:** 🐛 优化 store 中 session 更新的逻辑
- **conversation-kit-react-ui:** 🐛 被移出群和群解散逻辑挪到 conversation-kit
- **core-kit:** 🐛 IM1 兼容; chat-kit 交互增加 toast
- **core-kit:** 🐛 relation 不再需要外部传给 avatar, avatar 内部消化
- eslint 修复
- **workspace:** 🐛 增加更新我的资料回调;增加样式引用

### Features

- 部分主题补充、支持 prefix 统一样式前缀
- 初步代码和功能迁移
- 单聊/群聊功能完善
- 对象赋值放到函数组件外部，避免每次赋值重新触发依赖
- 发送内容格式保留
- 发送自定义消息支持 im1 和 im2
- 分页加载、发送内容支持换行展示、icon 更换
- 公共方法抽离
- 公共组件添加 commonPrefix
- 滚动逻辑和撤回问题排查
- 滚动逻辑整理优化
- 历史记录函数和清空逻辑依赖为切换会话 id 触发
- 历史消息和黑名单逻辑添加
- 路径修改
- 冒烟用例自测 fix
- 去掉自动提示框
- 群聊功能完善
- 删除定义
- 适配 m1 功能 API 和群聊功能初步提交
- 属性 boolean 提示 warning，修改为 number
- 添加多端头像更新逻辑
- 添加 loading 效果、更改类型、通讯录支持自定义
- 添加 type，防止群信息中有相同字段进行覆盖
- 头像选择更新方法事件等删除
- 图片文件、重发等支持 catch 黑名单
- 消息模块渲染抽离公共组件
- 暂不添加聊天背景图
- 增加变量样式
- 针对群名称、聊天头部信息添加单行省略点点点
- 支持更换个人头像更换用户 chat 个人信息
- 重发消息前更新消息状态为 sending
- 主动离群功能、删除 2 次确认等功能添加
- 自测修复、优化、状态迁移
- 自测与功能添加
- 自定义渲染单条消息、添加相关 item 组件导出
- 自定义样式 chat 模块初步提交
- any 修改
- **call-kit:** 🎸 chat-kit 增加国际化配置
- chat kit 上下文状态文档添加
- chat kit 文档补充
- **chat-kit-react-ui:** 🎸 feat:入口引入变量 less、导出引入变量 less
- chat 聊天内容区支持头像资料查看
- chat 文档添加 context、支持传入会话等
- chatContainer 文档
- **common-react-ui:** 🎸 增加 im1 的实现并替换
- **common-react-ui:** 🎸 增加 useStateContext
- **core-kit:** 🎸 迁移 nimWrapperrapper
- font-size 和 border-radius 抽离定义
- im1 事件功能添加
- login、conversation 样式变量添加
- message-item 抽离单个组件
- settingBar 清空方法抽离
- **workspace:** 🎸 迁移 IM UI Kit
- **workspace:** 🎸 UI Kit 增加初始化埋点

# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits] for commit guidelines.

# [0.2.0] (2022-06-30)

### Bug Fixes

- **chat-kit-react-ui:** 🐛 修复历史记录死循环的问题
- **chat-kit-react-ui:** 🐛 冒烟测试
- **chat-kit-react-ui:** 🐛 删除 debugger
- **chat-kit-react-ui:** 🐛 发送已读回执没有达到想象中的效果,先屏蔽
- **common-react-ui:** 🐛 修改 deleteSessions 的 payload 类型
- **conversation-kit-react-ui:** 🐛 被移出群和群解散逻辑挪到 conversation-kit
- **core-kit:** 🐛 IM1 兼容; chat-kit 交互增加 toast
- 修复 sdk 事件监听 bug
- 历史记录功能传参修正、store 从 common 迁移、发送 bug 修复
- 历史记录去重重复元素
- 历史记录问题、滚动问题修复
- 引用变量修改
- 当场景变化时清除设置内容
- 提示修改
- 更改容器宽度
- 样式优化
- 测试 bug 修复
- 添加非重复 key、滚动位置逻辑添加
- 移除群成员和添加群成员增加提示

### Features

- **workspace:** 🎸 UI Kit 增加初始化埋点
- 主动离群功能、删除 2 次确认等功能添加
- 公共方法抽离
- 冒烟用例自测 fix
- 分页加载、发送内容支持换行展示、icon 更换
- 删除定义
- 历史消息和黑名单逻辑添加
- 发送内容格式保留
- 图片文件、重发等支持 catch 黑名单
- 消息模块渲染抽离公共组件
- 滚动逻辑和撤回问题排查
- 滚动逻辑整理优化
- 自测与功能添加
- 重发消息前更新消息状态为 sending

# [0.1.0] (2022-06-30)

### Bug Fixes

- **chat-kit-react-ui:** 🐛 修复历史记录死循环的问题
- **chat-kit-react-ui:** 🐛 冒烟测试
- **chat-kit-react-ui:** 🐛 删除 debugger
- **chat-kit-react-ui:** 🐛 发送已读回执没有达到想象中的效果,先屏蔽
- **common-react-ui:** 🐛 修改 deleteSessions 的 payload 类型
- **conversation-kit-react-ui:** 🐛 被移出群和群解散逻辑挪到 conversation-kit
- **core-kit:** 🐛 IM1 兼容; chat-kit 交互增加 toast
- 修复 sdk 事件监听 bug
- 历史记录功能传参修正、store 从 common 迁移、发送 bug 修复
- 历史记录去重重复元素
- 历史记录问题、滚动问题修复
- 引用变量修改
- 当场景变化时清除设置内容
- 提示修改
- 更改容器宽度
- 样式优化
- 测试 bug 修复
- 添加非重复 key、滚动位置逻辑添加
- 移除群成员和添加群成员增加提示

### Features

- **workspace:** 🎸 UI Kit 增加初始化埋点
- 主动离群功能、删除 2 次确认等功能添加
- 公共方法抽离
- 冒烟用例自测 fix
- 分页加载、发送内容支持换行展示、icon 更换
- 删除定义
- 历史消息和黑名单逻辑添加
- 发送内容格式保留
- 图片文件、重发等支持 catch 黑名单
- 消息模块渲染抽离公共组件
- 滚动逻辑和撤回问题排查
- 滚动逻辑整理优化
- 自测与功能添加
- 重发消息前更新消息状态为 sending
