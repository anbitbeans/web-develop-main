//gulp本体
const gulp = require("gulp");

// ejs
const fs = require("fs");
const ejs = require("gulp-ejs");
const rename = require("gulp-rename");
// prettier
const prettier = require("gulp-prettier");
// const csscomb = require("gulp-csscomb");
// scss Dart Sass はSass公式が推奨 @use構文などが使える
const sass = require("gulp-dart-sass");
// css 縮小化
const purgecss = require("gulp-purgecss");
const cleancss = require("gulp-clean-css");
// js 縮小化
const uglify = require("gulp-uglify");

// エラーが発生しても強制終了させない
const plumber = require("gulp-plumber");
// エラー発生時のアラート出力
const notify = require("gulp-notify");
//ブラウザリロード
const browserSync = require("browser-sync");

const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');

// 入出力するフォルダを指定
const srcBase = "./src";
const docsBase = "./docs";

const srcPath = {
    scss: srcBase + "/asset/sass/**/*.scss",
    js: srcBase + "/asset/js/*.js",
    img: srcBase + "/asset/img/**",
    html: srcBase + "/**/*.html",
    ejs: [srcBase + "/**/*.ejs", "!" + srcBase + "/**/_*.ejs"],
};

const docsPath = {
    css: docsBase + "/asset/css/",
    js: docsBase + "/asset/js/",
    img: docsBase + "/asset/img/",
    html: docsBase + "/",
    ejs: docsBase + "/",
};

/**
 * sass
 */
const cssSass = () => {
    return (
        gulp
            .src(srcPath.scss, {
                sourcemaps: true,
            })
            .pipe(
                //エラーが出ても処理を止めない
                plumber({
                    errorHandler: notify.onError("Error:<%= error.message %>"),
                })
            )
            .pipe(sass({ outputStyle: "expanded" })) //指定できるキー expanded compressed
            // .pipe(
            //     purgecss({
            //         content: [
            //             "./src/**/*.html",
            //             "./src/**/*.ejs",
            //             "./src/**/*.js",
            //         ],
            //     })
            // )
            // .pipe(csscomb()) // csscombでCSSの順序指定
            .pipe(cleancss())
            .pipe(gulp.dest(docsPath.css, { sourcemaps: "./" })) //コンパイル先
            .pipe(browserSync.stream())
            .pipe(
                notify({
                    message: "Sassをコンパイルしました！",
                    onLast: true,
                })
            )
    );
};

/**
 * js
 */
const js = () => {
    return gulp
        .src(srcPath.js)
        .pipe(
            //エラーが出ても処理を止めない
            plumber({
                errorHandler: notify.onError("Error:<%= error.message %>"),
            })
        )
        .pipe(webpackStream(webpackConfig, webpack))
        .pipe(gulp.dest(docsPath.js))
        .pipe(browserSync.stream());
};



/**
 * html
 */
const html = () => {
    return gulp.src(srcPath.html).pipe(gulp.dest(docsPath.html));
};

/**
 * ejs
 */
const ejsHtml = () => {
    const json = JSON.parse(fs.readFileSync("./ejs-config.json"));
    return gulp
        .src(srcPath.ejs)
        .pipe(plumber())
        .pipe(ejs(json, { ext: ".html" }))
        .pipe(rename({ extname: ".html" }))
        .pipe(prettier())
        .pipe(gulp.dest(docsPath.ejs));
};

/**
 * ローカルサーバー立ち上げ
 */
const browserSyncFunc = () => {
    browserSync.init(browserSyncOption);
};

const browserSyncOption = {
    server: docsBase,
};

/**
 * リロード
 */
const browserSyncReload = (done) => {
    browserSync.reload();
    done();
};

/**
 * ファイル監視 ファイルの変更を検知したら、browserSyncReloadでreloadメソッドを呼び出す
 * series 順番に実行
 * watch('監視するファイル',処理)
 */
const watchFiles = () => {
    gulp.watch(srcPath.scss, gulp.series(cssSass));
    gulp.watch(srcPath.js, gulp.series(js));
    gulp.watch(srcPath.html, gulp.series(html, browserSyncReload));
    gulp.watch(srcPath.ejs, gulp.series(ejsHtml, browserSyncReload));
};

/**
 * seriesは「順番」に実行
 * parallelは並列で実行
 */
exports.default = gulp.series(
    gulp.parallel(html, ejsHtml, js,cssSass),
    gulp.parallel(watchFiles, browserSyncFunc)
);
