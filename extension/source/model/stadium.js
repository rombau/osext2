
/**
 * Stadium representation.
 */
class Stadium {

	constructor() {
			
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
		return this.places + this.seats + this.coveredPlaces + this.coveredSeats;
	}
		
	/**
	 * Returns the stadium income with the given ticket price and load factor.
	 * 
	 * @param {Number} ticketPrice the ticket price
	 * @param {Number} load the stadium load percentage
	 * @return {Number} the income 
	 */		
	calculateIncome (ticketPrice, load) {
		return this.getPlaces() * load / 100 * ticketPrice +
			this.coveredPlaces * load / 100 * STADIUM_ADDITION_COVERED_PLACE +
			this.seats * load / 100 * STADIUM_ADDITION_SEAT +
			this.coveredSeats * load / 100 * STADIUM_ADDITION_COVERED_SEAT;
	}
	
	/**
	 * Returns the stadium costs with the given load factor.
	 * 
	 * @param {Number} load the stadium load percentage
	 * @return {Number} the costs
	 */		
	calculateCosts (load) {	
		return this.getPlaces() * load / 100 * (STADIUM_PLACE_COSTS - (this.pitchHeating ? 1 : 0));
	}
}
