var gulp = require('gulp');
var webpack = require('gulp-webpack');
var webpackConfig = require('./webpack.config');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var named = require('vinyl-named');
var _ = require('lodash');

var watch = false;
var src = {};

function webpackBuild(opts) {
  return gulp.src(['client/js/app.js'])
    .pipe(named())
    .pipe(webpack(_.extend({
        output: {
            filename: '[name].bundle.js',
        },
    }, webpackConfig, opts)))
    .pipe(gulp.dest('public/js'));
}

gulp.task('webpack:client', function() {
  return webpackBuild();
});

gulp.task('webpack:client:watch', function() {
  return webpackBuild({
    watch: true,
    devtool: 'sourcemap'
  });
});

gulp.task('copy:html', function () {
  src.html = './client/html/**/*.html';
  return gulp.src(src.html, { base: './client/html/'})
    .pipe(gulp.dest('./public'))
})

gulp.task('copy:html:watch', ['copy:html'], function () {
  return gulp.watch(src.html, function(obj){
    if( obj.type === 'changed') {
      gulp.src( obj.path, { "base": "./client/html/"})
        .pipe(gulp.dest('./public'));
    }
  })
});

// Launch a lightweight HTTP Server
gulp.task('serve',
function () {
  return browserSync({
    port: 8050,
    notify: true,
    server: {
      baseDir: ['public']
    }
  });
});

gulp.task('build:client',['copy:html', 'webpack:client']);
gulp.task('build:client:watch', ['copy:html:watch', 'webpack:client:watch']);
gulp.task('serve:dev', ['copy:html:watch', 'webpack:client:watch', 'serve']);