/**
 * Enum for competition types.
 * @readonly
 */
 const Competition = Object.freeze({
	FRIENDLY: 'Fiendly',
	LEAGUE: 'Liga',
	CUP: 'LP',
	OSEQ: 'OSEQ',
	OSE: 'OSE',
	OSCQ: 'OSCQ',
	OSC: 'OSC',
});

/**
 * Match day (ZAT) representation.
 */
class MatchDay {

	constructor() {
			
		/** @type {Number} the season number */ 
		this.season;

		/** @type {Number} the number of this match day in the season */ 
		this.zat;

		/** @type {Competition} the competition */
		this.competition;

		/** @type {Team} the oponent team */ 
		this.opponent = new Team();

	}
}
