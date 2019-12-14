// const fs = require("fs");
// const babel = require("gulp-babel");
// const concat = require("gulp-concat");
// const declare = require("gulp-declare");
const gulp = require("gulp");
// const gutil = require("gulp-util");
// const named = require("vinyl-named-with-path");
// const path = require("path");
// const rev = require("gulp-rev");
// const revOutdated = require("gulp-rev-outdated");
// const rimraf = require("rimraf");
const sass = require("gulp-sass");
const cssimport = require("gulp-cssimport");
// const through = require("through2");
// const uglify = require("gulp-uglify");
// const webpackstream = require("webpack-stream");
// const wrap = require("gulp-wrap");

sass.compiler = require('node-sass');

function defaultTask(cb) {
    // place code for your default task here
    cb();
}

function styles(cb) {
    gulp
        .src(
            [
                "./resources/assets/css/app.css",
            ],
            {
                base: "./resources" // we want to put the files in "./public/assets/css", so we only want to remove the "resources"
            }
        )
        .pipe(cssimport({}))
        .pipe(
            sass({outputStyle: "compressed"})
                .on("error", sass.logError)
        )
        .pipe(
            gulp.dest("./public/")
        );

    return gulp.src(
        [
            "./resources/assets/css/tailwind.min.css",
        ],
        {
            base: "./resources" // we want to put the files in "./public/assets/css", so we only want to remove the "resources"
        }
    )
        .pipe(
            gulp.dest("./public/")
        );
}


exports.styles = styles;
exports.default = defaultTask;