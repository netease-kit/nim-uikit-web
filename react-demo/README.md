# 云信 IM UI Kit for React


### 配置项目
```typescript
// 请到下面路径的文件配置
// scr/pages/index.tsx
  const initOptions: IMAppProps = {
    appkey: "", // 请填写你的appkey
    account: "", // 请填写你的account
    token: "", // 请填写你的token
    sdkVersion: 1, // 请填写你的使用的sdk版本
  };
```
### 项目运行
```
npm install
npm run dev
```


### IM UI Kit 介绍

```
xxx（组件名称）
├── src 
│   └── YXUIKit // IM UI Kit 源码
│   └── components
│       └── IMApp // IM UI Kit使用示例
│   └── pages 
│       └── index.tsx // 项目入口
```

### 补充
建议使用 React 16 及以下版本