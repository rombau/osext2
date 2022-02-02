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


/** Style constants */

const STYLE_FORECAST = 'osext-forecast';
const STYLE_INACTIVE = 'osext-inactive';
const STYLE_PRIMARY = 'osext-primary';
const STYLE_HIDDEN = 'osext-hidden';

const STYLE_FAST_TRANSFER = 'osext-fast-transfer';
const STYLE_FAST_TRANSFER_ADD = 'add';
const STYLE_FAST_TRANSFER_DELETE = 'delete';

const STYLE_REFRESH = 'osext-refresh';
const STYLE_YOUTH = 'osext-youth';
const STYLE_YOUTH_YEAR_HEADER = 'osext-youth-year-header';
const STYLE_TRAINER = 'osext-trainer';

const STYLE_MESSAGE = 'osext-message';
const STYLE_ERROR = 'osext-error';
const STYLE_WARNING = 'osext-warning';
const STYLE_STATUS = 'osext-status';




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
function ensurePrototype (sourceObject, clasz) {

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
