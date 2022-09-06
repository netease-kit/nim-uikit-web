# nim-uikit-web

网易云信 xkit-yx 库。

## 快速启动

项目使用 lerna + yarn workspace 进行多包和依赖管理，因此需要先全局安装 lerna 和 yarn

### 全局安装 lerna

```sh
$ npm i lerna -g
```

### 全局安装 yarn

```sh
$ npm i yarn -g
```

### 安装项目依赖

```sh
$ yarn bootstrap
```

### 配置 HTTPS 秘钥
在根目录下创建 `ssl` 文件夹，并在其中中放入您的 https 秘钥证书：`cert.crt`、`cert.pem`、`key.pem`

### 开发调试

```sh
$ yarn start
```

### 打包编译

```sh
$ yarn build
```
