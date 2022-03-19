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
			
		/** @private @type {[SquadPlayer]} */ 
		this._squadPlayers = [];
		
		/** @private @type {[YouthPlayer]} */ 
		this._youthPlayers = [];

		/** @private @type {[MatchDay]} */ 
		this._matchDays = [];

		/** @private @type {[Team.Trainer]} */ 
		this._trainers = [];

		/** @type {Stadium} the stadium data */ 
		this.stadium = new Stadium();

		/** @type {Number} the current account balance */ 
		this.accountBalance;
	}

	/**
	 * @type {Team.League} the current team league
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
		return ensurePrototype(player, SquadPlayer);
	}

	/**
	 * Returns the youth player with the given index and pull id. 
	 * If the player can't be found, a new one is added to the team (at the given index).
	 * Otherwise if the pull id of the player doesn't match with the existing player 
	 * (at the given index), the one at the index was already pulled to squad and will 
	 * be removed from the list.
	 * 
	 * @param {Number} index the index of the player on the page and the array
	 * @param {Number} pullId the pull id of the player for pull to squad
	 * @returns {YouthPlayer} the player
	 */
	getYouthPlayer (index, pullId) {
		let player = this.youthPlayers[index];
		if (!player) {
			player = new YouthPlayer();
		}
		while (player.pullId && player.pullId !== pullId) {
			this.youthPlayers.splice(index, 1);
			player = this.youthPlayers[index];
			if (!player) {
				player = new YouthPlayer();
				break;
			}
		}
		if (pullId) player.pullId = pullId;
		this.youthPlayers[index] = player;
		return ensurePrototype(player, YouthPlayer);
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
		let forecastTeam = new Team();
		
		forecastTeam.origin = this;

		if (targetMatchDay) {
			if (lastMatchDay.equals(targetMatchDay)) return this;
			
			let matchDaysInRange = this.getMatchDaysInRange(lastMatchDay, targetMatchDay).slice(1);
			
			this.squadPlayers.forEach(player => {
				forecastTeam.squadPlayers.push(player.getForecast(lastMatchDay, targetMatchDay, matchDaysInRange));
			});
		}

		this.youthPlayers.forEach(player => {
			forecastTeam.youthPlayers.push(player.getForecast(lastMatchDay, targetMatchDay));
		});

		// TODO forecast trainers?
		forecastTeam.trainers = this.trainers;

		return forecastTeam;
	}
	
	/**
	 * Returns a (new) list of the season match days with calculated balance.
	 * 
	 * @param {Number} seaeson the season
	 * @returns {[MatchDay]} list of match days
	 */
	getMatchDaysWithBalance (selectedSeason, lastMatchDay, viewSettings) {
		let balancedMatchDays = [];
		let stadium = this.stadium;
		let accountBalance = this.accountBalance;
		for (let season = selectedSeason; season < (selectedSeason + Options.forecastSeasons); season++) {
			for (let zat = 1; zat < SEASON_MATCH_DAYS; zat++) {
				let newMatchDay = this.copyScheduledMatchDay(season, zat);
				stadium = newMatchDay.stadium || stadium;
				if (newMatchDay.after(lastMatchDay)) {
					let forecastedTeam = this.getForecast(lastMatchDay, newMatchDay);
					accountBalance += newMatchDay.calculateMatchDayIncome(stadium, viewSettings);
					accountBalance += newMatchDay.calculatePremium(this.league, viewSettings);
					accountBalance += this.calculateYouthSupport(forecastedTeam.youthPlayers, viewSettings); // TODO youth barrier?
					if (newMatchDay.zat % MONTH_MATCH_DAYS === 0) {
						accountBalance += this.calculateSquadSalary(forecastedTeam.squadPlayers);
						accountBalance += this.calculateLoan(forecastedTeam.squadPlayers);
						accountBalance += this.calculateTrainerSalary(forecastedTeam.trainers);
					}
					accountBalance += this.calculateFastTransferIncome(forecastedTeam.squadPlayers);
					newMatchDay.accountBalance = accountBalance;
				}
				balancedMatchDays.push(newMatchDay);
			}
		}
		return balancedMatchDays;
	}

	/**
	 * Returns the youth support costs for a match day.
	 * 
	 * @param {[YouthPlayer]} players the list of youth players
	 * @param {*} viewSettings the settings the season
	 * @returns {Number} the costs
	 */
	calculateYouthSupport (players, viewSettings) {

	}

	calculateSquadSalary (players) {

	}

	calculateLoan (players) {

	}

	/** 
	 * @private @type {[Team.Trainer]} 
	 */ 
	calculateTrainerSalary (trainers) {

	}

	/** 
	 * @private @type {[SquadPlayer]} 
	 */ 
	calculateFastTransferIncome (players) {

	}

	/**
	 * Returns a list of match days in a range. 
	 * 
	 * The list is generated based on the teams season match days. If the range exceeds the
	 * season, the list is filled up with similar match days of the season before.
	 * 
	 * @param {MatchDay} firstMatchDay the first match day
	 * @param {MatchDay} lastMatchDay the last target match day
	 * @returns {[MatchDay]} list of match days
	 */
	getMatchDaysInRange (firstMatchDay, lastMatchDay) {
		let matchDaysInRange = [];
		let targetMatchDay = new MatchDay(firstMatchDay.season, firstMatchDay.zat);
		do {
			matchDaysInRange.push(this.copyScheduledMatchDay(targetMatchDay.season, targetMatchDay.zat));
		} while (!targetMatchDay.add(1).after(lastMatchDay)) 
		return matchDaysInRange;
	}

	/**
	 * Returns a new match day copy with the given season and zat, with the referenced attributes 
	 * of the scheduled match day.
	 * 
	 * @param {Number} season the match day season
	 * @param {Number} zat the match day zat 
	 * @returns new match day
	 */
	copyScheduledMatchDay (season, zat) {
		let copyMatchDay = new MatchDay(season, zat);
		let scheduledMatchDay = this.matchDays.find(matchDay => matchDay.zat === zat);
		if (scheduledMatchDay) {
			copyMatchDay.competition = scheduledMatchDay.competition;
			copyMatchDay.location = scheduledMatchDay.location;
			copyMatchDay.accountBalance = scheduledMatchDay.accountBalance;
			scheduledMatchDay = this.matchDays.find(matchDay => matchDay.season === season && matchDay.zat === zat) || scheduledMatchDay;
			copyMatchDay.stadium = scheduledMatchDay.stadium;
		} else {
			copyMatchDay.competition = Competition.FRIENDLY;
		}
		return copyMatchDay;
	}
			
	/**
	 * Completes the initialization of the team data.
	 * 
	 * @param {MatchDay} lastMatchDay the last match day
	 */
	complete (lastMatchDay) {
		this.squadPlayers.forEach(player => ensurePrototype(player, SquadPlayer).complete(lastMatchDay));
		this.youthPlayers.forEach(player => ensurePrototype(player, YouthPlayer).complete(lastMatchDay));
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