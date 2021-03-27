module.exports = function(config) {

	config.set({
		basePath : '',
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
		    'source/js/content/queue.js',
		    'source/js/content/model/common.js',
		    'source/js/content/model/league.js',
		    'source/js/content/model/player.js',
		    'source/js/content/model/team.js',
		    'source/js/content/model/matchday.js',
		    'source/js/content/model/saison.js',
		    'source/js/content/storage.js',
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
		    captureConsole: true,
		    useIframe: true
		},
		port : 9876,
		colors : true,
		logLevel : config.LOG_WARN,
		autoWatch : true,
		browsers : ['ChromiumHeadless'],
		customLaunchers: {
			ChromiumHeadless: {
				base: 'Chromium',
		        flags: ['--disable-gpu', '--remote-debugging-port=9333'],
		        displayName: 'Chromium headless',
				debug: true
			}
		},
		singleRun : false,
		concurrency : Infinity
	});
};
