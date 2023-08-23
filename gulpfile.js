const { src, dest, watch, parallel, series } = require("gulp");

const scss = require("gulp-sass")(require("sass")); // Препроцессор SASS
const concat = require("gulp-concat"); // Объединение файлов в один
const uglify = require("gulp-uglify-es").default; // Минификация
const browserSync = require("browser-sync").create(); // Разработка в реальном времени
const autoprefixer = require("gulp-autoprefixer"); // Поддержка свойств в старых браузерах
const clean = require("gulp-clean"); // Удаление файлов и папок
const avif = require("gulp-avif"); // Конвертация изображений в .avif
const webp = require("gulp-webp"); // Конвертация изображений в .webp
const imagemin = require("gulp-imagemin"); // Конвертация изображений в .jpg
const svgSprite = require("gulp-svg-sprite"); // Работа с svg
const newer = require("gulp-newer"); // "Кэш" изображений
const fonter = require("gulp-fonter"); // Преобразование .ttf в .woff2
const ttf2woff2 = require("gulp-ttf2woff2"); // Преобразование .ttf в .woff2
const include = require("gulp-include");
const babel = require("gulp-babel");
const hash = require("gulp-hash-filename");
const rename = require("gulp-rename");

function pages() {
  return src("src/pages/*.html")
    .pipe(
      include({
        includePaths: "src/components",
      })
    )
    .pipe(dest("src"))
    .pipe(browserSync.stream());
}

function fonts() {
  return src("src/fonts/src/*.*")
    .pipe(
      fonter({
        formats: ["woff", "ttf"],
      })
    )
    .pipe(src("src/fonts/*.ttf"))
    .pipe(ttf2woff2())
    .pipe(dest("src/fonts"));
}

function images() {
  return src(["src/images/src/*.*", "!src/images/src/*.svg"])
    .pipe(newer("src/images"))
    .pipe(avif({ quality: 50 }))

    .pipe(src("src/images/src/*.*"))
    .pipe(newer("src/images"))
    .pipe(webp())

    .pipe(src("src/images/src/*.*"))
    .pipe(newer("src/images"))
    .pipe(imagemin())

    .pipe(dest("src/images"));
}

function sprite() {
  return src("src/images/*.svg")
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: "../sprite.svg",
            example: true,
          },
        },
      })
    )
    .pipe(dest("src/images"));
}

function scripts() {
  return src([
    "src/js/main.js",
    "src/js/*.js",
    "!src/js/main.min.js", // ! - исключение файла
  ])
    .pipe(
      babel({
        presets: ["@babel/preset-env"],
      })
    )
    .pipe(concat("index.js"))
    .pipe(
      rename(function (path) {
        path.basename += ".min";
      })
    )
    .pipe(
      hash({
        format: "{name}.{hash:5}{size}{ext}",
      })
    )
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
  browserSync.init({
    server: {
      baseDir: "src/",
    },
  });
  watch(["src/scss/style.scss"], styles);
  watch(["src/images/src"], images);
  watch(["src/js/main.js"], scripts);
  watch(["src/components/*", "src/pages/*"], pages);
  watch(["src/*.html"]).on("change", browserSync.reload);
}

function cleanDist() {
  return src("dist").pipe(clean());
}

function building() {
  return src(
    [
      "src/css/style.min.css",
      "src/images/*.*",
      "!src/images/*.svg",
      "src/images/sprite.svg",
      "src/fonts/*.*",
      "src/js/main.min.js",
      "src/**/*.html",
    ],
    {
      base: "src",
    }
  ).pipe(dest("dist"));
}

exports.styles = styles;
exports.images = images;
exports.fonts = fonts;
exports.pages = pages;
exports.sprite = sprite;
exports.scripts = scripts;
exports.watching = watching;
exports.building = building;

exports.build = series(cleanDist, building);
exports.default = parallel(styles, images, scripts, pages, watching);
