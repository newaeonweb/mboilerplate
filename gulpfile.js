// Import Gulp Modules
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');

// Task build
gulp.task('build', ['compile-sass', 'jshint']);

// Task default
gulp.task('default', $.taskListing.withFilters(null, 'default'));

// Task compile-sass
gulp.task('compile-sass', function () {
    return gulp.src([__dirname + '/scss/**/*.scss'])
        .pipe(plumber())
        .pipe($.sass({errors: true, define: {mylighten: mylighten}}))
        .pipe($.autoprefixer('> 1%', 'last 2 version', 'ff 12', 'ie 8', 'opera 12', 'chrome 12', 'safari 12', 'android 2'))
        .pipe($.rename(function (path) {
            path.dirname = '.';
            path.basename = 'mboilerplate-' + path.basename;
            path.ext = 'css';
        }))
        .pipe(gulp.dest(__dirname + '/www/css/'));

    // needs for compile
    function mylighten(param) {
        if (param.rgba) {
            var result = param.clone();
            result.rgba.a = 0.2;
            return result;
        }
        throw new Error('mylighten() first argument must be color.');
    }
});

// Task jshint
gulp.task('jshint', function () {
    return gulp.src([__dirname + '/www/*.js', __dirname + '/www/js/**/*.js', __dirname + '/www/js/!ngstorage.js'])
        .pipe(plumber())
        .pipe($.cached('jshint'))
        .pipe($.jshint())
        .pipe(jshintNotify())
        .pipe($.jshint.reporter('jshint-stylish'));
});

// Task serve
gulp.task('serve', ['build', 'browser-sync'], function () {
    gulp.watch(
        [__dirname + '/scss/**/*.scss'],
        {debounceDelay: 400},
        ['compile-sass']
    );

    gulp.watch(
        [__dirname + '/www/*.js', __dirname + '/www/js/**/*.js'],
        {debounceDelay: 400},
        ['jshint']
    );

    gulp.watch(
        [__dirname + '/www/**/*.*'],
        {debounceDelay: 400},
        ['prepare-cordova']
    );
});

// Task browser-sync
gulp.task('browser-sync', function () {
    browserSync({
        server: {
            baseDir: __dirname + '/www/',
            directory: true
        },
        ghostMode: false,
        notify: false,
        debounce: 200,
        startPath: 'index.html'
    });

    gulp.watch([
        __dirname + '/www/**/*.{js,html,css,svg,png,gif,jpg,jpeg}'
    ], {
        debounceDelay: 400
    }, function () {
        browserSync.reload();
    });
});

// Task prepare-cordova
gulp.task('prepare-cordova', function () {
    return gulp.src('')
        .pipe($.plumber())
        .pipe($.shell(['cordova prepare'], {cwd: __dirname}));
});

// Show Errors
function plumber() {
    return $.plumber({errorHandler: $.notify.onError()});
}

function jshintNotify() {
    return $.notify(function (file) {
        if (file.jshint.success) {
            return false;
        }

        var errors = file.jshint.results.map(function (data) {
            return data.error ? '(' + data.error.line + ':' + data.error.character + ') ' + data.error.reason : '';
        }).join('\n');

        return file.relative + ' (' + file.jshint.results.length + ' errors)\n' + errors;
    });
}
