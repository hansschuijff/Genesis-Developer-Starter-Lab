'use strict';

var gulp = require('gulp'),

	// Sass/CSS processes
	bourbon = require('bourbon').includePaths,
	neat = require('bourbon-neat').includePaths,
	sass = require('gulp-sass'),
	postcss = require('gulp-postcss'),
	autoprefixer = require('autoprefixer'),
	cssMQpacker = require('css-mqpacker'),
	sourcemaps = require('gulp-sourcemaps'),
	cssMinify = require('gulp-cssnano'),
	sassLint = require('gulp-sass-lint'),

	// utilities
	rename = require('gulp-rename'),
	notify = require('gulp-notify'),
	plumber = require('gulp-plumber'),
	gutil = require('gulp-util');


/*************
 * Utilities
 ************/

/**
 * Error handling
 *
 * @function
 */
function handleErrors() {
	var args = Array.prototype.slice.call(arguments);

	notify.onError({
		title: 'Task Failed [<%= error.message %>',
		message: 'See console.',
		sound: 'Sosumi' // See: https://github.com/mikaelbr/node-notifier#all-notification-options-with-their-defaults
	}).apply(this, args);

	gutil.beep(); // Beep 'sosumi' again

	// Prevent the 'watch' task from stopping
	this.emit('end');
}

/*************
 * CSS Tasks
 ************/

/**
 * PostCSS Task Handler
 */
gulp.task('postcss', function (done) {

	return gulp.src('assets/sass/styles.scss')

		// Error handling
		.pipe(plumber({
			errorHandler: handleErrors
		}))

		// Wrap tasks in a sourcemap
		.pipe(sourcemaps.init())

		.pipe( sass({
			includePaths: [].concat( bourbon, neat ),
			errLogToConsole: true,
			outputStyle: 'expanded' // Options: nested, expanded, compact, compressed
		}))

		.pipe( postcss([
			autoprefixer({
				cascade: false
			}),
			cssMQpacker({
				sort: true
			})
		]))

		// creates the sourcemap
		.pipe(sourcemaps.write())

		.pipe(gulp.dest('./'))
		done();

});

gulp.task( 'cssMinify', function (done){
	return gulp.src('styles.css')
    	// Error handling
    	.pipe(plumber({
			errorHandler: handleErrors
		}))

		.pipe( cssMinify({
			safe: true
		}))
		.pipe( rename('styles.min.css') )
		.pipe( gulp.dest('./'))
		.pipe(notify({
			message: 'Styles are built.'
		}))
		done();
});

gulp.task('sass:lint', gulp.series( function(done) {
	gulp.src([
		'assets/sass/styles.scss',
		'!assets/sass/base/html5-reset/_normalize.scss',
		'!assets/sass/utilities/animate/**/*.*'
	])
		.pipe(sassLint())
		.pipe(sassLint.format())
		.pipe(sassLint.failOnError())
		done();
}, 'cssMinify'));

gulp.task('watch:css', function () {
	gulp.watch('assets/sass/**/*.scss', gulp.series('styles'));
});

/**
 * Individual tasks.
 */
// gulp.task('scripts', [''])


gulp.task('styles', gulp.series('postcss', 'sass:lint'));
