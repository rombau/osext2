
/**
 * Enum for themes; root classes defined in colors.css.
 * @readonly
 */
const Theme = Object.freeze({
	DARK: 'theme-dark',
	OSBLUE: 'theme-os-blue'
});

/**
 * Enum for log level.
 * @readonly
 */
const LogLevel = Object.freeze({
	LOG: 1,
	INFO: 2,
	WARN: 3,
	ERROR: 4
});

const Options = {

	/** @type {String} the currently used theme */
	theme: Theme.OSBLUE,

	/** @type {LogLevel} the current log level */
	logLevel: LogLevel.LOG,

	/** @type {String} the current log extension data element name or null/empty if the whole extension data should be logged, e.g. '_team._youthPlayers.0.skills' */
	logDataElement: null,

	/** @type {Number} the timeout (used for async operations) */
	timeout: 10000,

	/** @type {Number} the number of seasons that should be forecasted; two means this and the following season. With more than two forecast precision will drecrease and e.g. contract cannot be extende twice with 24 month */
	forecastSeasons: 2,

	/** @type {Boolean} flag indicating to use a physio for forecasting remaining injury time */
	usePhysio: true,

	/** @type {Number} the age limit (base) for training forecast */
	ageTrainingLimit: 25,

	/** @type {Number} the primary skill limit for training forecast (at the ageTrainingLimit) */
	primarySkillTrainingLimit: 85,

	/** @type {Number} the secondary skill limit for training forecast (at the ageTrainingLimit) */
	secondarySkillTrainingLimit: 75,

	/** @type {Number} the follow up contract term */
	followUpContractTerm: 24,

	initialize : () => {
		chrome.storage.local.get(JSON.parse(JSON.stringify(Options)), (data) => {
			Object.assign(Options, data);
			if (themeSelect) {
				themeSelect.value = Options.theme;
				loggingSelect.value = Options.logLevel;
				physioCheckbox.checked = Options.usePhysio;
				Options.initSlider(ageLimitSlider, Options.ageTrainingLimit);
				Options.initSlider(psLimitSlider, Options.primarySkillTrainingLimit);
				Options.initSlider(nsLimitSlider, Options.secondarySkillTrainingLimit);
			} else {
				Options.setRootTheme(Options.theme);
				chrome.storage.onChanged.addListener((changes) => {
					if (changes.theme) {
						Options.setRootTheme(changes.theme.newValue);
					}
				});
			}
		});
	},

	initSlider : (slider, value) => {
		let output = document.getElementById(slider.id + '-value');
		output.textContent = value;
		slider.value = value;
		slider.addEventListener('input', (event) => {
			output.textContent = event.target.value;
		});
	},

	setRootTheme : (theme) => {
		// Theme set on each frame
		document.documentElement.className = theme;

		// Every time the menu is refreshed, the whole document including the html tag is recreated (document.open/write/close).
		// Therefore this observer is listening for added HTML tags, and re-set the theme.
		new MutationObserver((records, observer) => {
			records.forEach(record => {
				Array.from(record.addedNodes).forEach(node => {
					if (node.nodeName.toUpperCase() === 'HTML') {
						node.setAttribute('class', theme);
					}
				});
			});
		}).observe(document, { childList: true });
	},

	save : () => {
		Options.theme = themeSelect.value;
		Options.logLevel = loggingSelect.value;
		Options.usePhysio = physioCheckbox.checked;
		Options.ageTrainingLimit = ageLimitSlider.value;
		Options.primarySkillTrainingLimit = psLimitSlider.value;
		Options.secondarySkillTrainingLimit = nsLimitSlider.value;
		chrome.storage.local.set(JSON.parse(JSON.stringify(Options)), () => {
			if (chrome.runtime.lastError) {
				new Logger('Options').error('Error when storing options ' + chrome.runtime.lastError);
			}
			let status = document.getElementById('options-status');
			if (status) {
				status.textContent = 'Optionen wurden gespeichert';
				setTimeout(() => {
					status.textContent = '';
				}, 1000);
			}
		});
	}
};

let themeSelect = document.getElementById('options-theme');
let loggingSelect = document.getElementById('options-logging');
let physioCheckbox = document.getElementById('options-physio');
let ageLimitSlider = document.getElementById('options-age-limit');
let psLimitSlider = document.getElementById('options-ps-limit');
let nsLimitSlider = document.getElementById('options-ns-limit');

let saveButton = document.getElementById('options-save');
let editorButton = document.getElementById('options-editor');

if (saveButton) {
	document.addEventListener('DOMContentLoaded', Options.initialize);
	saveButton.addEventListener('click', Options.save);
	editorButton.addEventListener('click', () => {
		chrome.tabs.create({url: 'editor.html'});
	});
} else {
	Options.initialize();
}
