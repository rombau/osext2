/**
 * Enum for transfer states.
 * @readonly
 */
const Talent = Object.freeze({
	HIGH: 'hoch',
	NORMAL: 'normal',
	LOW: 'wenig'
});

/**
 * Youth player representation.
 */
class YouthPlayer extends Player {

	constructor() {

		super();

		/** @type {Number} the season of birth */
		this.season;

		/** @type {Talent} the talent */
		this.talent;

		/** @type {Number} the internal pull id */
		this.pullId;

		/** @type {String} the last increased skill(s) */
		this.increase;

		/** @type {MatchDay} the match day (ZAT) the player should be pulled ('Ziehtermin') */ 
		this.pullMatchDay;

		/** @type {Position} the position of the pulled player ('Ziehposition') */ 
		this.pullPosition;

		/** @type {Number} the initial contract length of the pulled player */
		this.pullContractTerm;
	}

	/**
	 * Returns a forecast of the player for the given target match day.
	 * If target match day is ommited, the maximum age is calculated.
	 * 
	 * @param {MatchDay} lastMatchDay the last match day
	 * @param {MatchDay} targetMatchDay the target match day
	 * @returns {YouthPlayer} the forecast of the player
	 */
	getForecast (lastMatchDay, targetMatchDay) {

		if (targetMatchDay && lastMatchDay.equals(targetMatchDay)) return this;

		/** @type {YouthPlayer} */
		let forecastPlayer = Object.assign(new YouthPlayer(), JSON.parse(JSON.stringify(this)));
		forecastPlayer.origin = this;
	
		if (forecastPlayer.age >= YOUTH_AGE_MIN) {
			this._forecastAging(forecastPlayer, lastMatchDay, targetMatchDay);

			let days = this._forecastSkills(forecastPlayer, lastMatchDay, targetMatchDay);
			forecastPlayer.averageIncreasePerDay = forecastPlayer.getAverageIncreasePerDay(days);
		} else {
			forecastPlayer.active = false;
		}

		return forecastPlayer;
	}

	/**
	 * @param {YouthPlayer} forecastPlayer 
	 * @param {MatchDay} lastMatchDay 
	 * @param {MatchDay} targetMatchDay 
	 */
	_forecastAging (forecastPlayer, lastMatchDay, targetMatchDay) {
		let matchday = new MatchDay(lastMatchDay.season, lastMatchDay.zat);
		let forecastDays = forecastPlayer.getForecastDays(lastMatchDay, targetMatchDay);
		while (matchday.add(1) && --forecastDays >= 0) {
			if (targetMatchDay && matchday.after(targetMatchDay)) break;
			if (forecastPlayer.birthday === matchday.zat) {
				forecastPlayer.age++;
			}
			forecastPlayer.ageExact += (1 / SEASON_MATCH_DAYS);
			if (forecastPlayer.age > YOUTH_AGE_MAX || (targetMatchDay && this.pullMatchDay && matchday.after(this.pullMatchDay))) {
				forecastPlayer.active = false;
			}
		}
	}

	/**
	 * @param {YouthPlayer} forecastPlayer 
	 * @param {MatchDay} lastMatchDay 
	 * @param {MatchDay} targetMatchDay 
	 * @returns {Number} sum of days
	 */
	_forecastSkills (forecastPlayer, lastMatchDay, targetMatchDay) {
		let forecastDays = forecastPlayer.getForecastDays(lastMatchDay, targetMatchDay);
		let youthDays = forecastPlayer.getYouthDays(lastMatchDay);
	
		Object.keys(forecastPlayer.getTrainableSkills()).forEach(key => {
			let change = youthDays ? forecastPlayer.skills[key] * forecastDays / youthDays : 0;
			forecastPlayer.skills[key] += Math.round(change);
			if (forecastPlayer.skills[key] > SKILL_LIMIT) forecastPlayer.skills[key] = SKILL_LIMIT;
		});
		return youthDays + forecastDays;
	}

	/**
	 * Returns the trainable (primary and secondary) skills.
	 * 
	 * @returns {Skillset} an object with the trainable skills only
	 */
	getTrainableSkills () {
		return Object.keys(this.skills)
			.filter(key => {
				return !Object.keys(this.getUnchangeableSkills()).includes(key);
			})
			.reduce((obj, key) => {
				obj[key] = this.skills[key];
				return obj;
			}, {});
	}

	/**
	 * Returns the days the player will be trained until given match day.
	 * If match day is omitted, the days until max age are returned.
	 * 
	 * @param {MatchDay} lastMatchDay 
	 * @param {MatchDay} targetMatchDay 
	 * @returns {Number} forecast days
	 */
	getForecastDays (lastMatchDay, targetMatchDay) {
		if (targetMatchDay) {
			return lastMatchDay.intervalTo(targetMatchDay);
		}
		let age = (this.origin && this.origin.age) ? this.origin.age : this.age;
		let seasons = (YOUTH_AGE_MAX + 1) - (age + (this.birthday > lastMatchDay.zat ? 1 : 0));
		return age < YOUTH_AGE_MIN ? 0 : (seasons * SEASON_MATCH_DAYS - lastMatchDay.zat + this.birthday - 1);
	}

	/**
	 * Returns the days the player was trained until given match day.
	 * 
	 * @param {MatchDay} matchday
	 * @returns {Number} days trained
	 */
	getYouthDays (matchday) {
		let age = (this.origin && this.origin.age) ? this.origin.age : this.age;
		let seasons = age - YOUTH_AGE_MIN + (this.birthday > matchday.zat ? 1 : 0);
		return age < YOUTH_AGE_MIN ? 0 : (seasons * SEASON_MATCH_DAYS + matchday.zat - this.birthday);
	}

	/**
	 * Returns the average increase per day.
	 * 
	 * @param {Number} days
	 * @returns {Number} average increase
	 */
	getAverageIncreasePerDay (days) {
		return Object.values(this.getTrainableSkills()).reduce((sum, value) => sum + value, 0) / days;
	}

	/**
	 * Returns the salary for the youth player.
	 * The formula was provided by Michael Bertram.
	 * 
	 * @param {Number} term the contract length
	 * @returns the salary
	 */
	getSalary (term = 24) {
		let skill = this.getSkillAverage();
		let age = this.age;
		let salary = Math.exp(8.6352890923681 + term * 0.0705668514584682 + skill * 0.028080430507765 
			+ Math.pow(term, 2) * -0.00174150326033113 + Math.pow(skill, 2) * 0.00498240336698239 
			+ Math.pow(term, 3) * 0.000023430692218106 + Math.pow(skill, 3) * -0.000101781463829049 + Math.pow(age, 3) * -0.00148099883935323 
			+ Math.pow(term, 4) * -1.18310348021728 * Math.pow(10, -7) + Math.pow(skill, 4) * 7.18208724536507 * Math.pow(10, -7) + Math.pow(age, 4) * 0.000044797822229757);

		return Math.round(salary);
	}

	/**
	 * Completes the initialization of the player data.
	 * 
	 * @param {MatchDay} lastMatchDay the last match day
	 */
	complete (lastMatchDay) {

		// initialize exact age
		this.initializeExactAge(lastMatchDay);

		// initialize the best fitting position
		this.initializeBestPosition();

		// initialize training factor
		this.trainingFactor = 1;

		// remove past pull settings
		if (this.pullMatchDay && lastMatchDay.after(this.pullMatchDay)) {
			this.pullMatchDay = null;
			this.pullPosition = null;
			this.pullContractTerm = null;
		}
		
	}

	/**
	 * Finds the best position of field players based on the opti.
	 * 
	 * @returns {Position} the position
	 */
	initializeBestPosition () {
		let pos, opti, optiTop = 0;
		if (this.pos != Position.TOR) {
			for (pos in Position) {
				if (Position[pos] != Position.TOR) {
					opti = this.getOpti(Position[pos]);
					if (opti > optiTop) {
						optiTop = opti;
						this.pos = Position[pos];
					}
				}
			}
		}
	}

}