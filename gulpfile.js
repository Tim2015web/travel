const { task, src, dest, parallel, series, watch } = require('gulp');
const plumber = require('gulp-plumber');
const { onError } = require('gulp-notify');
const webpack = require('webpack-stream');
const changed = require('gulp-changed');
const fileInclude = require('gulp-file-include');
const sass = require('gulp-sass')(require('sass'));
const sourceMaps = require('gulp-sourcemaps');
const groupMedia = require('gulp-group-css-media-queries');
const sassGlob = require('gulp-sass-glob');
// const babel = require('gulp-babel'); // JS для старых браузеров
// const imagemin = require('gulp-imagemin'); // Оптимизатор картинок
const server = require('gulp-server-livereload');
const clean = require('gulp-clean');
const fs = require('fs');
const autoprefixer = require('gulp-autoprefixer');
const csso = require('gulp-csso');
const htmlclean = require('gulp-htmlclean');
const webp = require('gulp-webp');
const ttf2woff2 = require('gulp-ttf2woff2');
const fonter = require('gulp-fonter');

// Обработки html
task('html', function () {
  return src(['./src/pages/**/*.html', '!./src/pages/components/*'])
    .pipe(changed('./build/', { hasChanged: changed.compareContents })) // Проверка новых файлов
    .pipe(plumber({ errorHandler: onError() }))
    .pipe(fileInclude({ prefix: '@@', basepath: '@file' }))
    .pipe(dest('./build/'))
});

// Обработки html (production)
task('html:prod', function () {
  return src(['./src/pages/**/*.html', '!./src/pages/components/*'])
    .pipe(changed('./docs/', { hasChanged: changed.compareContents })) // Проверка новых файлов
    .pipe(plumber({ errorHandler: onError() }))
    .pipe(fileInclude({ prefix: '@@', basepath: '@file' }))
    .pipe(htmlclean())
    .pipe(dest('./docs/'))
});

// Обработки CSS
task('sass', function () {
  return src('./src/scss/*.scss')
    .pipe(changed('./build/css/')) // Проверка новых файлов
    .pipe(plumber({ errorHandler: onError() }))
    .pipe(sourceMaps.init())
    .pipe(sassGlob())
    .pipe(groupMedia()) // Включить для оптимизации медиа запросов
    .pipe(sass())
    .pipe(sourceMaps.write())
    .pipe(dest('./build/css/'))
});

// Обработки CSS (production)
task('sass:prod', function () {
  return src('./src/scss/*.scss')
    .pipe(changed('./docs/css/')) // Проверка новых файлов
    .pipe(plumber({ errorHandler: onError() }))
    .pipe(sourceMaps.init())
    .pipe(autoprefixer())
    .pipe(sassGlob())
    .pipe(groupMedia()) // Включить для оптимизации медиа запросов
    .pipe(sass())
    .pipe(csso())
    .pipe(sourceMaps.write())
    .pipe(dest('./docs/css/'))
});

// Обработка JavaScript
task('js', function () {
  return src('./src/js/*.js')
    .pipe(changed('./build/js/')) // Проверка новых файлов
    .pipe(plumber({ errorHandler: onError() }))
    // .pipe(babel())
    .pipe(webpack(require('./webpack.config.js')))
    .pipe(dest('./build/js/'))
});

// Обработка JavaScript (production)
task('js:prod', function () {
  return src('./src/js/*.js')
    .pipe(changed('./docs/js/')) // Проверка новых файлов
    .pipe(plumber({ errorHandler: onError() }))
    // .pipe(babel())
    .pipe(webpack(require('./webpack.config.js')))
    .pipe(dest('./docs/js/'))
});

// Экспорт изображений
task('images', function () {
  return src(['./src/assets/images/**/*', '!./src/assets/images/**/*.webp'])
    .pipe(changed('./build/images/')) // Проверка новых файлов
    .pipe(webp()) // Конвертер в webp {quality: 50}
    // .pipe(imagemin({ verbose: true })) // Оптимизация изображений jpg
    .pipe(src('./src/assets/images/**/*.webp'))
    .pipe(dest('./build/images/'))
});

// Экспорт изображений (production)
task('images:prod', function () {
  return src(['./src/assets/images/**/*', '!./src/assets/images/**/*.webp'])
    .pipe(changed('./docs/images/')) // Проверка новых файлов
    .pipe(webp()) // Конвертер в webp
    // .pipe(imagemin({ verbose: true })) // Оптимизация изображений jpg
    .pipe(src('./src/assets/images/**/*.webp'))
    .pipe(dest('./docs/images/'))
});

// Экспорт иконок
task('icons', function () {
  return src('./src/assets/icons/**/*')
    .pipe(changed('./build/icons/')) // Проверка новых файлов
    .pipe(dest('./build/icons/'))
});

// Экспорт иконок (production)
task('icons:prod', function () {
  return src('./src/assets/icons/**/*')
    .pipe(changed('./docs/icons/')) // Проверка новых файлов
    .pipe(dest('./docs/icons/'))
});

// Экспорт шрифтов
task('fonts', function () {
  return src('./src/assets/fonts/*.*')
    .pipe(changed('./build/fonts/')) // Проверка новых файлов
    .pipe(fonter({ formats: ['woff', 'ttf'] }))
    .pipe(src('./src/assets/fonts/*.ttf'))
    .pipe(changed('./build/fonts/')) // Проверка новых файлов
    .pipe(ttf2woff2())
    .pipe(dest('./build/fonts/'))
});

// Экспорт шрифтов (production)
task('fonts:prod', function () {
  return src('./src/assets/fonts/*.ttf')
    .pipe(changed('./docs/fonts/')) // Проверка новых файлов
    .pipe(dest('./docs/fonts/'))
});

// Экспорт файлов
task('data', function () {
  return src('./src/assets/data/**/*')
    .pipe(changed('./build/data/')) // Проверка новых файлов    
    .pipe(ttf2woff2())
    .pipe(dest('./build/data/'))
});

// Экспорт файлов (production)
task('data:prod', function () {
  return src('./src/assets/data/**/*')
    .pipe(changed('./docs/data/')) // Проверка новых файлов    
    .pipe(dest('./docs/data/'))
});

// Сервер
task('server', function () {
  return src('./build/').pipe(server({ livereload: true, open: true }))
});

// Сервер (production)
task('server:prod', function () {
  return src('./docs/').pipe(server({ livereload: true, open: true }))
});

// Очистка build
task('clean', function (done) {
  if (fs.existsSync('./build/'))
    return src('./build/', { read: false }).pipe(clean({ force: true }))
  done();
});

// Очистка docs (production)
task('clean:prod', function (done) {
  if (fs.existsSync('./docs/'))
    return src('./docs/', { read: false }).pipe(clean({ force: true }))
  done();
});

// Слежение за файлами
task('watch', function () {
  watch('./src/**/*.html', parallel('html'));
  watch('./src/scss/**/*.scss', parallel('sass'));
  watch('./src/js/**/*.js', parallel('js'));
  watch('./src/assets/images/**/*', parallel('images'));
  watch('./src/assets/icons/**/*', parallel('icons'));
  watch('./src/assets/fonts/**/*', parallel('fonts'));
  watch('./src/assets/data/**/*', parallel('data'));
});

// Режим разработки
task('default',
  series('clean',
    parallel('html', 'sass', 'js', 'images', 'icons', 'fonts', 'data'),
    parallel('server', 'watch')));

// Режим сборки
task('production',
  series('clean:prod',
    parallel('html:prod', 'sass:prod', 'js:prod', 'images:prod', 'icons:prod', 'fonts:prod', 'data:prod'),
    parallel('server:prod')));