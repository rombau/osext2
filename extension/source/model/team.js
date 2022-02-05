/**
 * Team representation.
 */
class Team {

	/**
	 * @param {Number} id 
	 * @param {String} name 
	 */
	constructor(id, name) {
		
		/** @type {Number} the internal id */ 
		this.id = id;

		/** @type {String} the name of the team */ 
		this.name = name;

		/** @type {String} the emblem file name */ 
		this.emblem;

		/** @type {Team.League} the league this team belong to */ 
		this._league = new Team.League();
		
		/** @type {Number} the current league ranking */ 
		this.leagueRanking;
		
		/** @private @type {[SquadPlayer]} */ 
		this._squadPlayers = [];
		
		/** @private @type {[YouthPlayer]} */ 
		this._youthPlayers = [];

		/** @private @type {[MatchDay]} */ 
		this._matchDays = [];

		/** @private @type {[Team.Trainer]} */ 
		this._trainers = [];
	}

	/**
	 * @type {Team} the current team
	 */
	get league () {
		return ensurePrototype(this._league, Team.League);
	}

	/**
	 * @type {[SquadPlayer]} the squad players
	 */
	get squadPlayers () {
		return ensurePrototype(this._squadPlayers, SquadPlayer);
	}

	set squadPlayers (value) {
		this._squadPlayers = value;
	}

	/**
	 * @type {[YouthPlayer]} the youth players
	 */
	get youthPlayers () {
		return ensurePrototype(this._youthPlayers, YouthPlayer);
	}

	set youthPlayers (value) {
		this._youthPlayers = value;
	}

	/**
	 * @type {[MatchDay]} the match days (ZATS) of the current (and following) saison(s)
	 */
	get matchDays () {
		return ensurePrototype(this._matchDays, MatchDay);
	}

	set matchDays (value) {
		this._matchDays = value;
	}

	/**
	 * @type {[Team.Trainer]} the trainers for training the squad player
	 */
	get trainers () {
		return ensurePrototype(this._trainers, Team.Trainer);
	}

	set trainers (value) {
		this._trainers = value;
	}

	
	/**
	 * Returns the squad player with the given id. If the player can't be found, a new one is added to the team and returned.
	 * 
	 * @param {Number} id the id of the player to find (or add)
	 * @returns {SquadPlayer} the player
	 */
	getSquadPlayer (id) {
		if (!id) return undefined;

		let player = this.squadPlayers.find(player => player.id === id);
		if (!player) {
			player = new SquadPlayer();
			player.id = id;
			this.squadPlayers.push(player);
		}
		return player;
	}

	/**
	 * Returns the youth player with the given index. If the player can't be found, a new one is added to the team and returned.
	 * 
	 * @param {Number} index the index of the player on the page and the array
	 * @returns {YouthPlayer} the player
	 */
	getYouthPlayer (index) {
		let player = this.youthPlayers[index];
		if (!player) {
			player = new YouthPlayer();
		}
		this.youthPlayers[index] = player;
		return player;
	}

	/**
	 * Returns the match day with the season and zat. If the match day can't be found, a new one is added to the team and returned.
	 * 
	 * @param {Number} season the season of the match day to find (or add)
	 * @param {Number} zat the zat of the match day to find (or add)
	 * @returns {MatchDay} the match day
	 */
	getMatchDay (season, zat) {
		if (!season || !zat) return undefined;

		let matchDay = this.matchDays.find(matchDay => matchDay.season === season && matchDay.zat === zat);
		if (!matchDay) {
			matchDay = new MatchDay(season, zat);
			this.matchDays.push(matchDay);
		}
		return matchDay;
	}

	/**
	 * Returns the trainer with the given id. If the trainer can't be found, a new one is added to the team and returned.
	 * 
	 * @param {Number} nr the id of the trainer to find (or add)
	 * @returns {Team.Trainer} the trainer
	 */
	getTrainer (nr) {
		if (!nr) return undefined;

		let trainer = this.trainers.find(trainer => trainer.nr === nr);
		if (!trainer) {
			trainer = new Team.Trainer();
			trainer.nr = nr;
			this.trainers.push(trainer);
		}
		return trainer;
	}

	/**
	 * Returns a forecast of the team for the given target match day.
	 * The team is 'cached' in the appropriate target match day.
	 * 
	 * @param {MatchDay} lastMatchDay the last match day
	 * @param {MatchDay} targetMatchDay the target match day
	 * @returns {Team} the forecast of the team
	 */
	getForecast (lastMatchDay, targetMatchDay) {
		if (lastMatchDay.equals(targetMatchDay)) return this;

		let forecastTeam = new Team();

		let matchDaysInRange = this.matchDays.filter(matchDay => {
			return matchDay.after(lastMatchDay) && !matchDay.after(targetMatchDay);
		});
		
		this.squadPlayers.forEach(player => {
			forecastTeam.squadPlayers.push(player.getForecast(lastMatchDay, targetMatchDay, matchDaysInRange));
		});
		this.youthPlayers.forEach(player => {
			// forecastTeam.youthPlayers.push(player.getForecast(lastMatchDay, targetMatchDay));
		});

		return forecastTeam;
	}
		
			
	/**
	 * Completes the initialization of the team data.
	 * 
	 * @param {MatchDay} lastMatchDay the last match day
	 */
	complete (lastMatchDay) {
		this.squadPlayers.forEach(player => player.complete(lastMatchDay));

		// take over the current season league match days to forecast seasons
		let currentSeasonSchedule = this.matchDays.filter(matchDay => matchDay.season === lastMatchDay.season && matchDay.competition === Competition.LEAGUE);
		for (let season = lastMatchDay.season + 1; season < lastMatchDay.season + Options.forecastSeasons; season++) {
			currentSeasonSchedule.forEach(matchDay => {
				let forecastSeasonMatchDay = this.getMatchDay(season, matchDay.zat);
				forecastSeasonMatchDay.competition = matchDay.competition;
				forecastSeasonMatchDay.location = matchDay.location;
			});
		}
	}

}

/**
 * League representation.
 */
Team.League = class {
	
	constructor() {

		/** @type {Number} the league level */ 
		this.level;
		
		/** @type {Number} the league team count */ 
		this.size;

		/** @type {String} the league country name */ 
		this.countryName;

		/** @type {[Team]} the teams sorted by current ranking */
		this.teams = [];
	}
}

/**
 * Trainer representation.
 */
Team.Trainer = class {
	
	constructor() {

		/** @type {Number} the number of the trainer  */ 
		this.nr;

		/** @type {Number} the contract term in match days (zats) */
		this.contractTerm;

		/** @type {Number} the monthly salary */
		this.salary;
		
		/** @type {Number} the legacy skill of the trainer */
		this.legacySkill;

		/** @type {Number} the skill value the trainer can train to */
		this.upToSkill;
	}

	static LIST = {
		'Trainer 01': { legacySkill : 20, upToSkill : 60 },
		'Trainer 02': { legacySkill : 25, upToSkill : 62 },
		'Trainer 03': { legacySkill : 30, upToSkill : 65 },
		'Trainer 04': { legacySkill : 35, upToSkill : 67 },
		'Trainer 05': { legacySkill : 40, upToSkill : 70 },
		'Trainer 06': { legacySkill : 45, upToSkill : 72 },
		'Trainer 07': { legacySkill : 50, upToSkill : 75 },
		'Trainer 08': { legacySkill : 55, upToSkill : 77 },
		'Trainer 09': { legacySkill : 60, upToSkill : 80 },
		'Trainer 10': { legacySkill : 65, upToSkill : 82 },
		'Trainer 11': { legacySkill : 70, upToSkill : 85 },
		'Trainer 12': { legacySkill : 75, upToSkill : 87 },
		'Trainer 13': { legacySkill : 80, upToSkill : 90 },
		'Trainer 14': { legacySkill : 85, upToSkill : 92 },
		'Trainer 15': { legacySkill : 90, upToSkill : 95 },
		'Trainer 16': { legacySkill : 95, upToSkill : 97 },
		'Trainer 17': { legacySkill : 99, upToSkill : 99 }
	}
}