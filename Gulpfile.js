const gulp = require("gulp");
// const named = require("vinyl-named-with-path");
const rev = require("gulp-rev");
const del = require("del");
const sass = require("gulp-sass");
const cssimport = require("gulp-cssimport");
// const webpackstream = require("webpack-stream");

sass.compiler = require("node-sass");

/**
 * Takes an input stream, revisions all files in the stream, writes them, builds a manifest file, merges the manifest
 * file with any existing manifest, writes the manifest file.
 *
 * @param inputStream
 * @returns {*}
 */
function revision(inputStream) {
    return inputStream.pipe(rev())
        .pipe(gulp.dest("./public")) // output the public files into public/
        .pipe(rev.manifest({
            merge: true
        }))
        .pipe(gulp.dest(".")); // output the manifest into ./
}

/**
 * Removes outdated file versions
 */
function clean(cb) {
    return del([
        "public/assets/css/**"
    ]);
}

function designSystem(cb) {
    return revision(
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
    );
}

function tailwind(cb) {
    return revision(
        gulp.src(
            [
                "./resources/assets/css/tailwind.min.css",
            ],
            {
                base: "./resources" // we want to put the files in "./public/assets/css", so we only want to remove the "resources"
            }
        )
    );
}

const styles = gulp.series(
    designSystem,
    tailwind
);

exports.clean = clean;
exports.styles = styles;
exports.default = gulp.series(clean, styles);