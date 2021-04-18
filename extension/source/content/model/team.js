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
		this.league = new Team.League();
		
		/** @type {Number} the current league ranking */ 
		this.leagueRanking;
		
		/** @type {[SquadPlayer]]} the squad players */ 
		this.squadPlayers = [];
		
		/** @type {[YouthPlayer]]} the youth players */ 
		this.youthPlayers = [];

		/** @type {[MatchDay]} the match days (ZATS) of the current (and following) saison(s) */ 
		this.matchDays = [];

		/** @type {[Team.Trainer]} the trainers for training the squad player */ 
		this.trainers = [];
	}

	/**
	 * Returns the squad player with the given id. If the player can't be found, a new one is added to the team and returned.
	 * 
	 * @param {Number} id the id of the player to find (or add)
	 * @returns {SquadPlayer} the player
	 */
	getSquadPlayer (id) {
		if (!id) return undefined;

		let player = this.squadPlayers.find(trainer => trainer.id === id);
		if (player) {
			Object.setPrototypeOf(player, SquadPlayer.prototype);
			return player;
		}
		player = new SquadPlayer();
		player.id = id;
		this.squadPlayers.push(player);
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
		if (matchDay) {
			Object.setPrototypeOf(matchDay, MatchDay.prototype);
			return matchDay;
		}
		matchDay = new MatchDay(season, zat);
		this.matchDays.push(matchDay);
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
		if (trainer) {
			Object.setPrototypeOf(trainer, Team.Trainer.prototype);
			return trainer;
		}
		trainer = new Team.Trainer();
		trainer.nr = nr;
		this.trainers.push(trainer);
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

		targetMatchDay = this.getMatchDay(targetMatchDay.season, targetMatchDay.zat);
		if (!targetMatchDay.team) {
			targetMatchDay.team = new Team();
			let matchDaysInRange = this.matchDays.filter(matchDay => {
				Object.setPrototypeOf(matchDay, MatchDay.prototype);
				matchDay.after(lastMatchDay) && !matchDay.after(targetMatchDay);
			});
			this.squadPlayers.forEach(player => {
				targetMatchDay.team.squadPlayers.push(player.getForecast(lastMatchDay, targetMatchDay, matchDaysInRange));
			});
			this.youthPlayers.forEach(player => {
				// targetMatchDay.team.youthPlayers.push(player.getForecast(lastMatchDay, targetMatchDay));
			});
		} else {
			targetMatchDay.team = Object.assign(new Team(), targetMatchDay.team);
		}
		return targetMatchDay.team;
	}

	/**
	 * Returns the data of the team that have to be stored.
	 * 
	 * @returns {Team} the team to store
	 */
	getStorageData () {
		let teamToStore = new Team();
		
		this.squadPlayers.filter((player) => player.fastTransfer).forEach((player) => {
			let playerToStore = new SquadPlayer();
			playerToStore.id = player.id;
			playerToStore.fastTransfer = player.fastTransfer;
			teamToStore.squadPlayers.push(playerToStore);
		});
		
		return teamToStore;
	}

	/**
	 * Applies stored team data to the current team.
	 * 
	 * @param {Team} data the team data to be restored
	 */
	applyStorageData (teamToRestore) {
		if (teamToRestore && teamToRestore.squadPlayers) {
			teamToRestore.squadPlayers.forEach(player => Object.assign(this.getSquadPlayer(player.id), player));
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
		
	}
}