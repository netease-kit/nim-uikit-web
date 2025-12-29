网易云信即时通讯界面组件（简称 IM UIKit）是基于 [NIM SDK（网易云信 IM SDK）](https://doc.yunxin.163.com/messaging2/concept/DI0Nzc2NzA?platform=client) 开发的一款即时通讯 UI 组件库，包括聊天、会话、圈组、搜索、通讯录、群管理等组件。通过 IM UIKit，您可快速集成包含 UI 界面的即时通讯应用。

## 适用客群

IM UIKit 简化了基于 NIM SDK 的应用开发过程，适合需要快速集成和定制即时通讯功能的开发者和企业客户。它不仅能助您快速实现 UI 功能，也支持调用 NIM SDK 相应的接口实现即时通讯业务逻辑和数据处理。因此，您在使用 IM UIKit 时仅需关注自身业务或个性化扩展。

<img alt="image.png" src="https://yx-web-nosdn.netease.im/common/97303b4e1105d33afaf2bc65af6cbdf2/image.png" style="width:65%;border: 1px solid #BFBFBF;">

## 主要功能

IM UIKit 主要分为会话、群组、联系人等几个 UI 子组件，每个 UI 组件负责展示不同的内容。更多详情，请参考 [功能概览](https://doc.yunxin.163.com/messaging-uikit/concept/zMzMDQ2MTg?platform=client) 和 [UI 组件介绍](https://doc.yunxin.163.com/messaging-uikit/concept/TI3NTgyNDA?platform=client)。

## 功能优势

### 组件解耦

IM UIKit 不同组件可相互独立运行使用。您可按需选择组件，将其快速集成到您的应用，实现相应的 UI 功能，减少无用依赖。

### 自定义能力

IM UIKit 提供 hooks 函数，以便用户获取内部状态进行一些自定义操作。另外还提供多个自定义渲染函数以及自定义主题修改，以供开发者自行定制 UI。另外还提供完善的语言设置功能，帮助开发者快速定制专属文案。

### 业务逻辑处理

IM UIKit 业务逻辑层提供完善的业务逻辑处理能力。您无需关心 SDK 层不同接口间的复杂处理逻辑，业务逻辑层一个接口帮您搞定所有。

## 工作原理

IM UIKit 提供了多个 UI 组件，您可以自行选择并组合，内部管理了各个组件之间的状态，利用单向数据流来驱动 UI 更新与渲染。

<img alt="app_structure.drawio.png" src="https://yx-web-nosdn.netease.im/common/aa16d3bba199e56f8d92a95d65b20ef4/app_structure.drawio.png" style="width:60%;border: 1px solid #BFBFBF;">

## 配置项目

// 请到下面路径的文件配置 appkey、account、token

```javascript
// src/App.vue
this.init({
  appkey: "", // 请填写你的 appkey
  account: "", // 请填写你的 account
  token: "", // 请填写你的 token
});
```

## 项目运行

npm install
</br>
npm run dev
