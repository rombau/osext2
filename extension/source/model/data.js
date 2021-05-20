/**
 * Extension data
 */
class ExtensionData {
	
	constructor (dataObject) {
			
		/** @type {Team} the current team */ 
		this.currentTeam = new Team();
		
		/** @type {Number} the next zat */ 
		this.nextZat;
		
		/** @type {Number} the next zat season */ 
		this.nextZatSeason;
		
		this.viewSettings = {
			
			/** @type {MatchDay} the current match day for squad players views */
			squadPlayerMatchDay : undefined
		}
		
		if (dataObject) {
			Object.assign(this, dataObject);
			Object.setPrototypeOf(this.currentTeam, Team.prototype);
		}

	}

	/**
	 * Resets all the current team dependent data.
	 */
	clear () {
		this.currentTeam = new Team();
		this.viewSettings.squadPlayerMatchDay = undefined;
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
	initNextZatSeason (season) {
		if (!this.nextZatSeason) {
			if (this.nextZat == 1) {
				if (this.currentTeam.matchDays.find(matchDay => matchDay.result)) {
					this.nextZatSeason = season + 1;
					return true;
				}
				return false;
			}
			this.nextZatSeason = season;
		}
		return true;
	}
		
	/**
	 * @type {MatchDay} the next match day
	 */
	get nextMatchDay () {
		return this.currentTeam.getMatchDay(this.nextZatSeason, this.nextZat);
	}

	/**
	 * @type {MatchDay} the last match day
	 */
	get lastMatchDay () {
		if (this.nextZat === 1) {
			return this.currentTeam.getMatchDay(this.nextZatSeason - 1, SEASON_MATCH_DAYS);
		}
		return this.currentTeam.getMatchDay(this.nextZatSeason, this.nextZat - 1);
	}

}