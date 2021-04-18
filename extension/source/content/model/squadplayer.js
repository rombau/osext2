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
		
		/** @type {Boolean} flag indicating the palyer is active */
		this.active = true;

		/** @type {String} the name */
		this.name;

		/** @type {Position} the position */
		this.pos;

		/** @type {Position} the position at last match */
		this.posLastMatch;

		/** @type {Number} the moral value */
		this.moral;

		/** @type {Number} the fitness value */
		this.fitness;

		/** @type {[SquadPlayer.Ban]} the bans for upcomming matchdays */
		this.bans = [];

		/** @type {Number} injured for upcomming matchdays */
		this.injured;

		/** @type {TransferState} the transfer state */
		this.transferState;

		/** @type {Number} the games locked for transfer */
		this.transferLock;

		/** @type {SquadPlayer.Loan} the loan information */
		this.loan;

		/** @type {Number} the contract term in month */
		this.contractTerm;

		/** @type {Number} the monthly salary */
		this.salary;

		/** @type {Number} the market value */
		this.marketValue;

		/** @type {MatchDay} the match day (ZAT) the player should be fastly transfered ('Blitz') */ 
		this.fastTransfer;
		
		/** @type {SquadPlayer.Training} the training setup of the last match day */
		this.lastTraining;

		/** @type {SquadPlayer.Training} the training setup of the next match day */
		this.nextTraining;
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

		let forecastPlayer = Object.assign(new SquadPlayer(), this);
		forecastPlayer.bans = [];
		this.bans.forEach(ban => forecastPlayer.bans.push(Object.assign(new SquadPlayer.Ban(), ban)));

		forecastPlayer.posLastMatch = undefined;
		forecastPlayer.moral = undefined;
		forecastPlayer.fitness = undefined;
	
		let interval = lastMatchDay.intervalTo(targetMatchDay);

		this.forecastTransferLock(forecastPlayer, interval);

		this.forecastLoan(forecastPlayer, interval);

		this.forecastBans(forecastPlayer, matchDaysInRange);

		this.forecastInjury(forecastPlayer, interval);

		this.forecastAge(forecastPlayer, lastMatchDay, targetMatchDay);

		
		// TODO ...

		return forecastPlayer;
	}

	forecastAge(forecastPlayer, lastMatchDay, targetMatchDay) {
		let matchday = new MatchDay(lastMatchDay.season, lastMatchDay.zat);
		while (!matchday.add(1).after(targetMatchDay)) {
			if (forecastPlayer.birthday === matchday.zat)
				forecastPlayer.age++;
		}
	}

	forecastInjury(forecastPlayer, interval) {
		// TODO: add option for physio
		forecastPlayer.injured -= Math.floor(interval * 2);
		if (forecastPlayer.injured < 0)
			forecastPlayer.injured = 0;
	}

	forecastBans(forecastPlayer, matchDaysInRange) {
		if (forecastPlayer.bans.length > 0 && matchDaysInRange) {
			matchDaysInRange.forEach(matchday => {
				forecastPlayer.bans.forEach((ban, i, object) => {
					if (ban.type === BanType.LEAGUE && matchday.competition === Competition.LEAGUE) {
						ban.duration--;
					} else if (ban.type === BanType.CUP && matchday.competition === Competition.CUP) {
						ban.duration--;
					} else if (ban.type === BanType.INTERNATIONAL &&
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

	forecastLoan(forecastPlayer, interval) {
		if (forecastPlayer.loan) {
			forecastPlayer.loan = Object.assign(new SquadPlayer.Loan(), forecastPlayer.loan);
			forecastPlayer.loan.duration -= interval;
			if (forecastPlayer.loan.duration <= 0) {
				if (forecastPlayer.loan.fee < 0) {
					forecastPlayer.active = false;
				}
				forecastPlayer.loan = undefined;
			}
		}
	}

	forecastTransferLock(forecastPlayer, interval) {
		forecastPlayer.transferLock -= interval;
		if (forecastPlayer.transferLock < 0)
			forecastPlayer.transferLock = 0;
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

		/** @type {Team.Trainer} the team trainer */ 
		this.trainer;
		
		/** @type {Skill} the trainings skill */
		this.skill;

		/** @type {Number} the chance for increasing the skill value */
		this.chance;
		
		/** @type {Number} the match bonus multiplying the chance */
		this.matchBonus = 1;
	}
};