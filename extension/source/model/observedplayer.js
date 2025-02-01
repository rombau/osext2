/**
 * Enum for observation types.
 * @readonly
 */
const ObservationType = Object.freeze({
	NOTE: 'Notiz',
	TRANSFER: 'Transfer',
	LOAN: 'Leihe'
});

/**
 * Enum for transfer price types.
 * @readonly
 */
const TransferPrice = Object.freeze({
	MAX: 'Modulmax',
	MARKETVALUE: 'Marktwert',
	MIN: 'Modulmin',
	INPUT: 'Eingabe'
});

/**
 * Observed player representation.
 */
class ObservedPlayer {

	constructor () {

		/** @type {Number} the internal id */
		this.id;

		/** @type {Number} the market value */
		this.marketValue;

		/** @type {ObservationType} the observation type (default = NOTE) */
		this.type = ObservationType.NOTE;

		/** @type {MatchDay} the match day (ZAT) when the player will be transfered transfer or when the loan starts */
		this.matchDay;

		/** @type {TransferPrice} the observation type (default = NOTE) */
		this.transferPriceType;

		/** @type {Number} the price that will be payed for the player */
		this.transferPrice;

		/** @type {SquadPlayer.Loan} the planned loan */
		this.loan;
	}
};