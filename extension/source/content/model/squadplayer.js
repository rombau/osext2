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
	 * @returns {SquadPlayer} the forecast of the player
	 */
	getForecast (lastMatchDay, targetMatchDay) {
		if (lastMatchDay.equals(targetMatchDay)) return this;

		let forecastPlayer = Object.assign(new SquadPlayer(), this);

		forecastPlayer.posLastMatch = undefined;
		forecastPlayer.moral = undefined;
		forecastPlayer.fitness = undefined;
	
		let interval = lastMatchDay.intervalTo(targetMatchDay);

		forecastPlayer.transferLock -= interval;
		if (forecastPlayer.transferLock < 0) forecastPlayer.transferLock = 0;

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


		// TODO: add option for physio
		forecastPlayer.injured -= Math.floor(interval * 2);
		if (forecastPlayer.injured < 0) forecastPlayer.injured = 0;

		let matchday = new MatchDay(lastMatchDay.season, lastMatchDay.zat);
		while (!matchday.add(1).after(targetMatchDay)) {
			if (forecastPlayer.birthday === matchday.zat) forecastPlayer.age++;
		}


		
		// TODO ...

		return forecastPlayer;
	}
}

/**
 * Enum for ban types.
 * @readonly
 */
 const BanType = Object.freeze({
	LEAGUE: { abbr: 'L', description: 'Ligaspiel' },
	CUP: { abbr: 'P', description: 'Pokalspiel' },
	INTERNATIONAL: { abbr: 'I', description: 'internationale Spiel' }
});

/**
 * Ban representation
 */
SquadPlayer.Ban = class {

	/**
	 * @param {String} text the short form (e.g. '2L') from the UI
	 */
	constructor(text) {

		/** @type {BanType} the ban type */
		this.type;

		/** @type {Number} the duration in matchdays of type */
		this.duration;

		if (text) {
			this.type = Object.values(BanType).find((banType) => banType.abbr === text.slice(-1));
			this.duration = +text.slice(0, -1); 
		}
	}

	/**
	 * Returns the text for the ban in short (e.g. '2L') or long (e.g. '2 Ligaspiele') form.
	 * 
	 * @param {Boolean} flag controls the output form; default is the short form
	 * @returns {String} the text form of the ban
	 */
	getText (longForm = false) {
		if (this.type && this.duration) {
			return this.duration.toString() + (longForm ? (' ' + this.type.description + (this.duration > 1 ? 'e' : '')) : this.type.abbr);
		}
		return '';
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

	/**
	 * Returns the text for the loan in short (e.g. 'L12') or long (e.g. 'Leihgabe von [from] an [to] für [duration] ZATs') form.
	 * 
	 * @param {Boolean} flag controls the output form; default is the short form
	 * @returns {String} the text form of the loan
	 */
	getText (longForm = false) {
		if (this.duration && !longForm) {
			return 'L' + this.duration.toString();
		}
		if (this.duration && this.from && this.to && longForm) {
			return `Leihgabe von ${this.from} an ${this.to} für ${this.duration} ZATs`;
		}
		return '';
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