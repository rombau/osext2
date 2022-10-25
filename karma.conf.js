module.exports = function(config) {

	config.set({
		plugins : [
			'karma-chrome-launcher',
			'karma-jasmine',
			'karma-spec-reporter',
			'karma-coverage'],
		frameworks : ['jasmine'],
		files : [
			{ pattern: 'test/fixtures/**/*', included: false },
			'test/lib/**/*',
			'extension/source/common.js',
			'extension/source/logger.js',
			'extension/source/options.js',
			'extension/source/requestor.js',
			'extension/source/model/data.js',
			'extension/source/model/player.js',
			'extension/source/model/squadplayer.js',
			'extension/source/model/youthplayer.js',
			'extension/source/model/team.js',
			'extension/source/model/matchday.js',
			'extension/source/model/stadium.js',
			'extension/source/persistence.js',
			'extension/source/page.js',
			'extension/source/htmlutil.js',
			'extension/source/scriptutil.js',
			'extension/source/table.js',
			'extension/source/pages/showteam.base.js',
			'extension/source/pages/youth.base.js',
			'extension/source/pages/*.js',
			'test/**/*.spec.js'],
		exclude : [
			'test/handler.spec.js'
		],
		proxies: {
			'/haupt.php': '/base/spec/fixtures/haupt.php.html',
			'/showteam.php': '/base/spec/fixtures/showteam.php.html',
			'/js/': '/base/spec/fixtures/js/',
			'/css/': '/base/spec/fixtures/css/',
			'/images/': '/base/spec/fixtures/images/'
		},
		preprocessors : {
			'extension/source/**/*.js': 'coverage'
		},
		reporters : ['spec', 'coverage'],
		coverageReporter:{
			dir: '.coverage/',
			reporters: [
				{ type: 'html', subdir: 'html-report' },
				{ type: 'json-summary', subdir: '.', file: 'summary.json' },
			]
		},
		client: {
			"captureConsole": true,
		},
		port : 9876,
		colors : true,
		logLevel : config.LOG_WARN,
		autoWatch : true,
		browsers : ['ChromeHeadless'],
		singleRun : true,
		concurrency : Infinity
	});
};
