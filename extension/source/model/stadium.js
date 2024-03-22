
/**
 * Stadium representation.
 */
class Stadium {

	constructor () {

		/** @type {Number} the number of standing places */
		this.places;

		/** @type {Number} the number of seats */
		this.seats;

		/** @type {Number} the number of covered standing places */
		this.coveredPlaces;

		/** @type {Number} the number of covered seats */
		this.coveredSeats;

		/** @type {Boolean} pitch heating installed */
		this.pitchHeating;
	}

	/**
	 * Returns the number of all places in the stadium.
	 *
	 * @return {Number} number of all places
	 */
	getPlaces () {
		return (this.places || 0) + (this.seats || 0) + (this.coveredPlaces || 0) + (this.coveredSeats || 0);
	}

	/**
	 * Returns the stadium income with the given ticket price and load factor.
	 *
	 * @param {Number} ticketPrice the ticket price
	 * @param {Number} load the stadium load percentage
	 * @return {Number} the income
	 */
	calculateIncome (ticketPrice, load) {
		return Math.round(this.getPlaces() * load / 100 * ticketPrice +
			(this.coveredPlaces || 0) * load / 100 * STADIUM_ADDITION_COVERED_PLACE +
			(this.seats || 0) * load / 100 * STADIUM_ADDITION_SEAT +
			(this.coveredSeats || 0) * load / 100 * STADIUM_ADDITION_COVERED_SEAT);
	}

	/**
	 * Returns the stadium costs with the given load factor.
	 *
	 * @param {Number} load the stadium load percentage
	 * @return {Number} the costs
	 */
	calculateCosts (load) {
		return Math.round(this.getPlaces() * load / 100 * (STADIUM_PLACE_COSTS - (this.pitchHeating ? 1 : 0)));
	}
}
