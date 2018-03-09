import gulp from 'gulp';
import plumber from 'gulp-plumber';
import ejs from 'gulp-ejs';
import htmlhint from 'gulp-htmlhint';
import pleeease from 'gulp-pleeease';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import bs from 'browser-sync';
import runSequence from 'run-sequence';
import csscomb from 'gulp-csscomb';
import fs from 'fs';
import webpack from 'webpack';
import webpackStream from 'webpack-stream';
import sassVariables from 'gulp-sass-variables';
import connect from 'gulp-connect-php';
import replace from 'gulp-replace-name';
import cached from 'gulp-cached';
import debug from 'gulp-debug';





const webpackDevConfig = require('./webpack.config-dev');
const browserSync = bs.create();
const ejsPass = ["dev/ejs/*.ejs", "dev/ejs/**/*.ejs", "!"+"dev/ejs/**/_*.ejs"];
const path = {
  dev: 'dev/',
  dist: 'dist/assets/',
}

gulp.task('comb', () => {
  return gulp.src([`${path.dev}scss/**/*.scss`,`!${path.dev}scss/app.scss`, `!`+`${path.dev}scss/**/_var.scss`])
    .pipe(csscomb())
    .pipe(gulp.dest(`${path.dev}scss`))
});

gulp.task('ejs', () => {
  const json = JSON.parse(fs.readFileSync('./rootPath.json'));
  return gulp.src(ejsPass)
    .pipe(plumber())
    .pipe(ejs({config: json},'',{"ext": ".html"}))
    .pipe(replace(/_php\.html/g, '.php'))
    // .pipe(htmlhint())
    // .pipe(htmlhint.reporter())
    .pipe(gulp.dest('./dist/'))
});

gulp.task('html-hint', () => {
  return gulp.src(['./dist/*.html', './dist/**/*.html'])
  .pipe(plumber())
  .pipe(htmlhint('.htmlhintrc'))
  .pipe(htmlhint.reporter());
});


gulp.task('scss', () => {
  const json = JSON.parse(fs.readFileSync('./rootPath.json'));
  return gulp.src(`${path.dev}scss/*.scss`)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sassVariables({ $path: json.root }))
    .pipe(sass())
    .pipe(pleeease({
      autoprefixer:true,
      minifier: false,
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(`${path.dist}css/`))
});

gulp.task('csscomb-init', () => {
  return gulp.src([`${path.dev}scss/**/*.scss`,`!${path.dev}scss/foundation/_var.scss`, `!${path.dev}scss/foundation/_reset.scss`])
          .pipe(plumber())
          .pipe(csscomb())
          .pipe(cached('csscomb'))
          .pipe(gulp.dest(`${path.dev}scss/`));
});

gulp.task('csscomb', () => {
  return gulp.src([`${path.dev}scss/**/*.scss`,`!${path.dev}scss/foundation/_var.scss`, `!${path.dev}scss/foundation/_reset.scss`])
          .pipe(plumber())
          .pipe(cached('csscomb'))
          .pipe(csscomb())
          .pipe(cached('csscomb'))
          .pipe(gulp.dest(`${path.dev}scss/`));
});

gulp.task('watch-comb', () => {
  runSequence(
    'csscomb',
    'scss-dev'
  );
});

gulp.task('webpack-dev', () => {
  return webpackStream(webpackDevConfig, webpack)
    .pipe(gulp.dest(`${path.dist}js/`));
});

// サーバー立ち上げ
gulp.task('serve', () => {
  connect.server({
    port: 8001,
    base: 'dist',
  }, function () {
    bs({
      port: 8000,
      proxy: 'localhost:8001',
      notify: true,
    });
  });
});

// ブラウザリロード
gulp.task('bs-reload', () => {
    bs.reload();
});

gulp.task("html", () => {
  return runSequence(
    'ejs',
    'bs-reload'
  );
});

gulp.task('css', () => {
  return runSequence(
    'csscomb',
    'scss',
    // 'bs-reload'
  );
});

gulp.task("js", () => {
  return runSequence(
    'webpack-dev',
    'bs-reload'
  );
});

gulp.task("init", () => {
  return runSequence(
    ['ejs', 'scss','js'],
    'serve'
  );
});

gulp.task("image", () => {
  return gulp.src(`${path.dev}img/*`)
    .pipe(gulp.dest(`${path.dist}img/`))
});
gulp.task("font", () => {
  return gulp.src(`${path.dev}font/*.woff`)
    .pipe(gulp.dest(`${path.dist}font/`))
});

gulp.task("publish", () => {
  return runSequence(
    'csscomb-init',
    ['ejs', 'scss','webpack-dev','image','font'],
  );
});

gulp.task('default', ['init'], () => {
  gulp.watch([`${path.dev}ejs/*.ejs`, `${path.dev}ejs/**/*.ejs`], ['html']);
  gulp.watch(`${path.dev}scss/**/*.scss`, ['css']);
  gulp.watch(`${path.dev}js/**/*.js`, ['js']);
  gulp.watch(['dist/*.html', 'dist/**/*.html'], ['html-hint']);

});
