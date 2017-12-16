const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cssmin = require('gulp-minify-css');
const sourcemaps = require('gulp-sourcemaps');
const clean = require('gulp-clean');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const babel = require("gulp-babel");
const uglify = require('gulp-uglify');
const htmlmin = require('gulp-htmlmin');
const rev = require('gulp-rev');
const revCollector = require('gulp-rev-collector');
const browserSync = require("browser-sync").create();
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');


//
//
// // build files
// gulp.task('build', ['build-sass', 'build-js', 'build-html'], function () {
//
//     browserSync.init({
//         server: './dist'
//     });
//
// });
//
// gulp.task('build-sass', function () {
//     return gulp.src('app/scss/**/*.scss')
//         .pipe(sass())
//         .pipe(gulp.dest('dist/css'))
// });
//
// gulp.task('build-js', function () {
//     return gulp.src('app/ts/**/*.js')
//         .pipe(gulp.dest('dist/js'))
// });
//
// gulp.task('build-html', function () {
//     return gulp.src('app/*.html')
//         .pipe(gulp.dest('dist'))
// });

// serve start
gulp.task('serve', ['build'], function () {

    browserSync.init({
        server: './dist'
    });

    gulp.watch('app/scss/**/*.scss', ['sass', 'build']);
    gulp.watch('app/ts/**/*.js', ['js']);
    gulp.watch('app/*.html', ['html']).on('change', browserSync.reload);
});

gulp.task('sass', function () {
    return gulp.src(['app/scss/**/*.scss', '!app/scss/components/*.scss', '!app/scss/common/*.scss'])
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
        .pipe(sourcemaps.init())
        .pipe(rev())
        .pipe(sass())
        .pipe(sourcemaps.write('.', {addComment: false}))
        .pipe(gulp.dest('dist/css'))
        .pipe(rev.manifest({
            merge: true
        }))
        .pipe(gulp.dest(''))
        .pipe(browserSync.stream());
});

gulp.task('js', function () {
    return gulp.src(['app/js/**/*.js'])
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
        .pipe(sourcemaps.init())
        .pipe(rev())
        .pipe(gulp.dest('dist/js'))
        .pipe(babel())
        .pipe(gulp.dest('dist/js'))
        .pipe(sourcemaps.write('.', {addComment: false}))
        .pipe(gulp.dest('dist/js'))
        .pipe(rev.manifest({
            merge: true
        }))
        .pipe(gulp.dest(''))
        .pipe(browserSync.stream());
});

gulp.task('html', function () {
    return gulp.src('app/*.html')
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.stream());
});

gulp.task('images', function () {
    gulp.src(['app/images/**/*'])
        .pipe(gulp.dest('dist/images'));
});


gulp.task('build', ['sass', 'js', 'images', 'html'], () => {
    return gulp.src(['rev-manifest.json', 'dist/*.html'])
        .pipe(revCollector({
            replaceReved: true,
            dirReplacements: {
                'scss': 'css',
                'js': 'js'
            }
        }))
        .pipe(gulp.dest('dist'));
});