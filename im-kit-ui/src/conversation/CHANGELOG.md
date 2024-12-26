## v0.3.3(2023-01-17)

**Note:** Version bump only for package @xkit-yx/conversation-kit-ui

## v0.3.2(2023-01-17)

**Note:** Version bump only for package @xkit-yx/conversation-kit-ui

## v0.3.1(2022-12-27)

**Note:** Version bump only for package @xkit-yx/conversation-kit-ui

## v0.3.0(2022-12-23)

### NEW Features

- **im-kit-react-ui:** 🎸 增加自定义渲染,统一自定义渲染规范
- **workspace:** 🎸 增加好友备注
- **workspace:** 🎸 增加会话置顶;通知消息 UI 优化

## v0.2.3(2022-11-15)

**Note:** Version bump only for package @xkit-yx/conversation-kit-ui

## v0.2.2(2022-10-18)

**Note:** Version bump only for package @xkit-yx/conversation-kit-ui

## v0.2.1(2022-10-13)

**Note:** Version bump only for package @xkit-yx/conversation-kit-ui

## v0.2.0(2022-09-06)

### NEW Features

- **common-react-ui:** 🎸 增加 mobx;store 重新规划;
- **workspace:** 🎸 完成 conversation-kit 和 contact-kit 的改造

## v0.1.9(2022-08-24)

**Note:** Version bump only for package @xkit-yx/conversation-kit-ui

## v0.1.8(2022-08-19)

**Note:** Version bump only for package @xkit-yx/conversation-kit-ui

## v0.1.7(2022-08-16)

**Note:** Version bump only for package @xkit-yx/conversation-kit-ui

## v0.1.6(2022-08-16)

### Bug Fixes

- 优化和 bug 修复

## v0.1.5(2022-08-03)

### Bug Fixes

- 添加对话加载默认 loading

## v0.1.4(2022-07-29)

**Note:** Version bump only for package @xkit-yx/conversation-kit-ui

## v0.1.3(2022-07-28)

**Note:** Version bump only for package @xkit-yx/conversation-kit-ui

## v0.1.2(2022-07-27)

**Note:** Version bump only for package @xkit-yx/conversation-kit-ui

## v0.1.1(2022-07-27)

### Bug Fixes

- **workspace:** 🐛 解决幽灵依赖和无用依赖

# 0.1.0 (2022-07-26)

### Bug Fixes

- 代码整理、bug 修复
- 样式优化
- **chat-kit-react-ui:** 🐛 更换大小写
- **common-react-ui:** 🐛 修复测试 bug
- **common-react-ui:** 🐛 修复好友列表更新时机以及会话列表请求时机的问题
- **common-react-ui:** 🐛 修复自测发现的一些问题
- **common-react-ui:** 🐛 修复 common 组件互相引用没有引用样式的问题
- **common-react-ui:** 🐛 修改 deleteSessions 的 payload 类型
- **common-react-ui:** 🐛 优化 store 中 session 更新的逻辑
- **conversation-kit-react-ui:** 🐛 被移出群和群解散逻辑挪到 conversation-kit
- **conversation-kit-react-ui:** 🐛 删除多余样式
- **conversation-kit-react-ui:** 🐛 图标替换;超出文案显示省略号
- **conversation-kit-react-ui:** 🐛 修复撤回消息会话消失的问题
- **conversation-kit-react-ui:** 🐛 修复文案换行的问题
- **conversation-kit-react-ui:** 🐛 修复选中会话样式丢失;好友列表去聊天信息完善
- **conversation-kit-react-ui:** 🐛 修复 ts 报错
- **core-kit:** 🐛 relation 不再需要外部传给 avatar, avatar 内部消化
- **workspace:** 🐛 增加更新我的资料回调;增加样式引用

### NEW Features

- 路径修改
- 属性 boolean 提示 warning，修改为 number
- 添加 loading 效果、更改类型、通讯录支持自定义
- 引入调整
- 暂不添加聊天背景图
- 针对群名称、聊天头部信息添加单行省略点点点
- 自定义渲染单条消息、添加相关 item 组件导出
- **chat-kit-react-ui:** 🎸 feat:入口引入变量 less、导出引入变量 less
- chat 聊天内容区支持头像资料查看
- **common-react-ui:** 🎸 增加 im1 的实现并替换
- **conversation-kit-react-ui:** 🎸 去除会话列表点击头像出现卡片的逻辑
- **conversation-kit-react-ui:** 🎸 增加会话删除和免打扰变更事件
- **core-kit:** 🎸 迁移 nimWrapperrapper
- login、conversation 样式变量添加
- **workspace:** 🎸 国际化配置
- **workspace:** 🎸 迁移 IM UI Kit
- **workspace:** 🎸 UI Kit 增加初始化埋点

# [0.2.0] (2022-06-30)

### Bug Fixes

- **common-react-ui:** 🐛 修复测试 bug
- **common-react-ui:** 🐛 修改 deleteSessions 的 payload 类型
- **conversation-kit-react-ui:** 🐛 修复撤回消息会话消失的问题
- **conversation-kit-react-ui:** 🐛 修复选中会话样式丢失;好友列表去聊天信息完善
- **conversation-kit-react-ui:** 🐛 删除多余样式
- **conversation-kit-react-ui:** 🐛 图标替换;超出文案显示省略号
- **conversation-kit-react-ui:** 🐛 被移出群和群解散逻辑挪到 conversation-kit
- 样式优化

### NEW Features

- **conversation-kit-react-ui:** 🎸 去除会话列表点击头像出现卡片的逻辑
- **workspace:** 🎸 UI Kit 增加初始化埋点

# [0.1.0] (2022-06-30)

### Bug Fixes

- **common-react-ui:** 🐛 修复测试 bug
- **common-react-ui:** 🐛 修改 deleteSessions 的 payload 类型
- **conversation-kit-react-ui:** 🐛 修复撤回消息会话消失的问题
- **conversation-kit-react-ui:** 🐛 修复选中会话样式丢失;好友列表去聊天信息完善
- **conversation-kit-react-ui:** 🐛 删除多余样式
- **conversation-kit-react-ui:** 🐛 图标替换;超出文案显示省略号
- **conversation-kit-react-ui:** 🐛 被移出群和群解散逻辑挪到 conversation-kit
- 样式优化

### NEW Features

- **conversation-kit-react-ui:** 🎸 去除会话列表点击头像出现卡片的逻辑
- **workspace:** 🎸 UI Kit 增加初始化埋点
