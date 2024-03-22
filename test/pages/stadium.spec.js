describe('Page.Stadium', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.Stadium} */ let page;

	beforeEach(() => {
		data = new ExtensionData();
		page = new Page.Stadium();
	});

	it('should extract current stadium data', (done) => {

		data.nextZat = 49;
		data.nextZatSeason = 5;

		Fixture.getDocument('osneu/stadion', doc => {

			page.extract(doc, data);

			expect(data.team.stadium.coveredSeats).toEqual(30750);
			expect(data.team.stadium.pitchHeating).toEqual(true);

			expect(data.team.getMatchDay(5, 49).stadium).toBeUndefined();

			expect(data.team.getMatchDay(5, 50).stadium.coveredSeats).toEqual(42000);
			expect(data.team.getMatchDay(5, 50).stadium.pitchHeating).toEqual(true);

			expect(data.team.getMatchDay(5, 51).stadium).toBeUndefined();

			done();
		});
	});
});
