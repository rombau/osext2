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

		let forecastPlayer = Object.assign(new YouthPlayer(), JSON.parse(JSON.stringify(this)));
		forecastPlayer.origin = this;
	
		let forecastDays = lastMatchDay.intervalTo(targetMatchDay);

		this._forecastSkills(forecastPlayer, forecastDays);
		this._forecastAging(forecastPlayer, matchday);
		
		return forecastPlayer;
	}

	/**
	 * Completes the initialization of the player data.
	 * 
	 * @param {MatchDay} lastMatchDay the last match day
	 */
	complete (lastMatchDay) {

		// initialize exact age
		if (lastMatchDay.zat >= this.birthday) {
			this.ageExact = this.age + ((lastMatchDay.zat - this.birthday) / SEASON_MATCH_DAYS);
		} else {
			this.ageExact = this.age + ((SEASON_MATCH_DAYS - (this.birthday - lastMatchDay.zat)) / SEASON_MATCH_DAYS);
		}

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

		if (!this.pos) {
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