![](https://img.shields.io/badge/Coverage-84%25-83A603.svg?style=flat&logoColor=black&color=green&prefix=$coverage$)
![](https://img.shields.io/badge/style-eslint-green)

# OnlineSoccer Extension

The `OnlineSoccer Extension` extension adds useful details and forecasts to the pages of [OnlineSoccer](https://os.ongapo.com).

## Features

- Forecast of the team players values (loans, bans, skills based on trainings settings, ...)
- Finance forecast with account balance in the team season view
- Youth forecast based on the current skills


## Development with Visual Studio Code

Basic formatter configuration and settings for `Karma Test Explorer for Angular, Jasmine, and Mocha` from Lucas Ononiwu are provided in `.vscode/settings.json`.

In order to apply formatting rules on every change the following additional user settings are recommended:
<pre>
	"files.autoSave": "onFocusChange",
	"editor.insertSpaces": false,
	"editor.formatOnSave": true,
</pre>

### Test

The coverage reports are created with `npm test` in the folder `.coverage`. Based on the `summary.json` the coverage badge is updated in the README with `npm run badge`.

### Release and publishing

The release can be created by running `scripts/release.sh x.x.x`:
- updates the version in the relevant files
- pushes these updates in a separate commit
- creates the extension archives for Firefox and Chrome in the folder `release`
- creates a new release/tag in github (requires env variable `GITHUB_TOKEN`)

The new version can be published by running `scripts/publish.sh`:
- uploads the new version to Mozilla Addons (requires env variable `AMO_API_KEY` and `AMO_API_SECRET`)
- uploads the new version to Google Web Store (requires env variable `GWS_API_KEY`, `GWS_API_SECRET` and `GWS_API_REFRESHTOKEN`)

Remark: The uploaded publication is listed as draft, still needs to be approved. 
