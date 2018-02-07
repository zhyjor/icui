var path = require('path');
var fs = require('fs');
var gulp = require('gulp');
var less = require('gulp-less');
//add a header to files in the pipeline
var header = require('gulp-header');
// Easiest way to tap into a pipeline
// 最简单打通管道的方法，可以用来遍历gulp.src()指定的那些文件；利用这个特性，以及npm下
// 自带的path插件，既可以获取到每个文件的文件名。
var tap = require('gulp-tap');
// Minify CSS with cssnano（压缩css文件）
var nano = require('gulp-cssnano');
// 加工css
var postcss = require('gulp-postcss');
// 自动前缀
var autoprefixer = require('autoprefixer');
// Discard comments in your CSS files with PostCSS. 丢弃注释
var comments = require('postcss-discard-comments');
// 重命名
var rename = require('gulp-rename');
// source map
var sourcemaps = require('gulp-sourcemaps');
// 浏览器同步测试工具，快速响应更改
var browserSync = require('browser-sync');
var pkg = require('./package.json');
// 自定义命令行工具
var yargs = require('yargs').options({
  w: {
    alias: 'watch',
    type: 'boolean'
  },
  s: {
    alias: 'server',
    type: 'boolean'
  },
  p: {
    alias: 'port',
    type: 'number'
  }
}).argv;

var option = { base: 'src' };
var dist = __dirname + '/dist';

gulp.task('build:style', function() {
  var banner = [
    '/*!',
    ' * WeUI v<%= pkg.version %> (<%= pkg.homepage %>)',
    ' * Copyright <%= new Date().getFullYear() %> Tencent, Inc.',
    ' * Licensed under the <%= pkg.license %> license',
    ' */',
    ''
  ].join('\n');
  gulp
    .src('src/style/weui.less', option)
    .pipe(sourcemaps.init())
    .pipe(
      less().on('error', function(e) {
        console.error(e.message);
        this.emit('end');
      })
    )
    .pipe(postcss([autoprefixer(['iOS >= 7', 'Android >= 4.1']), comments()]))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(dist))
    .pipe(browserSync.reload({ stream: true }))
    .pipe(
      nano({
        zindex: false,
        autoprefixer: false
      })
    )
    .pipe(
      rename(function(path) {
        path.basename += '.min';
      })
    )
    .pipe(gulp.dest(dist));
});

gulp.task('build:example:assets', function() {
  gulp
    .src('src/example/**/*.?(png|jpg|gif|js)', option)
    .pipe(gulp.dest(dist))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('build:example:style', function() {
  gulp
    .src('src/example/example.less', option)
    .pipe(
      less().on('error', function(e) {
        console.error(e.message);
        this.emit('end');
      })
    )
    .pipe(postcss([autoprefixer(['iOS >= 7', 'Android >= 4.1'])]))
    .pipe(
      nano({
        zindex: false,
        autoprefixer: false
      })
    )
    .pipe(gulp.dest(dist))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('build:example:html', function() {
  gulp
    .src('src/example/index.html', option)
    .pipe(
      tap(function(file) {
        var dir = path.dirname(file.path);
        var contents = file.contents.toString();
        contents = contents.replace(
          /<link\s+rel="import"\s+href="(.*)">/gi,
          function(match, $1) {
            var filename = path.join(dir, $1);
            var id = path.basename(filename, '.html');
            var content = fs.readFileSync(filename, 'utf-8');
            return (
              '<script type="text/html" id="tpl_' +
              id +
              '">\n' +
              content +
              '\n</script>'
            );
          }
        );
        file.contents = new Buffer(contents);
      })
    )
    .pipe(gulp.dest(dist))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('build:example', [
  'build:example:assets',
  'build:example:style',
  'build:example:html'
]);

gulp.task('release', ['build:style', 'build:example']);

gulp.task('watch', ['release'], function() {
  gulp.watch('src/style/**/*', ['build:style']);
  gulp.watch('src/example/example.less', ['build:example:style']);
  gulp.watch('src/example/**/*.?(png|jpg|gif|js)', ['build:example:assets']);
  gulp.watch('src/**/*.html', ['build:example:html']);
});

gulp.task('server', function() {
  yargs.p = yargs.p || 8080;
  browserSync.init({
    server: {
      baseDir: './dist'
    },
    ui: {
      port: yargs.p + 1,
      weinre: {
        port: yargs.p + 2
      }
    },
    port: yargs.p,
    startPath: '/example'
  });
});

// 参数说明
//  -w: 实时监听
//  -s: 启动服务器
//  -p: 服务器启动端口，默认8080
gulp.task('default', ['release'], function() {
  if (yargs.s) {
    gulp.start('server');
  }

  if (yargs.w) {
    gulp.start('watch');
  }
});
