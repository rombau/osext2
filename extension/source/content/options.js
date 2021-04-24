
const Options = {

    /** @type {Boolean} flag indicating to use a physio for forecasting remaining injury time */
    usePhysio: true,

    /** @type {Number} the age limit (base) for training forecast */
    ageTrainingLimit: 25,

    /** @type {Number} the primary skill limit for training forecast based on the ageTrainingLimit */
    primarySkillTrainingLimit: 85,

    /** @type {Number} the secondary skill limit for training forecast based on the ageTrainingLimit */
    secondarySkillTrainingLimit: 75,


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