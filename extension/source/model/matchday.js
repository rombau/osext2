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
	OSC: 'OSC'
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

		/** @private @type {Team} */ 
		this._opponent;

		/** @type {String} the game result */
		this.result;

		/** @type {Number} the friendly share for the team */
		this.friendlyShare;

		// the follwing attributes only calculated and not persisted

		/** @type {Promise<MatchDay>} the account balance promise for this match day */ 
		this.accountBalancePromise;

		/** @type {Number} the account balance before this match day */ 
		this.accountBalanceBefore;

		/** @type {Number} the stadium income */ 
		this.stadiumIncome;

		/** @type {Number} the stadium costs */ 
		this.stadiumCosts;

		/** @type {Number} the fiendly income */ 
		this.fiendlyIncome;

		/** @type {Number} the advertising (tv) income */ 
		this.advertisingIncome;

		/** @type {Number} the merchandising income */ 
		this.merchandisingIncome;

		/** @type {Number} the youth support */ 
		this.youthSupport;

		/** @type {Number} the account balance after this match day */ 
		this.accountBalance;
	}

	/**
	 * @type {Team} the opponent team
	 */
	get opponent () {
		return ensurePrototype(this._opponent, Team);
	}

	set opponent (value) {
		this._opponent = value;
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
		return (this.season * SEASON_MATCH_DAYS + this.zat) < (matchday.season * SEASON_MATCH_DAYS + matchday.zat);
	}

	/**
	 * Returns ture if this match day is after the given one.
	 * 
	 * @param {MatchDay} matchday 
	 * @returns {Boolean}
	 */
	after (matchday) {
		return (this.season * SEASON_MATCH_DAYS + this.zat) > (matchday.season * SEASON_MATCH_DAYS + matchday.zat);
	}
	
	/**
	 * Returns the interval of this match day to the given one in days (zats).
	 * 
	 * @param {MatchDay} matchday 
	 * @returns {Number}
	 */
	intervalTo (matchday) {
		if (this.after(matchday)) {
			return (this.season * SEASON_MATCH_DAYS + this.zat) - (matchday.season * SEASON_MATCH_DAYS + matchday.zat);
		}
		return (matchday.season * SEASON_MATCH_DAYS + matchday.zat) - (this.season * SEASON_MATCH_DAYS + this.zat);
	}

	/**
	 * Adds the given days (zats) to the match day.
	 * 
	 * @param {Number} zats
	 * @returns {MatchDay}
	 */
	add (zats) {
		this.zat += zats;
		while (this.zat > SEASON_MATCH_DAYS) {
			this.zat -= SEASON_MATCH_DAYS;
			this.season++;
		}
		return this;
	}

	/**
	 * Returns the match day income based on the available stadium.
	 * 
	 * @param {Stadium} stadium the available stadium at this match day
	 * @param {*} viewSettings the view settings inluding ticket prices and load factor
	 * @returns {Number}
	 */
	calculateMatchDayIncome (stadium, viewSettings) {
		ensurePrototype(stadium, Stadium);
		if (this.competition === Competition.LEAGUE && this.opponent) {
			if (this.location == GameLocation.HOME) {
				this.stadiumIncome = stadium.calculateIncome(viewSettings.ticketPrice.league, viewSettings.stadiumLoad || 100);
				this.stadiumCosts = stadium.calculateCosts(viewSettings.stadiumLoad || 100);
				return this.stadiumIncome - this.stadiumCosts;
			}
			return 0;
		} else if (this.competition === Competition.CUP && this.opponent) {
			this.stadiumIncome = Math.round(stadium.calculateIncome(viewSettings.ticketPrice.cup, viewSettings.stadiumLoad || 100) / 2);
			this.stadiumCosts = Math.round(stadium.calculateCosts(viewSettings.stadiumLoad || 100) / 2);
			return this.stadiumIncome - this.stadiumCosts;
		} else if ((this.competition === Competition.OSEQ || this.competition === Competition.OSE || this.competition === Competition.OSCQ || this.competition === Competition.OSC) && this.opponent) {
			if (this.location == GameLocation.HOME) {
				this.stadiumIncome = stadium.calculateIncome(viewSettings.ticketPrice.international, viewSettings.stadiumLoad || 100);
				this.stadiumCosts = stadium.calculateCosts(viewSettings.stadiumLoad || 100);
				return this.stadiumIncome - this.stadiumCosts;
			}
			return 0;
		} else {
			this.fiendlyIncome = STADIUM_FRIENDLY_INCOME * (this.friendlyShare || 50) / 100;
			return this.fiendlyIncome;
		}
	}

	/**
	 * Returns the match day premium amount based on the competition.
	 * 
	 * @param {Team.League} league the league attributes for premium
	 * @param {*} viewSettings the view settings inluding current league ranking
	 * @returns {Number}
	 */
	calculatePremium (league, viewSettings) {
		if ((this.competition === Competition.LEAGUE && this.location == GameLocation.HOME) || this.zat === SEASON_MATCH_DAYS) {
			let ranking = viewSettings.leagueRanking;
			if (league.size == 10) {
				ranking = ranking * 2 - 1;
			}
			this.advertisingIncome = Math.round(PREMIUM_ADVERTISING[ranking - 1] * PREMIUM_LEAGUE_FACTOR[league.level - 1]); 
			this.merchandisingIncome = Math.round(PREMIUM_MERCHANDISING[ranking - 1] * PREMIUM_LEAGUE_FACTOR[league.level - 1]);
			if (this.zat === SEASON_MATCH_DAYS) {
				this.advertisingIncome *= PREMIUM_END_OF_SEASON_FACTOR; 
				this.merchandisingIncome *= PREMIUM_END_OF_SEASON_FACTOR;
			}
			return this.advertisingIncome + this.merchandisingIncome;
		}
		return 0;
	}
}
