'use strict';
var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync");
var mqpacker = require("css-mqpacker");
var minify = require("gulp-csso");
var rename = require("gulp-rename");
var del = require("del");
var run = require("run-sequence");

gulp.task("sass", function(){
    gulp.src("src/sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
        autoprefixer({browsers: [
        "last 1 version",
        "last 2 Chrome versions",
        "last 2 Firefox versions",
        "last 2 Opera versions",
        "last 2 Edge versions"
        ]}),
        mqpacker({
            sort: true
        })
    ]))
    .pipe(gulp.dest("css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("css"))
});

gulp.task("serve", ["sass"], function () {
    server.init({
        server: "."
    });

    gulp.watch("sass/**/*.scss", ["sass"]);
    gulp.watch("*.html")
        .on("change", server.reload);
});

gulp.task("build", function(fn) {
    run("sass", fn);
});