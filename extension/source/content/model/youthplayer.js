/**
 * Enum for transfer states.
 * @readonly
 */
const Talent = Object.freeze({
	HIGH: 'hoch',
	NORMAL: 'normal',
	LOW: 'wenig'
});

/**
 * Youth player representation.
 */
class YouthPlayer extends Player {

	constructor() {

		super();

		/** @type {Talent} the talent */
		this.talent;
	}
}