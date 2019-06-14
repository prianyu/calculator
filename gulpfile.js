const gulp = require("gulp")
const babel = require("gulp-babel")
const uglify = require("gulp-uglify")
const rename = require("gulp-rename")

gulp.task("default", done => {

  gulp.src("./index.js")
  .pipe(rename("calculator.js"))
  .pipe(babel())
  .pipe(gulp.dest("./dist/"))

  done()
})

gulp.task("build", done => {

  gulp.src("./index.js")
  .pipe(rename("calculator.min.js"))
  .pipe(babel())
  .pipe(uglify())
  .pipe(gulp.dest("./dist/"))

  done()
})