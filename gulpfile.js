/** ===========================================================================
 * Gulp configuration file.
 * ========================================================================= */

// Requis
'use strict';

// Variables de chemins
var src = './src'; // dossier de travail
var dist = './dist'; // dossier à livrer

/** ---------------------------------------------------------------------------
 * Load plugins.
 * ------------------------------------------------------------------------- */

var gulp = require('gulp'),
    browser = require('browser-sync').create(),
    autoprefixer = require('gulp-autoprefixer'),
    sass = require('gulp-sass'),
    minifyJS = require('gulp-uglify'),
    concatJS = require('gulp-concat'),
    jshint = require('gulp-jshint'),
    imagemin = require('gulp-imagemin'),
    sequence = require('run-sequence'),
    clean = require('gulp-clean'),
    rename = require('gulp-rename'),
    plumber = require('gulp-plumber'),
    htmlbeautify = require('gulp-html-beautify'),
    jimpresize = require("gulp-jimp-resize"),
    notify = require('gulp-notify'),
    browserSync = require('browser-sync').create();


// Include plugins automatiquement
var plugins = require('gulp-load-plugins')({pattern: ['gulp-*', 'gulp.*'],replaceString: /\bgulp[\-.]/}); // tous les plugins de package.json


/* ************* JS FILE ************* */
	// Concatenate JS ( Multiple JS file --> scripts.js --> scripts.min.js) -- OK
	gulp.task('JSminify', function() {
		return gulp.src([src + '/assets/js/*.js', '!' +src + '/assets/js/*.min.js'])
			.pipe(concatJS('scripts.js'))
			.pipe(gulp.dest(dist + '/assets/js'))
			.pipe(plugins.notify({title: 'Gulp',message: 'JSconcat Done'}))
			.pipe(plugins.uglify())
			.pipe(rename('scripts.min.js'))
			.pipe(gulp.dest(dist + '/assets/js'))
			.pipe(plugins.notify({title: 'Gulp',message: 'JSminify Done'}))
		        .pipe(browserSync.stream());
	});

	// Check JS code for errors. -- OK
	gulp.task('JScheck', function() {
		return gulp.src([src + '/assets/js/*.js', '!' +src + '/assets/js/*.min.js', '!' +src + '/assets/js/*analytics.js']) // Exception Google Analytics
			.pipe(jshint())
			.pipe(jshint.reporter('jshint-stylish'))
			.pipe(jshint.reporter('fail')); // task fails on JSHint error
	});

        // Copy SW to dist -- OK
	gulp.task('JScopy', function() {
		return gulp.src(src + '/*.min.js')
		.pipe(gulp.dest(dist + '/'))
		.pipe(plugins.notify({title: 'Gulp',message: 'JScopy Done'}));
	});



/* ************* CSS FILE ************* */

	// Concatenate CSS ( style.css + bootstrap.css + ??? --> styles.css) -- OK
	gulp.task('CSSconcat', function() {
		return gulp.src([src + '/assets/css/*.css','!'+ src+'/assets/css/cover_top.css','!'+ src+'/assets/css/*.min.css']) // ATTENTION Exeption sur le cover_top.css
		  .pipe(plugins.concat('styles.css'))
		  .pipe(gulp.dest(dist + '/assets/css'))
			.pipe(plugins.notify({title: 'Gulp',message: 'CSSconcat Done'}));
	});

	// Copy CSS ( xxx.css (src ) --> xxx.css (prod)) -- OK
	gulp.task('CSScopy', function() {
		return gulp.src(src+'/assets/css/cover_top.css')
		.pipe(gulp.dest(dist + '/assets/css'))
		.pipe(plugins.notify({title: 'Gulp',message: 'CSScopy Done'}));
	});

	// Minify CSS ( styles.css --> styles.min.css et ???.css --> ???.min.css) -- OK
	gulp.task('CSSminify', function() {
		return gulp.src([dist + '/assets/css/*.css', '!'+ dist + '/assets/css/*.min.css']) // ATTENTION Exeption sur les min.css
			.pipe(plugins.csso())
			.pipe(plugins.rename({suffix: '.min'}))
			.pipe(gulp.dest(dist + '/assets/css'))
			.pipe(plugins.notify({title: 'Gulp',message: 'CSSminify Done'}));
	});


/* ************* HTML FILE ************* */

	// Minify HTMLpages  -- OK
	gulp.task('HTMLpages', function() {
	  return gulp.src(src + '/*.html')
	 	.pipe(plugins.htmlclean())
		.pipe(plugins.htmlmin({collapseWhitespace: true}))
	  .pipe(gulp.dest(dist + '/'))
	});

/* ************* IMAGES ************* */

	// Optimize .jpg picture
	gulp.task('IMGoptimize', function() {
	  return gulp.src(src + '/img/*.{jpg}')
		.pipe(plugins.cache(plugins.imagemin({ optimizationLevel: 5, progressive: true, interlaced: true, verbose: true })))
		.pipe(gulp.dest(dist + '/img/'));
	});

/* ************* TASKS MANAGER ************* */

//  "build" Task
gulp.task('build', function(cb) {
    sequence(['style', 'script', 'images','pages'],['moveOther', 'moveFonts', 'moveFavicon'], cb);
});

// Default Task
gulp.task('default', function(cb) {
    sequence('build', 'server', cb);
});
