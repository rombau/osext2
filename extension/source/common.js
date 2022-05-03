/** Global constants */

const CHANCE_LIMIT = 99;
const SKILL_LIMIT = 99;

const SPECIAL_SKILL_LIMIT = 75;

const SEASON_MATCH_DAYS = 72;
const MONTH_MATCH_DAYS = 6;

const SKILL_DEDUCTION_TOR = 35;
const SKILL_DEDUCTION_FIELD = 33;
const SKILL_DEDUCTION = [34, 51, 68, 85, 102];
const SKILL_DEDUCTION_WEIGHTING = {SCH: 1, BAK: 0.5, KOB: 1, ZWK: 1, DEC: 1, GES: 2, FUQ: 0, ERF: 0, AGG: 2, PAS: 0.5, AUS: 1, UEB: 0, WID: 2, SEL: 1, DIS: 0, ZUV: 1, EIN: 1}

const CONTRACT_LENGTHS = [24, 36, 48, 60, 72];

const YOUTH_AGE_MIN = 13;
const YOUTH_AGE_MAX = 18;

const YOUTH_SUPPORT_MIN = 500;

const STADIUM_ADDITION_SEAT = 4;
const STADIUM_ADDITION_COVERED_PLACE = 6;
const STADIUM_ADDITION_COVERED_SEAT = 10;

const STADIUM_PLACE_COSTS = 5;
const STADIUM_EXPANSION_CAPACITY = 75;
const STADIUM_FRIENDLY_INCOME = 500000;

const PREMIUM_ADVERTISING = [747752, 733704, 720244, 707350, 695000, 692993, 663630, 637050, 613000, 591250, 589746, 578133, 567248, 557050, 547500, 543350, 539362, 535531, 531853, 528322];
const PREMIUM_MERCHANDISING = [654163, 643715, 633716, 624150, 615000, 612468, 590425, 570500, 552500, 536250, 520310, 512627, 505450, 498750, 492500, 490000, 487613, 485334, 483162, 481092];
const PREMIUM_LEAGUE_FACTOR = [1, 0.85, 0.72];
const PREMIUM_END_OF_SEASON_FACTOR = 2;

const PHYSIO_COSTS = 10000;

const CUP_FIXTURES = {3: '1. Runde', 15: '2. Runde', 27: '3. Runde', 39: 'Achtelfinale', 51: 'Viertelfinale', 63: 'Halbfinale', 69: 'Finale'};
const OSE_FIXTURES = {
	5: '1. Qualirunde Hin',
	7: '1. Qualirunde Rück',
	11: '2. Qualirunde Hin',
	13: '2. Qualirunde Rück',
	17: '3. Qualirunde Hin',
	19: '3. Qualirunde Rück',
	23: '1. Runde Hin',
	25: '1. Runde Rück',
	29: '2. Runde Hin',
	31: '2. Runde Rück',
	35: '3. Runde Hin',
	37: '3. Runde Rück',
	41: '4. Runde Hin',
	43: '4. Runde Rück',
	47: 'Achtelfinale Hin',
	49: 'Achtelfinale Rück',
	53: 'Viertelfinale Hin',
	55: 'Viertelfinale Rück',
	59: 'Halbfinale Hin',
	61: 'Halbfinale Rück',
	71: 'Finale'};
const OSC_FIXTURES = {
	5: '1. Qualirunde Hin',
	7: '1. Qualirunde Rück',
	11: '2. Qualirunde Hin',
	13: '2. Qualirunde Rück',
	17: '1. Gruppenspiel HR',
	19: '2. Gruppenspiel HR',
	23: '3. Gruppenspiel HR',
	25: '4. Gruppenspiel HR',
	29: '5. Gruppenspiel HR',
	31: '6. Gruppenspiel HR',
	35: '1. Gruppenspiel ZR',
	37: '2. Gruppenspiel ZR',
	41: '3. Gruppenspiel ZR',
	43: '4. Gruppenspiel ZR',
	47: '5. Gruppenspiel ZR',
	49: '6. Gruppenspiel ZR',
	53: 'Viertelfinale Hin',
	55: 'Viertelfinale Rück',
	59: 'Halbfinale Hin',
	61: 'Halbfinale Rück',
	71: 'Finale'};

/** Style constants */

const STYLE_FORECAST = 'osext-forecast';
const STYLE_INACTIVE = 'osext-inactive';
const STYLE_PRIMARY = 'osext-primary';
const STYLE_HIDDEN = 'osext-hidden';

const STYLE_SET_ZAT = 'osext-set-zat';
const STYLE_ADD = 'add';
const STYLE_DELETE = 'delete';

const STYLE_SET_CONTRACT = 'osext-set-contract';

const STYLE_REFRESH = 'osext-refresh';
const STYLE_YOUTH = 'osext-youth';
const STYLE_YOUTH_YEAR_HEADER = 'osext-youth-year-header';
const STYLE_TRAINER = 'osext-trainer';

const STYLE_MESSAGE = 'osext-message';
const STYLE_ERROR = 'osext-error';
const STYLE_WARNING = 'osext-warning';
const STYLE_STATUS = 'osext-status';

const STYLE_MONTH = 'osext-month';




/**
 * Ensures the object has the clasz prototype. If not the prototype is added.
 * In case of an array, the prototype is added to each object in the array.
 *
 * Even though the setPrototypeOf can have a performance impact, it is used
 * instead recreating the objects.
 *
 * @param {*} sourceObject the object
 * @param {Function} clasz the function constructor for the object
 * @returns the object as 'instance of' clasz
 */
const ensurePrototype = (sourceObject, clasz) => {
	if (!sourceObject) {
		return sourceObject;
	}
	else if (Array.isArray(sourceObject)) {
		sourceObject.forEach(obj => obj && Object.setPrototypeOf(obj, clasz.prototype));
		return sourceObject;
	} else {
		return sourceObject instanceof clasz ? sourceObject : Object.setPrototypeOf(sourceObject, clasz.prototype);
	}
}

/**
 * Returns a promise with the given executor. The new promise always waits for the last
 * requested promise to resolve. This ensures synchronized serial execution.
 *
 * @param executor a callback used to initialize the promise
 * @returns {Promise}
 */
const getQueuedPromise = (() => {
	let pending = Promise.resolve();
	const run = async (executor) => {
		try {
			await pending;
		} finally {
			/*eslint no-unsafe-finally: 'off'*/
			return getTimedPromise(executor);
		}
	}
	return (executor) => (pending = run(executor));
})();

/**
 * Returns a promise with the given executor. The new promise will be rejected after a the given timout in millis,
 * if the executor doesn't resolve before.
 *
 * @param executor a callback used to initialize the promise
 * @param timeout the timeout in millis
 * @returns {Promise}
 */
const getTimedPromise = (executor, timeout = Options.timeout) => {
    return new Promise((resolve, reject) => {
		const timerID = setTimeout(() => reject(new Error('Die Verarbeitung hat zu lange gedauert!')), timeout);
		return executor(value => {
			clearTimeout(timerID); 
			resolve(value);
		}, reject);
	});
}