/**
 * Team representation.
 */
class Team {

	/**
	 * @param {Number} id
	 * @param {String} name
	 */
	constructor (id, name) {

		/** @type {Number} the internal id */
		this.id = id;

		/** @type {String} the name of the team */
		this.name = name;

		/** @type {String} the emblem file name */
		this.emblem;

		/** @type {Team.League} the league this team belong to */
		this._league;

		/** @private @type {[SquadPlayer]} */
		this._squadPlayers;

		/** @type {Boolean} true after adding a new player */
		this.squadPlayerAdded;

		/** @private @type {[YouthPlayer]} */
		this._youthPlayers;

		/** @private @type {[YouthPlayer]} */
		this._pageYouthPlayers;

		/** @private @type {[MatchDay]} */
		this._matchDays;

		/** @private @type {[Team.Trainer]} */
		this._trainers;

		/** @type {Stadium} the stadium data */
		this.stadium;

		/** @type {Number} the current account balance */
		this.accountBalance;

		/** @private @type {[ObservedPlayer]} */
		this._observedPlayers;
	}

	/**
	 * @type {Team.League} the current team league
	 */
	get league () {
		this._league = this._league || new Team.League();
		return ensurePrototype(this._league, Team.League);
	}

	/**
	 * @type {[SquadPlayer]} the squad players
	 */
	get squadPlayers () {
		this._squadPlayers = this._squadPlayers || [];
		return ensurePrototype(this._squadPlayers, SquadPlayer);
	}

	set squadPlayers (value) {
		this._squadPlayers = value;
	}

	/**
	 * @type {[YouthPlayer]} the youth players
	 */
	get youthPlayers () {
		this._youthPlayers = this._youthPlayers || [];
		return ensurePrototype(this._youthPlayers, YouthPlayer);
	}

	set youthPlayers (value) {
		this._youthPlayers = value;
	}

	/**
	 * @type {[YouthPlayer]} the youth players from the page
	 */
	get pageYouthPlayers () {
		this._pageYouthPlayers = this._pageYouthPlayers || [];
		return ensurePrototype(this._pageYouthPlayers, YouthPlayer);
	}

	set pageYouthPlayers (value) {
		this._pageYouthPlayers = value;
	}

	/**
	 * @type {[MatchDay]} the match days (ZATS) of the current (and following) saison(s)
	 */
	get matchDays () {
		this._matchDays = this._matchDays || [];
		return ensurePrototype(this._matchDays, MatchDay);
	}

	set matchDays (value) {
		this._matchDays = value;
	}

	/**
	 * @type {[Team.Trainer]} the trainers for training the squad player
	 */
	get trainers () {
		this._trainers = this._trainers || [];
		return ensurePrototype(this._trainers, Team.Trainer);
	}

	set trainers (value) {
		this._trainers = value;
	}

	/**
	 * @type {[MatchDay]} the sorted match days (copy with youngest first)
	 */
	get sortedMatchDays () {
		return this.matchDays.slice().sort((day1, day2) => {
			if (day1.before(day2)) return 1;
			if (day1.after(day2)) return -1;
			return 0;
		});
	}

	/**
	 * @type {[ObservedPlayer]} the observed players
	 */
	get observedPlayers () {
		this._observedPlayers = this._observedPlayers || [];
		return ensurePrototype(this._observedPlayers, ObservedPlayer);
	}

	set observedPlayers (value) {
		this._observedPlayers = value;
	}

	/**
	 * Returns the squad player with the given id. If the player can't be found, a new one is added to the team and returned.
	 *
	 * @param {Number} id the id of the player to find (or add)
	 * @param {Boolean} considerSquadPlayerAdded true if an added squad player should be considered for reload fo data
	 * @returns {SquadPlayer} the player
	 */
	getSquadPlayer (id, considerSquadPlayerAdded = true) {
		if (!id) return null;

		let player = this.squadPlayers.find(player => player.id === id);
		if (!player) {
			player = new SquadPlayer();
			player.id = id;
			this.squadPlayers.push(player);
			this.squadPlayerAdded = considerSquadPlayerAdded;
		}
		return ensurePrototype(player, SquadPlayer);
	}

	/**
	 * Returns the observed player with the given id. If the player can't be found, a new one is added to the team and returned.
	 *
	 * @param {Number} id the id of the player to find (or add)
	 * @returns {ObservedPlayer} the observed player
	 */
	getObservedPlayer (id) {
		if (!id) return null;

		let player = this.observedPlayers.find(player => player.id === id);
		if (!player) {
			player = new ObservedPlayer();
			player.id = id;
			this.observedPlayers.push(player);
		}
		return ensurePrototype(player, ObservedPlayer);
	}

	/**
	 * Synchronizes the youth players in the model with the fully initialized page youth players, 
	 * based on the fingerprints.
	 * 
	 * If the player is not found, it is inserted (new or scouted).
	 * If the player is found on a greater index, all players between are deleted (pull or removed with scouting).
	 * 
	 */
	syncYouthPlayers () {
		this.pageYouthPlayers.forEach((player, index) => {
			let foundIndex = this.youthPlayers.findIndex(p => p.getFingerPrint() == player.getFingerPrint());
			if (foundIndex < 0) {
				this._youthPlayers.splice(index, 0, player); // insert
			} else {
				if (foundIndex > index) {
					this._youthPlayers.splice(index, foundIndex - index); // delete
				}
				Object.entries(player).forEach(([key, value]) => {
					if (value) {
						this._youthPlayers[index][key] = value;
					}
				});
			}
			this._youthPlayers[index].pos = player.pos || player.getBestPosition();
			// take over empty value too ...
			this._youthPlayers[index].increase = player.increase;
			this._youthPlayers[index].pullId = player.pullId;
		});
	}

	/**
	 * Returns the match day with the season and zat. If the match day can't be found, a new one is added to the team and returned.
	 *
	 * @param {Number} season the season of the match day to find (or add)
	 * @param {Number} zat the zat of the match day to find (or add)
	 * @returns {MatchDay} the match day
	 */
	getMatchDay (season, zat) {
		if (!season || !zat) return null;

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
		if (!nr) return null;

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

		this.observedPlayers.forEach(player => {
			if (player.type !== ObservationType.NOTE && player.matchDay) {
				let squadPlayer = forecastTeam.squadPlayers.find(squadPlayer => squadPlayer.id === player.id);
				if (squadPlayer && !ensurePrototype(player.matchDay, MatchDay).after(targetMatchDay)) {
					squadPlayer.active = false;
				}
			}
		});

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
	 * @param {MatchDay} lastMatchDay the last match day
	 * @param {*} viewSettings the view settings
	 * @param {[MatchDay]} calculatedMatchDays the list of match days previously calculated
	 * @returns {[MatchDay]} the list of match days
	 */
	getMatchDaysWithBalance (selectedSeason, lastMatchDay, viewSettings, calculatedMatchDays) {

		let balancedMatchDays = calculatedMatchDays || [];
		let accountBalance = this.accountBalance;
		let stadium = this.stadium;
		let winBonusPerLeagueMatchDay = this.calculateWinBonusPerLeagueMatchDay(viewSettings.leagueRanking, this.league.size);
		for (let season = selectedSeason; season < (selectedSeason + Options.forecastSeasons); season++) {
			for (let zat = 1; zat <= SEASON_MATCH_DAYS; zat++) {
				let balancedMatchDay = balancedMatchDays.find(matchDay => matchDay.season === season && matchDay.zat === zat);
				if (!balancedMatchDay) {
					balancedMatchDay = this.copyScheduledMatchDay(season, zat);
					balancedMatchDays.push(balancedMatchDay);
				}
				if (balancedMatchDay.after(lastMatchDay)) {
					balancedMatchDay.accountBalancePromise = getQueuedPromise((resolve, reject) => {
						setTimeout(() => {
							try {
								balancedMatchDay.accountBalanceBefore = balancedMatchDay.accountBalanceBefore || accountBalance;
								stadium = balancedMatchDay.stadium || stadium;
								accountBalance += balancedMatchDay.calculateMatchDayIncome(stadium, viewSettings);
								accountBalance += balancedMatchDay.calculatePremium(this.league, viewSettings);
								let forecastedTeam = !calculatedMatchDays ? this.getForecast(lastMatchDay, balancedMatchDay) : new Team();
								accountBalance += (-balancedMatchDay.youthSupport) || this.calculateYouthSupport(balancedMatchDay, forecastedTeam.youthPlayers, viewSettings);
								if (balancedMatchDay.zat % MONTH_MATCH_DAYS === 0) {
									accountBalance += (-balancedMatchDay.squadSalary) || this.calculateSquadSalary(balancedMatchDay, forecastedTeam.squadPlayers, forecastedTeam.youthPlayers);
									accountBalance += (balancedMatchDay.loanIncome - balancedMatchDay.loanCosts) || this.calculateLoan(balancedMatchDay, forecastedTeam.squadPlayers);
									accountBalance += (-balancedMatchDay.trainerSalary) || this.calculateTrainerSalary(balancedMatchDay, forecastedTeam.trainers);
								}
								accountBalance += (balancedMatchDay.fastTransferIncome) || this.calculateFastTransferIncome(balancedMatchDay, forecastedTeam.squadPlayers);
								accountBalance += (-balancedMatchDay.physio) || this.calculatePhysioCosts(balancedMatchDay, forecastedTeam.squadPlayers);
								if (viewSettings.winBonus && balancedMatchDay.competition === Competition.LEAGUE && balancedMatchDay.zat < 70) {
									balancedMatchDay.winBonus = winBonusPerLeagueMatchDay;
									accountBalance += winBonusPerLeagueMatchDay;
								} else {
									balancedMatchDay.winBonus = undefined;
								}
								balancedMatchDay.accountBalance = accountBalance;
								resolve(balancedMatchDay);
							} catch (e) {
								reject(e);
							}
						}, 1); // to ensure UI refresh
					});
				} else {
					balancedMatchDay.accountBalancePromise = Promise.resolve(balancedMatchDay);
				}
			}
		}
		return balancedMatchDays;
	}

	/**
	 * Returns the youth support costs for a match day.
	 *
	 * @param {MatchDay} matchDay the match day
	 * @param {[YouthPlayer]} players the list of youth players
	 * @param {*} viewSettings the settings the season
	 * @returns {Number} the costs
	 */
	calculateYouthSupport (matchDay, players, viewSettings) {
		let activePlayers = players.filter(player => player.active && player.ageExact > YOUTH_AGE_MIN && (!player.pullMatchDay
			|| (ensurePrototype(player.pullMatchDay, MatchDay) && !player.pullMatchDay.before(matchDay))));
		let minimumPlayers = viewSettings.youthSupportBarrierType ? activePlayers.filter(player => {
			if (viewSettings.youthSupportBarrierType === YouthSupportBarrierType.AND_OLDER) {
				return player.season <= viewSettings.youthSupportBarrierSeason;
			} else if (viewSettings.youthSupportBarrierType === YouthSupportBarrierType.AND_YOUNGER) {
				return player.season >= viewSettings.youthSupportBarrierSeason;
			} else {
				return true;
			}
		}) : [];
		matchDay.youthSupport = minimumPlayers.length * YOUTH_SUPPORT_MIN + (activePlayers.length - minimumPlayers.length) * viewSettings.youthSupportPerDay;
		return -matchDay.youthSupport;
	}

	/**
	 * Returns the squad salary.
	 *
	 * @param {MatchDay} matchDay
	 * @param {[SquadPlayer]} squadPlayers
	 * @param {[YouthPlayer]} youthPlayers
	 * @returns {Number} the costs
	 */
	calculateSquadSalary (matchDay, squadPlayers, youthPlayers) {
		let squad = squadPlayers.filter(player => (player.loan && player.loan.duration >= 0 && player.loan.fee < 0) || (player.active && !player.loan))
			.reduce((sum, player) => sum + player.salary, 0);
		let youth = youthPlayers.filter(player => player.pullMatchDay && ensurePrototype(player.pullMatchDay, MatchDay).before(matchDay))
			.reduce((sum, player) => sum + (player.salary || 0), 0);
		matchDay.squadSalary = squad + youth;
		return -matchDay.squadSalary;
	}

	/**
	 * Returns the loan income minus costs.
	 *
	 * @param {MatchDay} matchDay
	 * @param {[SquadPlayer]} players
	 * @returns {Number} the income/costs
	 */
	calculateLoan (matchDay, players) {
		matchDay.loanIncome = players.filter(player => (player.loan && player.loan.duration >= 0 && player.loan.fee > 0))
			.reduce((sum, player) => sum + Math.min(player.loan.fee, MAX_LOAN), 0);
		matchDay.loanCosts = players.filter(player => (player.loan && player.loan.duration >= 0 && player.loan.fee < 0))
			.reduce((sum, player) => sum - Math.max(player.loan.fee, -MAX_LOAN), 0);
		return matchDay.loanIncome - matchDay.loanCosts;
	}

	/**
	 * Returns the trainer salary.
	 *
	 * @param {MatchDay} matchDay
	 * @param {[Trainer]} trainers
	 * @returns {Number} the costs
	 */
	calculateTrainerSalary (matchDay, trainers) {
		matchDay.trainerSalary = trainers.reduce((sum, trainer) => sum + trainer.salary, 0);
		return -matchDay.trainerSalary;
	}

	/**
	 * Returns the fast transfer income.
	 *
	 * @param {MatchDay} matchDay
	 * @param {[SquadPlayer]} players
	 * @returns {Number} the income
	 */
	calculateFastTransferIncome (matchDay, players) {
		matchDay.fastTransferIncome = players.filter(player => {
			let observedPlayer = this.observedPlayers.find(observedPlayer => observedPlayer.id === player.id);
			if (observedPlayer && observedPlayer.type !== ObservationType.NOTE && observedPlayer.matchDay && !ensurePrototype(observedPlayer.matchDay, MatchDay).after(matchDay)) {
				return false;
			}
			return player.fastTransferMatchDay && matchDay.equals(player.fastTransferMatchDay);
		}).reduce((sum, player) => sum + player.getFastTransferValue(), 0);
		return matchDay.fastTransferIncome;
	}

	/**
	 * Returns the physio costs.
	 *
	 * @param {MatchDay} matchDay
	 * @param {[SquadPlayer]} players
	 * @returns {Number} the costs
	 */
	calculatePhysioCosts (matchDay, players) {
		matchDay.physio = players.reduce((sum, player) => sum + (player.physioCosts || 0), 0);
		if (Options.usePhysio) {
			matchDay.physio += players
				.filter(player => player.injuredBefore >= 2 && !player.physioCosts && (!player.loan || player.loan.fee < 0))
				.reduce((sum, player) => sum + PHYSIO_COSTS, 0);
		}
		return -matchDay.physio;
	}

	/**
	 * Returns the win bonus for an leage match day, 
	 * based on the ranking and assumption in WIN_BONUS_BY_RANKING.
	 *
	 * @param {Number} leagueRanking
	 * @param {Number} leagueSize
	 * @returns {Number} the bonus
	 */
	calculateWinBonusPerLeagueMatchDay (leagueRanking, leagueSize) {
		let leagueMatchDays = this.sortedMatchDays.filter(matchDay => matchDay.competition === Competition.LEAGUE);
		if (!leagueMatchDays.length) {
			return 0;
		}
		leagueMatchDays = this.matchDays.filter(matchDay => matchDay.season === leagueMatchDays[0].season && matchDay.competition === Competition.LEAGUE);
		return Math.round((WIN_BONUS_BY_RANKING[leagueSize][leagueRanking - 1] * WIN_BONUS) / leagueMatchDays.length);
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
		let seasonMatchDay = this.matchDays.find(matchDay => matchDay.season === season && matchDay.zat === zat);
		if (seasonMatchDay && seasonMatchDay.result) {
			return ensurePrototype(JSON.parse(JSON.stringify(seasonMatchDay)), MatchDay);
		}
		let copyMatchDay = new MatchDay(season, zat);
		window.sortedMatchDays = window.sortedMatchDays || this.sortedMatchDays.filter(matchDay => matchDay.competition);
		let scheduledMatchDay = window.sortedMatchDays.find(matchDay => matchDay.zat === zat);
		if (scheduledMatchDay) {
			if (scheduledMatchDay.season !== season &&
				(scheduledMatchDay.competition === Competition.OSEQ || scheduledMatchDay.competition === Competition.OSE || scheduledMatchDay.competition === Competition.OSCQ || scheduledMatchDay.competition === Competition.OSC)) {
				copyMatchDay.competition = Competition.FRIENDLY;
			} else {
				copyMatchDay.competition = scheduledMatchDay.competition;
				copyMatchDay.location = scheduledMatchDay.location;
				copyMatchDay.opponent = scheduledMatchDay.opponent;
				if (scheduledMatchDay.season === season) copyMatchDay.friendlyShare = scheduledMatchDay.friendlyShare;
			}
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

	constructor () {

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

	constructor () {

		/** @type {Number} the number of the trainer */
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
		'Trainer 01': {legacySkill: 20, upToSkill: 60},
		'Trainer 02': {legacySkill: 25, upToSkill: 62},
		'Trainer 03': {legacySkill: 30, upToSkill: 65},
		'Trainer 04': {legacySkill: 35, upToSkill: 67},
		'Trainer 05': {legacySkill: 40, upToSkill: 70},
		'Trainer 06': {legacySkill: 45, upToSkill: 72},
		'Trainer 07': {legacySkill: 50, upToSkill: 75},
		'Trainer 08': {legacySkill: 55, upToSkill: 77},
		'Trainer 09': {legacySkill: 60, upToSkill: 80},
		'Trainer 10': {legacySkill: 65, upToSkill: 82},
		'Trainer 11': {legacySkill: 70, upToSkill: 85},
		'Trainer 12': {legacySkill: 75, upToSkill: 87},
		'Trainer 13': {legacySkill: 80, upToSkill: 90},
		'Trainer 14': {legacySkill: 85, upToSkill: 92},
		'Trainer 15': {legacySkill: 90, upToSkill: 95},
		'Trainer 16': {legacySkill: 95, upToSkill: 97},
		'Trainer 17': {legacySkill: 99, upToSkill: 99}
	}
}