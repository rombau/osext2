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

		/** @type {League} the league this team belong to */ 
		this.league = new League();
		
		/** @type {Number} the current league ranking */ 
		this.ranking;
		
		/** @type {[SquadPlayer]]} the squad players */ 
		this.squadPlayers = [];
		
		/** @type {[YouthPlayer]]} the youth players */ 
		this.youthPlayers = [];

		/** @type {[MatchDay]} the match days (ZATS) of the current (and following) saison(s) */ 
		this.matchDays = [];

	}

	/**
	 * Returns the squad player with the given id. If the player can't be found, a new one is added to the team and returned.
	 * 
	 * @param {Number} id the id of the player to find (or add)
	 * @returns @type {SquadPlayer} the player
	 */
	getSquadPlayer (id) {
		if (!id) return null;

		let idx = this.squadPlayers.findIndex(squadPlayer => squadPlayer.id === id);
		if (idx >= 0) {
			let player = Object.assign(new SquadPlayer(), this.squadPlayers[idx]);
			this.squadPlayers[idx] = player;
			return player;
		}	

		let player = new SquadPlayer();
		player.id = id;
		this.squadPlayers.push(player);
		return player;
	}

	/**
	 * Returns the match day with the season and zat. If the match day can't be found, a new one is added to the team and returned.
	 * 
	 * @param {Number} season the season of the match day to find (or add)
	 * @param {Number} zat the zat of the match day to find (or add)
	 * @returns @type {MatchDay} the match day
	 */
	getMatchDay (season, zat) {
		if (!season || !zat) return null;

		let matchDay;
		let idx = this.matchDays.findIndex(matchDay => matchDay.season === season && matchDay.zat === zat);
		if (idx >= 0) {
			matchDay = Object.assign(new MatchDay(season, zat), this.matchDays[idx]);
			this.matchDays[idx] = matchDay;
			return matchDay;
		} 
		matchDay = new MatchDay(season, zat);
		this.matchDays.push(matchDay);
		return matchDay;
	}

	/**
	 * Returns the data of the team that have to be stored.
	 * 
	 * @returns @type {Team} the team to store
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
