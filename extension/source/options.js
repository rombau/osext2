
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
        chrome.storage.local.get(Options, (data) => {
            chrome.storage.local.set(JSON.parse(JSON.stringify(data)), () => {
                if (chrome.runtime.lastError) {
                    new Logger('Options').error('Error when storing options ' + chrome.runtime.lastError);
                }
            });
            if (themeSelect) {
                themeSelect.value = data.theme;
            } else {
                Options.setRootTheme(data.theme);
            }
        });
    },

    setRootTheme : (theme) => {

        // Theme set on each frame
        document.documentElement.className = theme;
        top.addEventListener("load", (event) => {
            top.frames.os_menu.document.documentElement.className = theme;
        });

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
        chrome.storage.local.set(JSON.parse(JSON.stringify(Options)), () => {
            if (chrome.runtime.lastError) {
                new Logger('Options').error('Error when storing options ' + chrome.runtime.lastError);
            }
        });
    }
}

let themeSelect = document.getElementById('options-theme');
let saveButton = document.getElementById('options-save');

if (saveButton) {
    document.addEventListener('DOMContentLoaded', Options.initialize);
    saveButton.addEventListener('click', Options.save);
} else {
    Options.initialize();
}
