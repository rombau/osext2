/**
 * Enum for transfer states.
 * @readonly
 */
const YouthSupportBarrierType = Object.freeze({
	AND_OLDER: '<=',
	AND_YOUNGER: '>=',
});

/**
 * Extension data
 */
class ExtensionData {

	constructor() {

		/** @type {[Page]} the queue with the pages to request */
		this._pagesToRequest;

		/** @private @type {Team} */
		this._team = new Team();

		/** @type {Number} the next zat */
		this.nextZat;

		/** @type {Number} the next zat season */
		this.nextZatSeason;

		this.viewSettings = {

			/** @type {MatchDay} */
			squadPlayerMatchDay: null,

			/** @type {MatchDay} */
			youthPlayerMatchDay: null,

			/** @type {Boolean} */
			youthMax: false,

			/** @type {Number} */
			youthSupportPerDay: YOUTH_SUPPORT_MIN,

			/** @type {Number} */
			youthSupportBarrierSeason: null,

			/** @type {YouthSupportBarrierType} */
			youthSupportBarrierType: null,

			/** @type {Number} */
			leagueRanking: 1,

			ticketPrice: {

				/** @type {Number} */
				league: 0,

				/** @type {Number} */
				cup: 0,

				/** @type {Number} */
				international: 0
			},

			/** @type {Number} */
			stadiumLoad: 100,

			/** @type {Boolean} */
			winBonus: false,
		};
	}

	/**
	 * @type {MatchDay} the next match day
	 */
	get nextMatchDay () {
		return this.team.getMatchDay(this.nextZatSeason, this.nextZat);
	}

	/**
	 * @type {MatchDay} the last match day
	 */
	get lastMatchDay () {
		if (this.nextZat === 1) {
			return this.team.getMatchDay(this.nextZatSeason - 1, SEASON_MATCH_DAYS);
		}
		return this.team.getMatchDay(this.nextZatSeason, this.nextZat - 1);
	}

	/**
	 * @type {Team} the current team
	 */
	get team () {
		return ensurePrototype(this._team, Team);
	}

	/**
	 * @type {[Page]} the pages to request
	 */
	get pagesToRequest () {
		this._pagesToRequest = this._pagesToRequest || [];
		return this._pagesToRequest;
	}

	set pagesToRequest (value) {
		this._pagesToRequest = value;
	}

	/**
	 * Adds all pages needed for initialization to the request pages array.
	 */
	requestAllPages () {
		this.pagesToRequest.push(new Page.ShowteamOverview());
		this.pagesToRequest.push(new Page.ShowteamSkills());
		this.pagesToRequest.push(new Page.ShowteamContracts());
		this.pagesToRequest.push(new Page.ShowteamSeason());
		this.pagesToRequest.push(new Page.ShowteamInfo());
		this.pagesToRequest.push(new Page.LeagueTable());
		this.pagesToRequest.push(new Page.LoanView());
		this.pagesToRequest.push(new Page.YouthOverview());
		this.pagesToRequest.push(new Page.YouthSkills());
		this.pagesToRequest.push(new Page.YouthOptions());
		this.pagesToRequest.push(new Page.AccountStatement());
		this.pagesToRequest.push(new Page.MatchDayReport());
		this.pagesToRequest.push(new Page.MatchDayOptions());
		// error during season interval	
		this.pagesToRequest.push(new Page.Trainer());
		this.pagesToRequest.push(new Page.Training());
		this.pagesToRequest.push(new Page.ContractExtension());
	}

	/**
	 * Adds all squad player pages to the request pages array.
	 */
	requestSquadPlayerPages () {
		if (this.pagesToRequest.length === 0) {
			this.pagesToRequest.push(new Page.ShowteamOverview());
			this.pagesToRequest.push(new Page.ShowteamSkills());
			this.pagesToRequest.push(new Page.ShowteamContracts());
			this.pagesToRequest.push(new Page.LoanView());
			this.pagesToRequest.push(new Page.Training());
			this.pagesToRequest.push(new Page.ContractExtension());
		}
		this.team.squadPlayerAdded = null; // reset the flag
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
	 *   the next zat is in the season of the last played game + 1
	 * - the new season was extracted:
	 *   the next zat is in the current season
	 *
	 * @param {Number} the next zat season
	 */
	initNextSeason (season) {
		if (this.nextZat == 1) {
			let lastPlayedMatchDay = this.team.matchDays.slice().reverse().find(matchDay => matchDay.result);
			if (lastPlayedMatchDay) {
				this.nextZatSeason = lastPlayedMatchDay.season + 1;
				return;
			}
		}
		if (!this.nextZatSeason || season > this.nextZatSeason) {
			this.nextZatSeason = season;
		}
	}

	/**
	 * Completes the initialization of the extension data.
	 */
	complete () {
		this.team.complete(this.lastMatchDay);
		this.viewSettings.squadPlayerMatchDay = this.viewSettings.squadPlayerMatchDay || new MatchDay(this.lastMatchDay.season, this.lastMatchDay.zat);
		this.viewSettings.youthPlayerMatchDay = this.viewSettings.youthPlayerMatchDay || new MatchDay(this.lastMatchDay.season, this.lastMatchDay.zat);
	}

}