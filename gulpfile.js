const gulp = require('gulp');
const git = require('gulp-git');
const bump = require('gulp-bump');
const zip = require('gulp-zip');
const del = require('del');
const argv = require('minimist')(process.argv.slice(2));
const release = require('gulp-github-release');
const jsonTransform = require('gulp-json-transform');

gulp.task('clean', () => {
	return del('./release/*.zip');
});

gulp.task('zip-firefox', () => {
	return gulp.src('./extension/**')
		.pipe(zip('osext_' + argv.release + '_firefox.zip'))
		.pipe(gulp.dest('./release'));
});

gulp.task('bump', () => {
	return gulp.src(['./extension/manifest.json', './package.json'])
		.pipe(bump({ version: argv.release }))
		.pipe(gulp.dest(file => file.base));
});

gulp.task('git-add', () => {
	return gulp.src(['./extension/manifest.json', './package.json'])
		.pipe(git.add());
});

gulp.task('git-commit', () => {
	return gulp.src(['./extension/manifest.json', './package.json'])
		.pipe(git.commit('new version ' + argv.release, { disableAppendPaths: true }));
});

gulp.task('git-push', (cb) => {
	git.push('origin', null, cb);
});

gulp.task('release', () => {
	return gulp.src('./release/osext_' + argv.release + '*.zip')
		.pipe(release({
			owner: 'rombau',
			repo: 'osext2',
			tag: 'v' + argv.release,
			name: argv.release,
			draft: false,
			prerelease: false,
			manifest: require('./package.json')
		}));
});

gulp.task('prepare-chrome', () => {
	return gulp.src('./extension/**')
		.pipe(gulp.dest('./chrome'));
});

gulp.task('clean-chrome-manifest', () => {
	return gulp.src('./chrome/manifest.json')
		.pipe(jsonTransform((json, file) => {
			if (file.relative == 'manifest.json') {
				delete json['browser_specific_settings'];
			}
			return json;
		}, "\t"))
		.pipe(gulp.dest('./chrome'));
});

gulp.task('zip-chrome', () => {
	return gulp.src('./chrome/**')
		.pipe(zip('osext_' + argv.release + '_chrome.zip'))
		.pipe(gulp.dest('./release'));
});

gulp.task('del-chrome', () => {
	return del('./chrome');
});

gulp.task('default', gulp.series('clean', 'bump', 'git-add', 'git-commit', 'git-push', 'zip-firefox', 'release', 'prepare-chrome', 'clean-chrome-manifest', 'zip-chrome', 'del-chrome'));
