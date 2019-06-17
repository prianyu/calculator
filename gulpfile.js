const gulp = require("gulp")
// const babel = require("gulp-babel")
const uglify = require("gulp-uglify")
const rename = require("gulp-rename")
const rollup = require("rollup")
const resolve = require('rollup-plugin-node-resolve')
const babel = require('rollup-plugin-babel')


gulp.task("build", async function() {
  const bundle =  await rollup.rollup({
    input: "./index.js",
    plugins: [
      resolve(),
      babel({
        exclude: "node_modules/**"
      })
    ]
  })
  await bundle.write({
    format: "umd",
    name: "Calculator",
    file: "./dist/calculator.js"
  })
  await gulp.src("./dist/calculator.js")
  .pipe(uglify())
  .pipe(rename("calculator.min.js"))
  .pipe(gulp.dest("./dist/"))

})