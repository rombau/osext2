![](https://img.shields.io/badge/Coverage-83%25-83A603.svg?style=flat&logoColor=black&color=green&prefix=$coverage$)
![](https://img.shields.io/badge/style-eslint-green)

# OnlineSoccer Extension

The `OnlineSoccer Extension` extension adds useful details and forecasts to the pages of [OnlineSoccer](https://os.ongapo.com).

## Features

- Forecast of the team players values (loans, bans, skills based on trainings settings, ...)
- Finance forecast with account balance in the team season view
- Youth forecast based on the current skills 


## Development with Visual Studio Code

You need the following entries in your `settings.json` run/debug tests with Karma/Jasmine and TestExplorer:

<pre>
    "angularKarmaTestExplorer.projectType": "Karma",
    "angularKarmaTestExplorer.debugMode": true,
    "angularKarmaTestExplorer.karmaConfFilePath": "karma.conf.js",
    "angularKarmaTestExplorer.debuggerConfiguration": {
        "name": "Debug tests",
        "type": "chrome",
        "request": "attach",
        "port": 9222,
        "pathMapping": {
            "/": "${workspaceRoot}",
            "/base/": "${workspaceRoot}/"
        }
    },
    "debug.javascript.usePreview": false
</pre>

For debugging, the `coverage` reporter has to be removed by adding it to the `cleanUpReporters` method of
`~/.vscode/extensions/raagh.angular-karma-test-explorer-1.2.8/out/config/karma-configurator.js`.

The coverage reports are created with `npm test` in the folder `.coverage`. Based on the `summary.json` the coverage badge is updated in the README with `npm run badge`.

The release arichve can be created with `gulp` in teh folder `release`.
