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

const WIN_BONUS = 200000;
const WIN_BONUS_BY_RANKING = {
	20: [28.9, 27.2, 25.8, 25, 24.1, 23.6, 22.8, 21.5, 20.6, 20.1, 19.4, 17.9, 17.5, 16.1, 15.2, 14.6, 13.4, 11.8, 9, 5.6],
	10: [28.2, 25.2, 23.3, 21.3, 19.3, 17.4, 15.6, 13.3, 10.2, 6.2],
	18: [27.1, 24.7, 23, 22, 21, 20.3, 19.6, 18.8, 18, 17.2, 16.7, 15.4, 14.2, 13.3, 11.6, 10.1, 7.9, 5]
};

const POTENTIAL_DURATION = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,58,59,60,62,63,65,66,68,70,71,73,75,77,79,82,84,87,89,92,95,98,101,104,108,112,116,120,125,130,136,142,148,155,163,171,181,192,205,220,238,261,292,340];
const POTENTIAL_DAYS = [-1505,-1426,-1346,-1267,-1188,-1109,-1030,-950,-871,-792,-713,-634,-554,-475,-396,-317,-238,-158,-79,0,72,138,198,254,304,350,392,431,465,497,526,551,575,596,615,632,648,662,674,685];
const POTENTIAL_FACTOR = [110,110,110,110,110,110,110,110,110,110,110,110,110,110,110,110,110,110,110,100,92,84,77,70,64,58,53,48,44,40,36,33,29,26,24,21,19,17,15,14];

const PHYSIO_COSTS = 10000;

const CUP_FIXTURES = {
	3: '1. Runde',
	15: '2. Runde',
	27: '3. Runde',
	39: 'Achtelfinale',
	51: 'Viertelfinale',
	63: 'Halbfinale',
	69: 'Finale'
};

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
	71: 'Finale'
};

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
	71: 'Finale'
};

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
};

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
};
