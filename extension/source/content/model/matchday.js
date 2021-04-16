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

		/** @type {Team} the current team view at this matchday */ 
		this.team;

		/** @type {Team} the opponent team */ 
		this.opponent;

		/** @type {String} the game result */
		this.result;

		/** @type {Number} the friendly share for the team */
		this.friendlyShare;

	}

	/**
	 * Returns ture if this and the given match day are equal.
	 * 
	 * @param {MatchDay} matchday 
	 * @returns {Boolean}
	 */
	equals (matchday) {
		return this.zat === matchday.zat && this.season === matchday.season;
	}
	
	/**
	 * Returns ture if this match day is before the given one.
	 * 
	 * @param {MatchDay} matchday 
	 * @returns {Boolean}
	 */
	before (matchday) {
		return (this.season * SAISON_MATCH_DAYS + this.zat) < (matchday.season * SAISON_MATCH_DAYS + matchday.zat);
	}

	/**
	 * Returns ture if this match day is after the given one.
	 * 
	 * @param {MatchDay} matchday 
	 * @returns {Boolean}
	 */
	after (matchday) {
		return (this.season * SAISON_MATCH_DAYS + this.zat) > (matchday.season * SAISON_MATCH_DAYS + matchday.zat);
	}
	
	/**
	 * Returns the interval of this match day to the given one in days (zats).
	 * 
	 * @param {MatchDay} matchday 
	 * @returns {Number}
	 */
	intervalTo (matchday) {
		if (this.after(matchday)) {
			return (this.season * SAISON_MATCH_DAYS + this.zat) - (matchday.season * SAISON_MATCH_DAYS + matchday.zat);
		}
		return (matchday.season * SAISON_MATCH_DAYS + matchday.zat) - (this.season * SAISON_MATCH_DAYS + this.zat);
	}

	/**
	 * Adds the given days (zats) to the match day.
	 * 
	 * @param {Number} zats
	 * @returns {MatchDay}
	 */
	add (zats) {
		this.zat += zats;
		while (this.zat > SAISON_MATCH_DAYS) {
			this.zat -= SAISON_MATCH_DAYS;
			this.season++;
		}
		return this;
	}

}
