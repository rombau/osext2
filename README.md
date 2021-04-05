# OnlineSoccer Extension

The `OnlineSoccer Extension` extension adds useful details to the pages of [OnlineSoccer](https://os.ongapo.com).

## Features

- Additional values for players
- sdfdsfds


## Development with Visual Studio Code

Following entries in your `settings.json` needed to run/debug tests with Karma/Jasmine and TestExplorer:

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

For debugging the `coverage` reporter has to be removed by adding in `cleanUpReporters` method of
`~/.vscode/extensions/raagh.angular-karma-test-explorer-1.2.8/out/config/karma-configurator.js`.
