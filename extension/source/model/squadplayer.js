/**
 * Enum for transfer states.
 * @readonly
 */
const TransferState = Object.freeze({
	UNSELLABLE: 'U',
	NORMAL: 'N',
	OFFER: 'A',
	TRANSFER: 'T'
});

/**
 * Squad player representation.
 */
class SquadPlayer extends Player {

	constructor() {

		super();
		
		/** @type {Number} the internal id */ 
		this.id;

		/** @type {String} the name */
		this.name;

		/** @type {Position} the position at last match */
		this.posLastMatch;

		/** @type {Number} the moral value */
		this.moral;

		/** @type {Number} the fitness value */
		this.fitness;

		/** @private @type {[SquadPlayer.Ban]} */
		this._bans = [];

		/** @type {Number} injured for upcomming matchdays */
		this.injured;

		/** @type {TransferState} the transfer state */
		this.transferState;

		/** @type {Number} the games locked for transfer */
		this.transferLock;

		/** @private @type {SquadPlayer.Loan} */
		this._loan;

		/** @type {Number} the contract term in month */
		this.contractTerm;

		/** @type {Number} the monthly salary */
		this.salary;

		/** @type {Number} the follow up salaries */
		this.followUpSalary = {};

		/** @type {Number} the market value */
		this.marketValue;

		/** @type {Number} the training factor considered in the market value */
		this.trainingFactor;

		/** @type {MatchDay} the match day (ZAT) the player should be fast transfered ('Blitz') */ 
		this.fastTransfer;
		
		/** @private @type {SquadPlayer.Training} */
		this._lastTraining;

		/** @private @type {SquadPlayer.Training} */
		this._nextTraining;
	}

	/**
	 * @type {[SquadPlayer.Ban]} the bans for upcomming matchdays
	 */
	get bans () {
		return ensurePrototype(this._bans, SquadPlayer.Ban);
	}

	set bans (value) {
		this._bans = value;
	}

	/**
	 * @type {SquadPlayer.Loan} the loan information
	 */
	get loan () {
		return ensurePrototype(this._loan, SquadPlayer.Loan);
	}

	set loan (value) {
		this._loan = value;
	}

	/**
	 * @type {SquadPlayer.Training} the training setup of the last match day
	 */
	get lastTraining () {
		return ensurePrototype(this._lastTraining, SquadPlayer.Training);
	}

	set lastTraining (value) {
		this._lastTraining = value;
	}

	/**
	 * @type {SquadPlayer.Training} the training setup of the next match day
	 */
	get nextTraining () {
		return ensurePrototype(this._nextTraining, SquadPlayer.Training);
	}

	set nextTraining (value) {
		this._nextTraining = value;
	}
	
	/**
	 * Returns the calculated market value, considering the training factor for the current position.
	 * 
	 * @param {Position} pos the position to get the market value for; if omitted the current position is used
	 * @param {Number} factor the training factor; if omitted the current training factor is used
	 * @returns 
	 */
	getMarketValue (pos = this.pos, factor = this.trainingFactor) {
		return super.getMarketValue(pos, factor);
	}

	/**
	 * Returns the calculated fast transfer value ('Blitzerlös').
	 * 
	 * @param {Position} pos the position to get the market value for; if omitted the current position is used
	 * @param {Number} factor the training factor; if omitted the current training factor is used
	 * @returns 
	 */
	getFastTransferValue () {
		if (this.age >= (this.pos == Position.TOR ? SKILL_DEDUCTION_TOR : SKILL_DEDUCTION_FIELD)) {
			return Math.max(Math.round(this.getMarketValue() * 0.9) - (this.contractTerm * this.salary), 0);
		}
		let normal = Math.round(this.getMarketValue() * 0.75) - (this.contractTerm * this.salary);
		let max = 3000000 + 900000 * (this.age - 18);
		return Math.max(normal > max ? max : normal, 0);
	}

	/**
	 * Returns a forecast of the player for the given target match day.
	 * 
	 * @param {MatchDay} lastMatchDay the last match day
	 * @param {MatchDay} targetMatchDay the target match day
	 * @param {[MatchDay]} matchDaysInRange the match days in the range from lastMatchDay and targetMatchDay
	 * @returns {SquadPlayer} the forecast of the player
	 */
	getForecast (lastMatchDay, targetMatchDay, matchDaysInRange) {
		if (lastMatchDay.equals(targetMatchDay)) return this;

		let forecastPlayer = Object.assign(new SquadPlayer(), JSON.parse(JSON.stringify(this)));
		forecastPlayer.origin = this;

		forecastPlayer.posLastMatch = undefined;
		forecastPlayer.moral = undefined;
		forecastPlayer.fitness = undefined;
	
		this._forecastBans(forecastPlayer, matchDaysInRange);
		
		let days = 1;
		let matchday = new MatchDay(lastMatchDay.season, lastMatchDay.zat);
		while (!matchday.add(1).after(targetMatchDay)) {
			this._forecastTransferLock(forecastPlayer);
			this._forecastLoan(forecastPlayer);
			this._forecastInjury(forecastPlayer);
			this._forecastTraining(forecastPlayer, days % 2 === 0 ? forecastPlayer.lastTraining : forecastPlayer.nextTraining);
			this._forecastAging(forecastPlayer, matchday);
			this._forecastContractAndSalary(forecastPlayer, matchday);
			this._forecastFastTransfer(forecastPlayer, matchday);

			days++;
		}
		
		return forecastPlayer;
	}

	/**
	 * Calculates the chance for successful training.
	 * 
	 * @param {Skill} skill 
	 * @param {Team.Trainer} trainer 
	 * @returns {Number}
	 */
	getTrainingChance (skill, trainer) {
		if (skill >= trainer.upToSkill) return 0;
		let chance = Math.pow((100 - this.age) / 37, 7) * (100 - (this.skills[skill] + (99 - trainer.legacySkill) / 2)) / (100 - (99 - (this.skills[skill] + (99 - trainer.legacySkill)/ 2 ))) * Math.pow(0.99, 99);
		return chance > CHANCE_LIMIT ? CHANCE_LIMIT : chance;
	}

	_forecastTraining (forecastPlayer, training) {
		if (forecastPlayer.injured > 0 || !training || forecastPlayer.skills[training.skill] === SKILL_LIMIT) return;

		let chance = forecastPlayer.getTrainingChance(training.skill, training.trainer);
		if (chance > 0) {
			let daysUntilIncrease = 100 / chance;
			let onlyOneTraining = forecastPlayer.lastTraining && forecastPlayer.nextTraining && (forecastPlayer.lastTraining.skill === forecastPlayer.nextTraining.skill);
			let refObject = (onlyOneTraining ? forecastPlayer : training);
			refObject.daysUntilIncrease = (refObject.daysUntilIncrease || 0) - 1 
				+ daysUntilIncrease - (refObject.daysUntilIncrease > 0 ? (refObject.lastDaysUntilIncrease || 0): 0);
			if (refObject.daysUntilIncrease <= 0) {
				forecastPlayer.skills[training.skill]++;
				this._handleTrainingLimit(forecastPlayer, training, onlyOneTraining);				
			}
			refObject.lastDaysUntilIncrease = daysUntilIncrease;
		}
	}

	_handleTrainingLimit(forecastPlayer, training, onlyOneTraining) {
		let primary = Object.keys(forecastPlayer.getPrimarySkills()).includes(training.skill);
		let limit = (primary ? Options.primarySkillTrainingLimit : Options.secondarySkillTrainingLimit) + Options.ageTrainingLimit - forecastPlayer.age;
		let skills = (primary ? forecastPlayer.getPrimarySkills() : forecastPlayer.getSecondarySkills());

		if (forecastPlayer.skills[training.skill] === limit) {
			skills = Object.entries(skills).filter(skill => skill[1] < limit).sort((ps1, ps2) => ps2[1] - ps1[1]);
			if (skills.length === 0 && primary) {
				skills = Object.entries(forecastPlayer.getSecondarySkills())
					.filter(skill => skill[1] < (Options.secondarySkillTrainingLimit + Options.ageTrainingLimit - forecastPlayer.age))
					.sort((ps1, ps2) => ps2[1] - ps1[1]);
			}
			if (skills.length === 0) return;
			training.skill = skills[0][0];
		}
		if (onlyOneTraining) {
			forecastPlayer.lastTraining.skill = training.skill;
			forecastPlayer.nextTraining.skill = training.skill;
		}
	}

	_forecastAging (forecastPlayer, matchday) {
		forecastPlayer.ageExact += (1 / SEASON_MATCH_DAYS);
		if (forecastPlayer.birthday === matchday.zat) {
			forecastPlayer.age++;
			let deductionYears = forecastPlayer.age - (forecastPlayer.pos == Position.TOR ? SKILL_DEDUCTION_TOR : SKILL_DEDUCTION_FIELD);
			if (deductionYears >= 0) {
				let deduction = (deductionYears <= SKILL_DEDUCTION.length - 1 ? SKILL_DEDUCTION[deductionYears] : SKILL_DEDUCTION[SKILL_DEDUCTION.length - 1]);
				let skills = Object.entries(forecastPlayer.skills).filter(skill => skill[1] > 0).map(skill => {
					return [skill[0], skill[1] * SKILL_DEDUCTION_WEIGHTING[skill[0].toUpperCase()]];
				}).sort((s1, s2) => s2[1] - s1[1]);
				let sum = Object.values(skills).reduce((accu, curr) => accu + curr[1], 0);
				let remainder = deduction;
				skills.forEach(skill => {
					forecastPlayer.skills[skill[0]] -= Math.round(skill[1] / sum * deduction);
					remainder -= Math.round(skill[1] / sum * deduction);
				});
				forecastPlayer.skills[skills[remainder > 0 ? 0 : 4][0]] -= remainder;
			}
		}
	}

	_forecastContractAndSalary (forecastPlayer, matchday) {
		if (matchday.zat % MONTH_MATCH_DAYS === 0) {
			forecastPlayer.contractTerm--;
			if (forecastPlayer.contractTerm === 0) {
				forecastPlayer.contractTerm = Options.followUpContractTerm;
				if (forecastPlayer.followUpSalary[forecastPlayer.contractTerm]) {
					forecastPlayer.salary = forecastPlayer.followUpSalary[forecastPlayer.contractTerm];
				}
			}
		}
	}

	_forecastInjury (forecastPlayer) {
		forecastPlayer.injured -= Options.usePhysio ? 2 : 1;
		if (forecastPlayer.injured < 0)
			forecastPlayer.injured = 0;
	}

	_forecastBans (forecastPlayer, matchDaysInRange) {
		if (forecastPlayer.bans.length > 0) {
			matchDaysInRange.forEach(matchday => {
				forecastPlayer.bans.forEach((ban, i, object) => {
					if (ban.type.abbr === BanType.LEAGUE.abbr && matchday.competition === Competition.LEAGUE) {
						ban.duration--;
					} else if (ban.type.abbr === BanType.CUP.abbr && matchday.competition === Competition.CUP) {
						ban.duration--;
					} else if (ban.type.abbr === BanType.INTERNATIONAL.abbr &&
						(matchday.competition === Competition.OSC || matchday.competition === Competition.OSCQ ||
							matchday.competition === Competition.OSE || matchday.competition === Competition.OSEQ)) {
						ban.duration--;
					}
					if (ban.duration <= 0) {
						object.splice(i, 1);
					}
				});
			});
		}
	}

	_forecastLoan (forecastPlayer) {
		if (forecastPlayer.loan) {
			forecastPlayer.loan.duration--;
			if (forecastPlayer.loan.duration <= 0) {
				if (forecastPlayer.loan.fee < 0) {
					forecastPlayer.active = false;
				}
				forecastPlayer.loan = undefined;
			}
		}
	}

	_forecastTransferLock(forecastPlayer) {
		if (forecastPlayer.transferLock > 0) forecastPlayer.transferLock--;
	}

	_forecastFastTransfer(forecastPlayer, matchday) {
		if (this.fastTransfer && matchday.after(this.fastTransfer)) {
			forecastPlayer.active = false;
		}
	}
		
	/**
	 * Completes the initialization of the player data.
	 * 
	 * @param {MatchDay} lastMatchDay the last match day
	 */
	complete (lastMatchDay) {

		// initialize exact age
		this.initializeExactAge(lastMatchDay);

		// initialize training factor
		this.trainingFactor = this.marketValue / this.getMarketValue(this.pos, 1);
	}

}

/**
 * Enum for ban types.
 * @readonly
 */
 const BanType = Object.freeze({
	LEAGUE: { abbr: 'L', description: 'Ligaspiel', descriptionPlural: 'Ligaspiele' },
	CUP: { abbr: 'P', description: 'Pokalspiel', descriptionPlural: 'Pokalspiele' },
	INTERNATIONAL: { abbr: 'I', description: 'internationales Spiel', descriptionPlural: 'internationale Spiele' }
});

/**
 * Ban representation
 */
SquadPlayer.Ban = class {

	/**
	 * @param {BanType} type the ban type
	 * @param {Number} duration the duration in matchdays of type
	 */
	constructor(type, duration) {

		/** @type {BanType} the ban type */
		this.type = type;

		/** @type {Number} the duration in matchdays of type */
		this.duration = duration;
	}
};

/**
 * Loan representation
 */
SquadPlayer.Loan = class {

	/**
	 * @param {String} from the team (name) from which the player is loaned
	 * @param {String} to the team (name) to which the player is loaned
	 * @param {Number} duration the duration of the loan in matchdays
	 */
	constructor(from, to, duration) {

		/** @type {String} from team name */
		this.from = from;

		/** @type {String} to team name */
		this.to = to;

		/** @type {Number} the duration in matchdays */
		this.duration = duration;

		/** @type {Number} the monthly fee */
		this.fee;
	}
};

/**
 * Training representation.
 */
SquadPlayer.Training = class {
	
	constructor() {

		/** @private @type {Team.Trainer} */ 
		this._trainer;
		
		/** @type {Skill} the trainings skill */
		this.skill;
		
		/** @type {Number} the chance to increase the skill */
		this.chance;

		/** @type {Number} the match bonus multiplying the chance */
		this.matchBonus = 1;

	}

	/** @type {Team.Trainer} the trainer delegated for this training */
	get trainer () {
		return ensurePrototype(this._trainer, Team.Trainer);
	}

	set trainer(value) {
		this._trainer = value;
	}
};