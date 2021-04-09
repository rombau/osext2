module.exports = function(config) {

	config.set({
		plugins : [
			'karma-chrome-launcher',
			'karma-jasmine',
			'karma-spec-reporter',
			'karma-coverage'],
		frameworks : ['jasmine'],
		files : [
			{ pattern: 'spec/fixtures/**/*', included: false },
			'spec/lib/**/*',
		    'source/js/background/cache.js',
		    'source/js/content/requestor.js',
		    'source/js/content/model/consts.js',
		    'source/js/content/model/data.js',
		    'source/js/content/model/league.js',
		    'source/js/content/model/player.js',
			'source/js/content/model/squadplayer.js',
		    'source/js/content/model/youthplayer.js',
		    'source/js/content/model/team.js',
		    'source/js/content/model/matchday.js',
		    'source/js/content/persistence.js',
		    'source/js/content/page.js',
		    'source/js/content/htmlutil.js',
		    'source/js/content/pages/*.js',
		    'spec/**/*.spec.js'],
		exclude : [
			'spec/handler.spec.js'
			],
		proxies: {
			'/haupt.php': '/base/spec/fixtures/haupt.php.html',
			'/showteam.php': '/base/spec/fixtures/showteam.php.html',
			'/js/': '/base/spec/fixtures/js/',
			'/css/': '/base/spec/fixtures/css/',
			'/images/': '/base/spec/fixtures/images/'
		},
		preprocessors : {
			'source/js/**/*.js': 'coverage'
		},
		reporters : ['spec', 'coverage'],
		coverageReporter:{
		      type:'lcov',
		      dir:'.coverage/'
		    },
		client: {
			"captureConsole": false,
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
