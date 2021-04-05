/**
 * Enum for ban types.
 * @readonly
 */
 const BanType = Object.freeze({
	LEAGUE: 'league',
	CUP: 'cup',
	INTERNATIONAL: 'international'
});

/**
 * Enum for transfer states.
 * @readonly
 */
 const TransferState = Object.freeze({
	UNSELLABLE: 'U',
	NORMAL: 'N',
	OFFER: 'A',
	TRANSFER: 'T'
});

/**
 * Squad player representation.
 */
class SquadPlayer extends Player {

	constructor() {

		super();
		
		/** @type {String} the name */
		this.name;

		/** @type {Skill} the position */
		this.pos;

		/** @type {Number} the moral value */
		this.moral;

		/** @type {Number} the fitness value */
		this.fitness;

		/** the bans for upcomming matchdays */
		this.bans = {

			/** @type {Number} leage games banned */
			league: null,

			/** @type {Number} cup games banned */
			cup: null,

			/** @type {Number} international games banned */
			international: null
		};

		/** @type {Number} injured for upcomming matchdays */
		this.injured;

		/** @type {TransferState} the transfer state */
		this.transferState;

		/** @type {Number} the games locked for transfer */
		this.transferLock;

		/** @type {Number} the contract term in month */
		this.contractTerm;

		/** @type {Number} the monthly salary */
		this.salary;

		/** @type {Number} the market value */
		this.marketValue;

		/** @type {MatchDay} the match day (ZAT) the player should be fastly transfered ('Blitz') */ 
		this.fastTransfer;
		
	}
}
