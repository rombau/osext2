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

	/**
	 * @param {Number} season 
	 * @param {Number} zat 
	 */
	constructor(season, zat) {
			
		/** @type {Number} the season number */ 
		this.season = season;

		/** @type {Number} the number of this match day in the season */ 
		this.zat = zat;

		/** @type {Competition} the competition */
		this.competition;

		/** @type {Team} the oponent team */ 
		this.opponent = new Team();

	}
}
