const { watch, src, dest, parallel, series } = require('gulp');
const rename = require("gulp-rename");
const handlebars = require('gulp-compile-handlebars');
const sass = require('gulp-sass');
const minifyCSS = require('gulp-csso');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const babel = require('gulp-babel');
const del = require('del');
const browserify = require('gulp-browserify');
const replace = require('gulp-replace');
const uglify = require('gulp-uglify');
const autoprefixer = require('autoprefixer')
const sourcemaps = require('gulp-sourcemaps')
const postcss = require('gulp-postcss')

const siteData = require('./src/config');


let settings = {
  sourceDir: 'src',
  outputDir: 'dist',
  styleSheetName: 'styles',
  scriptName: 'script',
  timeStamp: new Date().getTime()
}

settings.styleSheetName = `${settings.styleSheetName}${settings.timeStamp}.css`;
settings.scriptName = `${settings.scriptName}${settings.timeStamp}.js`;

let watcherHB;
let watcherSCSS;
let watcherJS;
let watcherIMG;

function clean(){
  if(process.env.NODE_ENV == 'dev'){
    return del([
      '.serve/**/*',
    ]);
  }else{
    return del([
      'dist/**/*',
    ]);
  }

}


function serve(){
  browserSync.init({
    server: {
        baseDir: "./.serve"
    }
  });

  watcherHB.on('change', series(html,images,browserSync.reload));
  watcherSCSS.on('change', series(css));
  watcherJS.on('change', series(js,browserSync.reload));
  // watcherIMG.on('change', series(images,browserSync.reload));
}


function html() {

  options = {
    batch : ['./src/partials'],
    // helpers : {
    //     capitals : function(str){
    //         return str.toUpperCase();
    //     }
    // }
}

  return src(settings.sourceDir + '/html/**/*.handlebars')
  .pipe(handlebars(siteData.default.data, options))
  .pipe(rename(function(path) {
      path.extname = '.html';
  }))
  .pipe(dest(settings.outputDir));
}

function htmlPROD() {

  options = {
    batch : ['./src/partials'],
    // helpers : {
    //     capitals : function(str){
    //         return str.toUpperCase();
    //     }
    // }
}

  return src(settings.sourceDir + '/html/**/*.handlebars')
  .pipe(handlebars(siteData.default.data, options))
  .pipe(replace('styles.css', settings.styleSheetName))
  .pipe(replace('script.js', settings.scriptName))
  .pipe(rename(function(path) {
      path.extname = '.html';
  }))
  .pipe(dest(settings.outputDir));
}


function css() {
  return src(settings.sourceDir + '/scss/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([ autoprefixer() ]))
    .pipe(minifyCSS())
    .pipe(dest(settings.outputDir + '/css'))
    .pipe(browserSync.stream());
}

function cssPROD() {
  return src(settings.sourceDir + '/scss/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.init())
    .pipe(postcss([ autoprefixer() ]))
    .pipe(sourcemaps.write('.'))
    .pipe(minifyCSS())
    .pipe(rename(settings.styleSheetName))
    .pipe(dest(settings.outputDir + '/css'))
}


function js() {
  return src([
    settings.sourceDir + '/js/*.js'
    ], { sourcemaps: true })
    .pipe(babel({presets: ['@babel/env']}))
    .pipe(browserify())
    .pipe(concat('script.js'))
    .pipe(dest(settings.outputDir + '/js', { sourcemaps: true }))
}

function jsPROD() {
  return src([
    settings.sourceDir + '/js/*.js'
    ], { sourcemaps: true })
    .pipe(babel({presets: ['@babel/env']}))
    .pipe(browserify())
    .pipe(uglify())
    .pipe(concat(settings.scriptName))
    .pipe(dest(settings.outputDir + '/js', { sourcemaps: true }))
}

function images() {
  return src(settings.sourceDir + '/images/*')
    .pipe(dest(settings.outputDir + '/images'))
}


function imagesWithCompression() {
  return src(settings.sourceDir + '/images/*')
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.mozjpeg({quality: 75, progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({
          plugins: [
              {removeViewBox: true},
              {cleanupIDs: false}
          ]
      })
  ]))
    .pipe(dest(settings.outputDir + '/images'))
}

function dev(cb){
  process.env.NODE_ENV = 'dev';

  settings.outputDir = './.serve';

  watcherHB = watch(['src/**/*.handlebars']);
  watcherSCSS = watch(['src/scss/**/*.scss']);
  watcherJS = watch(['src/js/**/*.js']);
  watcherIMG = watch(['src/images/*']);
  
  cb();
}

exports.default = series(dev, clean, html, css, js, images, serve);
exports.build = parallel(clean, htmlPROD, cssPROD, jsPROD, imagesWithCompression);