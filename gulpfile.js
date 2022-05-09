const gulp = require('gulp');
const git = require('gulp-git');
const bump = require('gulp-bump');
const zip = require('gulp-zip');
const del = require('del');
const argv = require('minimist')(process.argv.slice(2));
const release = require('gulp-github-release');

gulp.task('clean', (cb) => {
	del(['./release/*.zip']);
	cb();
});

gulp.task('zip', () => {
	return gulp.src('./extension/**')
		.pipe(zip('osext_' + argv.release + '.zip'))
		.pipe(gulp.dest('./release'));
});

gulp.task('bump', (cb) => {
	gulp.src('./extension/manifest.json')
		.pipe(bump({ version: argv.release }))
		.pipe(gulp.dest('./extension'));
	gulp.src('./package.json')
		.pipe(bump({ version: argv.release }))
		.pipe(gulp.dest('./'));
	cb();
});

gulp.task('git-add', () => {
	return gulp.src('.')
		.pipe(git.add());
});

gulp.task('git-commit', () => {
	return gulp.src('.')
		.pipe(git.commit('new version ' + argv.release));
});

gulp.task('git-push', (cb) => {
	git.push('origin', (err) => {
		if (err) throw err;
	});
	cb();
});

gulp.task('release', (cb) => {
	gulp.src('./release/osext_' + argv.release + '.zip')
		.pipe(release({
			owner: 'rombau',
			repo: 'osext2',
			tag: 'v' + argv.release,
			name: argv.release,
			draft: false,
			prerelease: false,
			manifest: require('./package.json')
		}));
	cb();
});

gulp.task('default', gulp.series('clean', 'bump', 'git-add', 'git-commit', 'git-push', 'zip', 'release'));
