const { src, dest, watch, parallel } = require("gulp");

const scss = require("gulp-sass")(require("sass")); // Препроцессор SASS
const concat = require("gulp-concat"); // Объединение файлов в один
const uglify = require("gulp-uglify-es").default; // Минификация
const browserSync = require("browser-sync").create(); // Разработка в реальном времени
const autoprefixer = require("gulp-autoprefixer"); // Поддержка свойств в старых браузерах
const clean = require("gulp-clean"); // Удаление файлов и папок

function scripts() {
  return src([
    "src/js/main.js",
    "src/js/*.js",
    "!src/js/main.min.js", // ! - исключение файла
  ])
    .pipe(concat("main.min.js"))
    .pipe(uglify())
    .pipe(dest("src/js"))
    .pipe(browserSync.stream());
}

function styles() {
  return src("src/scss/style.scss")
    .pipe(autoprefixer({ overrideBrowserslist: ["last 10 version"] }))
    .pipe(concat("style.min.css"))
    .pipe(scss({ outputStyle: "compressed" }))
    .pipe(dest("src/css/"))
    .pipe(browserSync.stream());
}

function watching() {
  watch(["src/scss/style.scss"], styles);
  watch(["src/js/main.js"], scripts);
  watch(["src/**/*.html"]).on("change", browserSync.reload);
}

function browsersync() {
  browserSync.init({
    server: {
      baseDir: "src/",
    },
  });
}

function cleanDist() {
  return src("dist").pipe(clean());
}

function building() {
  return src(["src/css/style.min.css", "src/js/main.min.js", "src/**/*.html"], {
    base: "src",
  }).pipe(dest("dist"));
}

exports.styles = styles;
exports.scripts = scripts;
exports.watching = watching;
exports.browsersync = browsersync;

exports.build = parallel(clean, building);
exports.default = parallel(styles, scripts, browsersync, watching);
