import { src, dest, task, watch, series } from 'gulp';
import gulpSass from 'gulp-sass'
import * as sass from 'sass';
import browserSync from 'browser-sync';
import cssnano from 'cssnano';
import rename from 'gulp-rename';
import postcss from 'gulp-postcss';
import csscomb from 'gulp-csscomb';
import autoprefixer from 'autoprefixer';
import mqpacker from 'css-mqpacker';

const sassCompiler = gulpSass(sass)
const browserSyncInstance = browserSync.create()

const { default: sortCSSmq } = await import('sort-css-media-queries')

const PATH = {
  scssFolder: './assets/scss',
  scssRoot: 'assets/scss/style.scss',
  scssAllFiles: 'assets/scss/**/*.scss',
  cssFolder: 'assets/css',
  htmlAllFiles: './**/*.html'
}

const PLUGINS = [autoprefixer({overrideBrowserslist: ['last 5 versions' , '> 1%']}), mqpacker({ sort: sortCSSmq })]

function scss() {
  return src(PATH.scssRoot)
  .pipe(sassCompiler().on('error', sassCompiler.logError))
  .pipe(postcss(PLUGINS))
  .pipe(dest(PATH.cssFolder))
  .pipe(browserSyncInstance.stream())
}

function scssComb() {
return src(PATH.scssAllFiles )
.pipe(csscomb())
.pipe(dest(PATH.scssFolder))
}

function scssDev() {
  const pluginsForDevMode = [...PLUGINS]
  pluginsForDevMode.splice(0, 1)
  return src(PATH.scssRoot, { sourcemaps: true })
  .pipe(sassCompiler().on('error', sassCompiler.logError))
  .pipe(postcss(pluginsForDevMode))
  .pipe(dest(PATH.cssFolder, { sourcemaps: true }))
  .pipe(browserSyncInstance.stream());
}

function scssMin() {
  const pluginsForMinified = [...PLUGINS, cssnano()]
  return src(PATH.scssRoot)
  .pipe(sassCompiler().on('error', sassCompiler.logError))
  .pipe(postcss(pluginsForMinified))
  .pipe(rename({ suffix: '.min'}))
  .pipe(dest(PATH.cssFolder))
  .pipe(browserSyncInstance.stream());
}

function syncInit() {
    browserSyncInstance.init({
        server: {
            baseDir: "./"
        }
    });
};

async function reload() {
    browserSyncInstance.reload();
    }

function watchFiles () {
  syncInit();
  watch(PATH.scssAllFiles, series(scss, scssMin));
  watch(PATH.htmlAllFiles, reload);
}

task('scss', series(scss, scssMin));
task('watch', watchFiles);
task('dev', scssDev);
task('comb', scssComb);


