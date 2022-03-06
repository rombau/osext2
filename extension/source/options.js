
const Options = {

    /** @type {LogLevel} the current log level */
    logLevel: LogLevel.LOG,

    /** @type {String} the current log extension data element name or null/empty if the whole extension data should be logged */
    logDataElement: null, // e.g. '_team._youthPlayers.0.skills',

    /** @type {Number} the number of seasons that should be forecasted; two means this and the following season */
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
            chrome.storage.local.set(data);
        });
        chrome.storage.onChanged.addListener((changed) => {
            Object.keys(changed).forEach((key) => Options[key] = changed[key].newValue);
        });
    }
}

Options.initialize();