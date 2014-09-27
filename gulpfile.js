var gulp = require('gulp');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var version = "1.0.0";

// Lint Task
gulp.task('lint', function() {
  return gulp.src('./*-'+version+'.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('ttrack', function() {
  return gulp.src('./trigger-tracker-'+version+'.js')
        .pipe(rename('trigger-tracker.js'))
        .pipe(gulp.dest('.'))
        .pipe(rename('trigger-tracker.min.js'))
        .pipe(uglify({preserveComments: 'some'}))
        .pipe(gulp.dest('.'));
});

gulp.task('ttrackPoly', function() {
  return gulp.src('./trigger-tracker-poly-'+version+'.js')
        .pipe(rename('trigger-tracker-poly.js'))
        .pipe(gulp.dest('.'))
        .pipe(rename('trigger-tracker-poly.min.js'))
        .pipe(uglify({preserveComments: 'some'}))
        .pipe(gulp.dest('.'));
});


// Watch Files For Changes
gulp.task('watch', function() {
  gulp.watch("./*-"+version+".js", ['lint', 'ttrack', 'ttrackPoly']);
});

// Default Task
gulp.task('default', ['lint', 'ttrack', 'ttrackPoly', 'watch']);
