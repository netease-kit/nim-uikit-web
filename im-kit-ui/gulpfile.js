const gulp = require('gulp')
const ts = require('gulp-typescript')
const less = require('gulp-less')
const rename = require('gulp-rename')
const through = require('through2')
const del = require('del')

gulp.task('ts-js', async function () {
  const sourcePaths = [
    'src/**/*+(.ts|.tsx)',
    'package.json',
    '!src/**/*.stories.tsx',
    '!src/**/*.stories.mdx',
    '!src/**/*.stories.prod.tsx',
    '!src/**/*.stories.prod.mdx',
  ]
  await gulp
    .src(sourcePaths)
    .pipe(
      ts.createProject('./tsconfig.json', {
        module: 'esnext',
      })()
    )
    .pipe(gulp.dest('es'))
  await gulp
    .src(sourcePaths)
    .pipe(
      ts.createProject('./tsconfig.json', {
        module: 'commonjs',
      })()
    )
    .pipe(gulp.dest('lib'))
})

gulp.task('style', async function () {
  // // copy less files
  await gulp
    .src('src/**/*.less')
    .pipe(gulp.dest('lib'))
    .pipe(gulp.dest('es'), { end: true })
  // compile less files
  await gulp
    .src('src/**/*.less')
    .pipe(
      less({
        javascriptEnabled: true,
        plugins: [new (require('less-plugin-npm-import'))({ prefix: '~' })],
      })
    )
    .pipe(gulp.dest('lib'))
    .pipe(gulp.dest('es'))
  //  css.js reference files
  const streamTransform = through.obj(function (file, _, cb) {
    const content = file.contents.toString()
    const newContent = content
      .replace(/\.less/g, '.css')
      .replace(/style\'/g, "style/css'")
    file.contents = Buffer.from(newContent)
    cb(null, file)
  })
  await gulp
    .src(['src/**/style/index.ts'])
    .pipe(rename({ basename: 'css' }))
    .pipe(streamTransform)
    .pipe(
      ts.createProject('./tsconfig.json', {
        module: 'esnext',
      })()
    )
    .pipe(gulp.dest('es'))
  await gulp
    .src(['src/**/style/index.ts'])
    .pipe(rename({ basename: 'css' }))
    .pipe(streamTransform)
    .pipe(
      ts.createProject('./tsconfig.json', {
        module: 'commonjs',
      })()
    )
    .pipe(gulp.dest('lib'))
})

gulp.task('clean', function () {
  return del(['es', 'lib'])
})

gulp.task('default', gulp.series('clean', gulp.parallel(['ts-js', 'style'])))

gulp.task('watch', function () {
  gulp.watch(
    [
      'src/**/*+(.ts|.tsx)',
      '!src/**/*.stories.tsx',
      '!src/**/*.stories.mdx',
      '!src/**/*.stories.prod.tsx',
      '!src/**/*.stories.prod.mdx',
    ],
    gulp.parallel(['ts-js'])
  )
  gulp.watch(['src/**/*.less'], gulp.parallel(['style']))
})
