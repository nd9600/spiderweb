const gulp = require("gulp");
const gutil = require("gulp-util");
// const named = require("vinyl-named-with-path");
const path = require("path");
const through = require("through2");
const rev = require("gulp-rev");
const revOutdated = require("gulp-rev-outdated");
const rimraf = require("rimraf");
const sass = require("gulp-sass");
const cssimport = require("gulp-cssimport");
// const webpackstream = require("webpack-stream");

sass.compiler = require('node-sass');

/**
 * from https://www.npmjs.com/package/gulp-rev-outdated
 */
function cleaner() {
    return through.obj(function (file, enc, cb) {
        rimraf(path.resolve((file.cwd || process.cwd()), file.path), function (err) {
            if (err) {
                this.emit('error', new gutil.PluginError('Cleanup old files', err));
            }
            this.push(file);
            cb();
        }.bind(this));
    });
}

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
    return gulp.src("./public/assets/**/*", {read: false})
        .pipe(revOutdated(1))
        .pipe(cleaner());
}

function styles(cb) {
    // bundle and minify the design system
    revision(
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

    // copy over tailwind
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


exports.clean = clean;
exports.styles = styles;
exports.default = gulp.series(styles, clean);