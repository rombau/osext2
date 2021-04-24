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
		    'extension/source/background/cache.js',
			'extension/source/content/options.js',
		    'extension/source/content/requestor.js',
		    'extension/source/content/model/consts.js',
		    'extension/source/content/model/data.js',
		    'extension/source/content/model/player.js',
			'extension/source/content/model/squadplayer.js',
		    'extension/source/content/model/youthplayer.js',
		    'extension/source/content/model/team.js',
		    'extension/source/content/model/matchday.js',
		    'extension/source/content/persistence.js',
		    'extension/source/content/page.js',
		    'extension/source/content/htmlutil.js',
			'extension/source/content/pages/showteam.base.js',
		    'extension/source/content/pages/*.js',
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
		      type:'lcov',
		      dir:'.coverage/'
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
