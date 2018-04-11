/** ===========================================================================
 * Gulp configuration file.
 * ========================================================================= */

// Requis
'use strict';

// Variables de chemins
var src = './'; // dossier de travail
var dist = './dist'; // dossier à livrer

/** ---------------------------------------------------------------------------
 * Load plugins.
 * ------------------------------------------------------------------------- */

const gulp = require('gulp'),
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
    browserSync = require('browser-sync').create(),
    autoprefixer = require('gulp-autoprefixer');


// Include plugins automatiquement
var plugins = require('gulp-load-plugins')({pattern: ['gulp-*', 'gulp.*'],replaceString: /\bgulp[\-.]/}); // tous les plugins de package.json


/* ************* JS FILE ************* */
	// Concatenate JS ( Multiple JS file --> scripts.js --> scripts.min.js) -- OK
	gulp.task('JSminify', function() {
		return gulp.src([src + '/js/*.js', '!' +src + '/js/*.min.js'])
			.pipe(concatJS('scripts.js'))
			.pipe(gulp.dest(dist + '/js'))
			.pipe(plugins.notify({title: 'Gulp',message: 'JSconcat Done'}))
			.pipe(plugins.uglify())
			.pipe(rename('scripts.min.js'))
			.pipe(gulp.dest(dist + '/js'))
			.pipe(plugins.notify({title: 'Gulp',message: 'JSminify Done'}))
		  .pipe(browserSync.stream());
	});

	// Check JS code for errors. -- OK
	gulp.task('JScheck', function() {
		return gulp.src([src + '/js/*.js', '!' +src + '/js/*.min.js', '!' +src + '/js/*analytics.js']) // Exception Google Analytics
			.pipe(jshint())
			.pipe(jshint.reporter('jshint-stylish'))
			.pipe(jshint.reporter('fail')); // task fails on JSHint error
	});

        // Copy SW to dist -- OK
	gulp.task('JScopy', function() {
		return gulp.src(src + '/*.js')
    .pipe(plugins.uglify())
		.pipe(gulp.dest(dist + '/'))
		.pipe(plugins.notify({title: 'Gulp',message: 'JScopy Done'}));
	});



/* ************* CSS FILE ************* */
  gulp.task('CSSsass', function(){
    return gulp.src(src+'/sass/*.scss')
    .pipe(plugins.sass())
    .pipe(plugins.autoprefixer({
      browsers:['last 2 versions']
    }))
    .pipe(gulp.dest(src + '/css'))
    .pipe(plugins.notify({title: 'Gulp',message: 'CSSsass Done'}));
    });

	// Concatenate CSS
	gulp.task('CSSconcat', function() {
		return gulp.src([src + '/css/*.css','!'+ src+'/css/*.min.css']) // ATTENTION Exeption sur les min.css
		  .pipe(plugins.concat('styles.css'))
		  .pipe(gulp.dest(dist + '/css'))
			.pipe(plugins.notify({title: 'Gulp',message: 'CSSconcat Done'}));
	});

	// Minify CSS ( styles.css --> styles.min.css et ???.css --> ???.min.css) -- OK
	gulp.task('CSSminify', function() {
		return gulp.src([dist + '/css/*.css', '!'+ dist + '/css/*.min.css']) // ATTENTION Exeption sur les min.css
			.pipe(plugins.csso())
			.pipe(plugins.rename({suffix: '.min'}))
			.pipe(gulp.dest(dist + '/css'))
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
	  return gulp.src([src + '/img/*.{jpg}', src + '/img/*.{webp}'])
		.pipe(plugins.cache(plugins.imagemin({ optimizationLevel: 5, progressive: true, interlaced: true, verbose: true })))
		.pipe(gulp.dest(dist + '/logo/'));
	});

  // Optimize logo
  gulp.task('LOGOoptimize', function() {
    return gulp.src([src + '/logo/*.{png}',src + '/logo/*.{svg}'])
    .pipe(plugins.cache(plugins.imagemin({ optimizationLevel: 5, progressive: true, interlaced: true, verbose: true })))
    .pipe(gulp.dest(dist + '/logo/'));
  });
/* *************** MOVE & COPY ************* */

gulp.task('FONTScopy', function() {
  return gulp.src(src + '/fonts/*')
  .pipe(gulp.dest(dist + '/fonts/'))
  .pipe(plugins.notify({title: 'Gulp',message: 'FONTScopy Done'}));
});


gulp.task('JSONcopy', function() {
  return gulp.src(src + '/*.{json}')
  .pipe(gulp.dest(dist + '/'))
  .pipe(plugins.notify({title: 'Gulp',message: 'JSONcopy Done'}));
});


/* ************* TASKS MANAGER ************* */

//  "Run_style" Task
gulp.task('Run_style', function(cb) {
    sequence(['CSSsass', 'CSSconcat', 'CSSminify'], cb);
});

//  "Run_script" Task
gulp.task('Run_script', function(cb) {
    sequence(['JScheck', 'JSminify'], cb);
});


//  "Run_images" Task
gulp.task('Run_images', function(cb) {
    sequence(['IMGoptimize', 'LOGOoptimize'], cb);
});

//  "Run_pages" Task
gulp.task('Run_pages', function(cb) {
    sequence('HTMLpages', cb);
});

//  "Run_move" Task
gulp.task('Run_copy', function(cb) {
    sequence(['JScopy', 'FONTScopy', 'JSONcopy'], cb);
});


// Default Task
gulp.task('default', function(cb) {
    sequence(['Run_style', 'Run_script', 'Run_images','Run_pages','Run_copy'], cb);
});
