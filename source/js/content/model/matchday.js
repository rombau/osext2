/**
 * Enum for competition types.
 * @readonly
 */
 const Competition = Object.freeze({
	FRIENDLY: 'Friendly',
	LEAGUE: 'Liga',
	CUP: 'LP',
	OSEQ: 'OSEQ',
	OSE: 'OSE',
	OSCQ: 'OSCQ',
	OSC: 'OSC',
});

/**
 * Enum for place types.
 * @readonly
 */
 const GameLocation = Object.freeze({
	HOME: 'Heim',
	AWAY: 'Auswärts'
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

		/** @type {GameLocation} the ganme location */
		this.location;

		/** @type {Team} the oponent team */ 
		this.opponent = new Team();

		/** @type {String} the game result */
		this.result;

		/** @type {Number} the friendly share for the team */
		this.friendlyShare;

	}

}
