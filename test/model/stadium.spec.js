describe('Stadium', () => {

	/** @type {Stadium} */ let stadium;

	beforeEach(() => {
		stadium = new Stadium();

		stadium.places = 10000;
		stadium.coveredPlaces = 10000;
		stadium.seats = 10000;
		stadium.coveredSeats = 10000;
		stadium.pitchHeating = false;

	});

	it('should return sum of all places', () => {

		expect(stadium.getPlaces()).toEqual(40000);
	});

	it('should return income', () => {

		expect(stadium.calculateIncome(30, 100)).toEqual(1400000);
		expect(stadium.calculateIncome(60, 50)).toEqual(1300000);
		expect(stadium.calculateIncome(30, 50)).toEqual(700000);
	});

	it('should return costs', () => {

		expect(stadium.calculateCosts(100)).toEqual(200000);
		expect(stadium.calculateCosts(50)).toEqual(100000);

		stadium.pitchHeating = true;

		expect(stadium.calculateCosts(100)).toEqual(160000);
		expect(stadium.calculateCosts(50)).toEqual(80000);
	});

});
