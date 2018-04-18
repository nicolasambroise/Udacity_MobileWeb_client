/** ===========================================================================
 * Gulp configuration file.
 * ========================================================================= */

// Requis
"use strict";

// Variables de chemins
var src = "./"; // dossier de travail
var dist = "./dist"; // dossier à livrer

/** ---------------------------------------------------------------------------
 * Load plugins.
 * ------------------------------------------------------------------------- */

var gulp = require("gulp");
var autoprefixer = require("gulp-autoprefixer");
var sass = require("gulp-sass");
var concat = require("gulp-concat");
var imagemin = require("gulp-imagemin");
var sequence = require("run-sequence");
var csso = require("gulp-csso");
var clean = require("gulp-clean");
var cache = require("gulp-cache");
var rename = require("gulp-rename");
var plumber = require("gulp-plumber");
var htmlbeautify = require("gulp-html-beautify");
var jimpresize = require("gulp-jimp-resize");
var eslint = require("gulp-eslint");
var notify = require("gulp-notify");
var uglify = require('gulp-uglify-es').default; /* For ES6 ! */
var browserSync = require("browser-sync").create();
var jasmine = require('gulp-jasmine-phantom');
var htmlclean = require('gulp-htmlclean');
var htmlmin = require('gulp-htmlmin');
//$ npm install --save-dev gulp-jasmine-phantom
var jshint = require("gulp-jshint");
//$  npm install jshint gulp-jshint --save-dev

// Include plugins automatiquement
var plugins = require("gulp-load-plugins")({pattern: ["gulp-*", "gulp.*"], replaceString: /\bgulp[\-.]/}); // tous les plugins de package.json


// Server live editing
gulp.task("serve", ["sass"], function() {
    browserSync.init({
        server: "./dist"
    });
    gulp.watch("scss/*.scss", ["Run_style"]);
    gulp.watch("css/*.css", ["Run_style"]);
    gulp.watch("js/*.js", ["Run_script"]);
    gulp.watch("*.html", ["Run_pages"]);
    gulp.watch("*.html").on("change", browserSync.reload);
});


/* ************* JS FILE ************* */
// minify JS
/* ==> OK */
gulp.task("JSminify", function() {
  return gulp.src([src + "/js/*.js", "!" +src + "/js/*.min.js"])
    .pipe(plugins.rename({suffix: ".min"}))
    .pipe(uglify())
    .pipe(gulp.dest(dist + "/js"))
    .pipe(plugins.notify({title: "Gulp",message: "JSminify Done"}));
  });

// Check JS code for error with ES lint
// Error : No ESLint configuration found.
gulp.task("JSlint", function() {
  return gulp.src([src + "/js/*.js","!node_modules/**"])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

// Check JS code for errors.
// Error : Invalid reporter
gulp.task("JScheck", function() {
  return gulp.src([src + "/js/*.js", "!" +src + "/js/*.min.js", "!" +src + "/js/*analytics.js"]) // Exception Google Analytics
    .pipe(jshint())
    .pipe(jshint.reporter("jshint-stylish"))
    .pipe(jshint.reporter("fail")); // task fails on JSHint error
  });

// Copy SW to dist
/* ==> OK  */
gulp.task('JScopy', function (cb) {
  return gulp.src([src + "/sw.js", src + "/app.js"])
    .pipe(plugins.rename({suffix: ".min"}))
    .pipe(uglify())
    .pipe(gulp.dest(dist + "/js"))
    .pipe(plugins.notify({title: "Gulp",message: "JScopy Done"}));
});

// Unit Test JS
/* A tester */
gulp.task("JSUnit",function(){
  gulp.src('tests/spec/extraSpec.js')
  .pipe(jasmine({
    integration: true,
    vendor: '/js/*.js'
  }))
});

/* ************* CSS FILE ************* */
/* ==> OK */
gulp.task("CSSsass", function() {
  return gulp.src(src+"/sass/*.scss")
    .pipe(plugins.sass())
    .pipe(plugins.autoprefixer({browsers:["last 2 versions"]}))
    .pipe(gulp.dest(src + "/css"))
    .pipe(plugins.notify({title: "Gulp",message: "CSSsass Done"}));
  });

// Concatenate CSS
/* ==> OK */
gulp.task("CSSconcat", function() {
  return gulp.src([src + "/css/*.css","!"+ src+"/css/*.min.css"]) // ATTENTION Exeption sur les min.css
    .pipe(plugins.concat("styles.css"))
    .pipe(gulp.dest(dist + "/css"))
    .pipe(plugins.notify({title: "Gulp",message: "CSSconcat Done"}));
  });

// Minify CSS ( styles.css --> styles.min.css et ???.css --> ???.min.css) -- OK
/* ==> OK */
gulp.task("CSSminify", function() {
  return gulp.src([dist + "/css/*.css", "!"+ dist + "/css/*.min.css"]) // ATTENTION Exeption sur les min.css
    .pipe(plugins.csso())
    .pipe(plugins.rename({suffix: ".min"}))
    .pipe(gulp.dest(dist + "/css"))
    .pipe(plugins.notify({title: "Gulp",message: "CSSminify Done"}));
  });

/* ************* HTML FILE ************* */

// Minify HTMLpages
/* ==> OK */
gulp.task("HTMLpages", function() {
  return gulp.src(src + "/*.html")
    .pipe(plugins.htmlclean())
    .pipe(plugins.htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(dist + "/"));
});

/* ************* IMAGES ************* */

// Optimize .jpg picture
/* ==> OK */
gulp.task("IMGoptimize", function() {
  return gulp.src([src + "/img/*.jpg", src + "/img/*.webp"])
    .pipe(imagemin([
      imagemin.jpegtran({progressive: true}),
    ]))
    .pipe(gulp.dest(dist + "/img/"));
  });

// Optimize logo
/* ==> OK */
gulp.task("LOGOoptimize", function() {
  return gulp.src([src + "/logo/*.png",src + "/logo/*.svg"])
  .pipe(imagemin([
    imagemin.optipng({optimizationLevel: 5}),
    imagemin.svgo({plugins:[{removeViewBox: true},{cleanupIDs: false}]})
  ]))
  .pipe(gulp.dest(dist + "/logo/"));
 });
/* *************** MOVE & COPY ************* */

// copy FONTS
 /* ==> OK */
gulp.task("FONTScopy", function() {
  return gulp.src(src + "/fonts/*")
  .pipe(gulp.dest(dist + "/fonts/"))
});

// copy JSON
/* ==> OK */
gulp.task("JSONcopy", function() {
  return gulp.src(src + "/*.json")
  .pipe(gulp.dest(dist + "/"))
});


/* ************* TASKS MANAGER ************* */

//  "Run_style" Task
gulp.task("Run_style", function(cb) {
    sequence(["CSSsass", "CSSconcat", "CSSminify"], cb);
});

//  "Run_script" Task
gulp.task("Run_script", function(cb) {
    sequence(["JScheck", "JSminify"], cb);
});


//  "Run_images" Task
gulp.task("Run_images", function(cb) {
    sequence(["IMGoptimize", "LOGOoptimize"], cb);
});

//  "Run_pages" Task
gulp.task("Run_pages", function(cb) {
    sequence("HTMLpages", cb);
});

//  "Run_move" Task
gulp.task("Run_copy", function(cb) {
    sequence(["JScopy", "FONTScopy", "JSONcopy"], cb);
});


// Default Task
gulp.task("default", ["JSlint"] ,function(cb) {
    sequence(["Run_style", "Run_script", "Run_images","Run_pages","Run_copy","serve"], cb);
});
