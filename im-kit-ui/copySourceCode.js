const fs = require('fs')
const readline = require('readline')
const path = require('path')
const os = require('os')

const modules = [
  'im-kit-ui',
  //   'chat-kit-ui',
  //   'common-ui',
  //   'contact-kit-ui',
  //   'conversation-kit-ui',
  //   'search-kit-ui',
]

const getCopiedPath = function (moduleName) {
  return `./node_modules/@xkit-yx/${moduleName}/`
}

const getResultPath = function (moduleName) {
  return `./src/YXUIKit/${moduleName}/`
}

/*
function replaceResolvePath(path, ccp) {
  const relativePath = ccp.replace(__dirname + '/node_modules/@xkit-yx/', '')
  const prefix = '../'.repeat(relativePath.split('/').length - 1)
  if (ccp.endsWith('.less')) {
    // 样式
    path = path.replace(`'~@xkit-yx/common-ui/es`, `'${prefix}common-ui/src`)
  }
  modules.forEach((module) => {
    // ts
    path = path.replace(`'@xkit-yx/${module}'`, `'${prefix}${module}/src'`)
    path = path.replace(`'@xkit-yx/${module}/es`, `'${prefix}${module}/src`)
    path = path.replace(`'@xkit-yx/${module}/lib`, `'${prefix}${module}/src`)
  })
  return path
}
*/

function copyFile(copiedPath, resultPath) {
  copiedPath = path.join(__dirname, copiedPath)
  resultPath = path.join(__dirname, resultPath)

  fs.copyFileSync(copiedPath, resultPath)
}

function copyFolder(copiedPath, resultPath, direct) {
  if (!direct) {
    copiedPath = path.join(__dirname, copiedPath)
    resultPath = path.join(__dirname, resultPath)
  }
  function createDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
  if (fs.existsSync(copiedPath)) {
    createDir(resultPath)
    const files = fs.readdirSync(copiedPath, { withFileTypes: true })
    for (let i = 0; i < files.length; i++) {
      const cf = files[i]
      const ccp = path.join(copiedPath, cf.name)
      const crp = path.join(resultPath, cf.name)
      if (cf.isFile()) {
        // 过滤 storybook 文件
        if (cf.name.includes('.stories.')) continue
        /**
         * @des 创建文件,使用流的形式可以读写大文件
         */
        const readStream = fs.createReadStream(ccp)
        const writeStream = fs.createWriteStream(crp)
        const readLine = readline.createInterface({
          input: readStream,
        })
        readLine.on('line', (line) => {
          //   line = replaceResolvePath(line, ccp)
          writeStream.write(line + os.EOL)
        })
      } else {
        try {
          /**
           * @des 判断读(R_OK | W_OK)写权限
           */
          fs.accessSync(path.join(crp, '..'), fs.constants.W_OK)
          copyFolder(ccp, crp, true)
        } catch (error) {
          console.log('folder write error:', error)
        }
      }
    }
  }
}
modules.forEach((module) => {
  // 复制 src
  copyFolder(getCopiedPath(module) + 'src', getResultPath(module) + 'src')
  // 复制 package.json，用于日志上报
  copyFile(
    getCopiedPath(module) + 'package.json',
    getResultPath(module) + 'package.json'
  )
})
