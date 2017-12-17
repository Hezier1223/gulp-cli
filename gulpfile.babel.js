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
const replace = require('gulp-replace');

gulp.task('clean', () => {
    return gulp.src('./dist')
        .pipe(plumber({errorHandler: notify.onError('Clean Error: <%= error.message %>')}))
        .pipe(clean({read: false}));
});

// serve start
gulp.task('serve', ['sass', 'js', 'images', 'html'], function () {

    browserSync.init({
        server: './app'
    });

    gulp.watch('src/scss/**/*.scss', ['sass']);
    gulp.watch('src/js/**/*.js', ['js']);
    gulp.watch('src/*.html', ['html']).on('change', browserSync.reload);
});

gulp.task('sass', function () {
    return gulp.src(['src/scss/**/*.scss', '!src/scss/components/*.scss', '!src/scss/common/*.scss'])
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
        .pipe(sass())
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.stream());
});

gulp.task('js', function () {
    return gulp.src(['src/js/**/*.js'])
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
        .pipe(babel())
        .pipe(gulp.dest('app/js'))
        .pipe(browserSync.stream());
});

gulp.task('html', function () {
    return gulp.src('src/*.html')
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
        .pipe(replace(/\.scss/g, '.css'))
        .pipe(replace(/scss\//g, 'css/'))
        .pipe(gulp.dest('app'))
        .pipe(browserSync.stream());
});

gulp.task('images', function () {
    gulp.src(['src/images/**/*'])
        .pipe(gulp.dest('app/images'));
});


// build files
gulp.task('build-sass', ['clean'], () => {
    return gulp.src(['src/scss/**/*.scss', '!src/scss/components/*.scss', '!src/scss/utils/*.scss'])
        .pipe(plumber({errorHandler: notify.onError('Sass Error: <%= error.message %>')}))
        .pipe(rev())
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'Android >= 4.0']
        }))
        .pipe(cssmin())
        .pipe(gulp.dest('dist/css'))
        .pipe(rev.manifest({
            merge: true
        }))
        .pipe(gulp.dest(''))
        .pipe(browserSync.stream());
});

gulp.task('build-js', ['clean'], () => {
    return gulp.src('src/js/**/*.js')
        .pipe(plumber({errorHandler: notify.onError('JS Error: <%= error.message %>')}))
        .pipe(rev())
        .pipe(gulp.dest('dist/js'))
        .pipe(babel())
        .pipe(uglify({
            mangle: true,  // 类型：Boolean 默认：true 是否修改变量名
            compress: true  // 类型：Boolean 默认：true 是否完全压缩
        }))
        .pipe(gulp.dest('dist/js'))
        .pipe(rev.manifest({
            merge: true
        }))
        .pipe(gulp.dest(''))
        .pipe(browserSync.stream());
});

gulp.task('build-html', ['clean'], () => {
    const options = {
        removeComments: true,//清除HTML注释
        collapseWhitespace: true,//压缩HTML
        collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        minifyJS: true,//压缩页面JS
        minifyCSS: true//压缩页面CSS
    };
    return gulp.src('src/*.html')
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
        .pipe(htmlmin(options))
        // .pipe(rev())
        .pipe(gulp.dest('dist'))
        // .pipe(rev.manifest({
        //     merge: true
        // }))
        // .pipe(gulp.dest(''))
});

gulp.task('build-images', ['clean'], function () {
    gulp.src(['src/images/**/*'])
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('dist/images'));
});

gulp.task('rename', ['build'], () => {
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

gulp.task('build', ['build-js', 'build-sass', 'build-html', 'build-images']);

gulp.task('build-prod', ['clean', 'build', 'rename'], () => {
    browserSync.init({
        server: {
            baseDir: "./dist"
        }
    });
});