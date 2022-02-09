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

		/** @type {Talent} the talent */
		this.talent;

		/** @type {Number} the internal pull id */
		this.pullId;
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
	
		this._forecastAging(forecastPlayer, lastMatchDay, targetMatchDay);
		this._forecastSkills(forecastPlayer, lastMatchDay, targetMatchDay);
		
		return forecastPlayer;
	}

	/**
	 * @param {YouthPlayer} forecastPlayer 
	 * @param {MatchDay} lastMatchDay 
	 * @param {MatchDay} targetMatchDay 
	 */
	_forecastAging (forecastPlayer, lastMatchDay, targetMatchDay) {
		let matchday = new MatchDay(lastMatchDay.season, lastMatchDay.zat);
		while (!matchday.add(1).after(targetMatchDay)) {
			if (forecastPlayer.birthday === matchday.zat) {
				forecastPlayer.age++;
			}
			forecastPlayer.ageExact += (1 / SEASON_MATCH_DAYS);
		}
	}

	/**
	 * @param {YouthPlayer} forecastPlayer 
	 * @param {MatchDay} lastMatchDay 
	 * @param {MatchDay} targetMatchDay 
	 */
	_forecastSkills (forecastPlayer, lastMatchDay, targetMatchDay) {
		let forecastDays = lastMatchDay.intervalTo(targetMatchDay);
		let youthDays = forecastPlayer.age < YOUTH_AGE_MIN ? 0 : (((forecastPlayer.age - YOUTH_AGE_MIN) * SEASON_MATCH_DAYS) + lastMatchDay.zat - this.birthday);
		
		Object.keys(forecastPlayer.skills)
			.filter(key => {
				return !Object.keys(forecastPlayer.getUnchangeableSkills()).includes(key);
			})
			.forEach(key => {
				let change = youthDays ? forecastPlayer.skills[key] * forecastDays / youthDays : 0;
				forecastPlayer.skills[key] += Math.floor(change);
				if (forecastPlayer.skills[key] > SKILL_LIMIT) forecastPlayer.skills[key] = SKILL_LIMIT;
			});
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