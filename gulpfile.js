const gulp = require('gulp');
const zip = require('gulp-zip');

exports.default = () => (
	gulp.src('extension/**')
		.pipe(zip('osext.zip'))
		.pipe(gulp.dest('release'))
);