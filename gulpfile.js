// Load plugins
var gulp = require('gulp'),
  sass  = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  cssnano = require('gulp-cssnano'),
  uglify = require('gulp-uglify'),
  imagemin = require('gulp-imagemin'),
  rename = require('gulp-rename'),
  concat = require('gulp-concat'),
  cache = require('gulp-cache'),
  browserify = require('browserify'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer'),
  webserver = require('gulp-webserver'),
  del = require('del'),
  runSequence = require('run-sequence')
;

// env
var isProduction = (process.env.NODE_ENV || 'development') == 'production';


// Styles
gulp.task('styles', function() {
  var exec = gulp.src('./src/styles/main.scss')
    .pipe(sass({ errLogToConsole: true }))
    .pipe(autoprefixer('last 2 version'));

  if (isProduction) {
    exec = exec.pipe(cssnano());
  }

  return exec.pipe(gulp.dest('dist/styles'))
});

// Scripts
gulp.task('scripts', function() {
  var exec = browserify('src/scripts/main.js')
    .bundle()
    .pipe(source('bundle.js'))

  if (isProduction) {
    exec = exec
      .pipe(buffer())
      .pipe(uglify());
  }

  return exec.pipe(gulp.dest('dist/scripts'));
});

// Images
gulp.task('images', function() {
  return gulp.src('src/images/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest('dist/images'))
});

gulp.task('htmls', function() {
  return gulp.src('src/*.html')
    .pipe(gulp.dest('dist/'))
});

// Clean
gulp.task('clean', function() {
  return del(['dist/styles', 'dist/scripts', 'dist/images', 'dist/*.html']);
});

gulp.task('webserver', function() {
  gulp.src('dist')
    .pipe(webserver({
      host: 'localhost',
      port: 8000,
      livereload: true,
      open: true
    }));
});

gulp.task('build', ['clean'], function() {
  runSequence('clean', 'styles', 'scripts', 'images', 'htmls');
});

gulp.task('start', function() {
  runSequence('clean', 'styles', 'scripts', 'images', 'htmls', 'webserver', 'watch');
});

gulp.task('default', ['start']);

// Watch
gulp.task('watch', function() {

  // Watch .scss files
  gulp.watch('src/styles/**/*.scss', ['styles']);

  // Watch .js files
  gulp.watch('src/scripts/**/*.js', ['scripts']);

  // Watch image files
  gulp.watch('src/images/**/*', ['images']);

  // Watch html files
  gulp.watch('src/*.html', ['htmls']);
});
