/**
 * Extension data
 */
class ExtensionData {
	
	constructor () {
			
		/** @private @type {Team} */
		this._team = new Team();
		
		/** @type {Number} the next zat */ 
		this.nextZat;
		
		/** @type {Number} the next zat season */ 
		this.nextSeason;
		
		this.viewSettings = {
			
			/** @private @type {MatchDay} */
			_squadPlayerMatchDay : undefined,


			/** @type {MatchDay} the current match day for squad players views */
			get squadPlayerMatchDay () {
				return ensurePrototype(this._squadPlayerMatchDay, MatchDay);
			},

			set squadPlayerMatchDay(value) {
				this._squadPlayerMatchDay = value;
			}
		}
		
	}

	/**
	 * @type {MatchDay} the next match day
 	 */
	get nextMatchDay () {
		return this.team.getMatchDay(this.nextSeason, this.nextZat);
	}

	/**
	 * @type {MatchDay} the last match day
	 */
	get lastMatchDay () {
		if (this.nextZat === 1) {
			return this.team.getMatchDay(this.nextSeason - 1, SEASON_MATCH_DAYS);
		}
		return this.team.getMatchDay(this.nextSeason, this.nextZat - 1);
	}

	/**
	 * @type {Team} the current team
	 */
	get team () {
		return ensurePrototype(this._team, Team);
	}

	/**
	 * Initializes the next zat. During saison interval the next zat is always set to 1.
	 * 
	 * @param {Number} zat 
	 */
	initNextZat (zat) {
		this.nextZat = (zat <= 1 || zat > SEASON_MATCH_DAYS) ? 1 : zat;	
	}

	/**
	 * Initializes the next zat season, if not yet set. This method should be called after
	 * extracting the season schedule.
	 * 
	 * During the season interval (zat=1) there are two possible options for the season schedule:
	 * - the previous season was extracted (with all the already played games):
	 *   the season of the next zat can be set (season + 1)
	 * - the new season (or nothing) was extracted:
	 *   the previous season has to be loaded for future forecasts; return false
	 * 
	 * @param {Number} the next zat season
	 * @returns {Boolean} true if the next zat season can be set and false otherwise
	 */
	initNextSeason (season) {
		if (!this.nextSeason) {
			if (this.nextZat == 1) {
				if (this.team.matchDays.find(matchDay => matchDay.result)) {
					this.nextSeason = season + 1;
					return true;
				}
				return false;
			}
			this.nextSeason = season;
		}
		return true;
	}
		
	/**
	 * Completes the initialization of the extension data.
	 */
	complete () {
		this.team.complete(this.lastMatchDay);
	}
	
}