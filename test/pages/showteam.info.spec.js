describe('Page.ShowteamInfo', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.ShowteamInfo} */ let page;

	beforeEach(() => {
		data = new ExtensionData();
		page = new Page.ShowteamInfo();
	});

	it('should extract stadium', (done) => {

		data.nextZat = 49;
		data.nextZatSeason = 5;

		Fixture.getDocument('showteam.php?s=5', doc => {

			page.extract(doc, data);

			expect(data.team.stadium.places).toEqual(7500);
			expect(data.team.stadium.coveredPlaces).toEqual(0);
			expect(data.team.stadium.seats).toEqual(2250);
			expect(data.team.stadium.coveredSeats).toEqual(22500);
			expect(data.team.stadium.pitchHeating).toEqual(false);

			expect(data.team.getMatchDay(5,49).stadiumCapacity).toEqual(43000);
			expect(data.team.getMatchDay(5,49).stadium).toBeUndefined();

			expect(data.team.getMatchDay(5,50).stadium.places).toEqual(10000);
			expect(data.team.getMatchDay(5,50).stadium.coveredPlaces).toEqual(0);
			expect(data.team.getMatchDay(5,50).stadium.seats).toEqual(3000);
			expect(data.team.getMatchDay(5,50).stadium.coveredSeats).toEqual(31000);
			expect(data.team.getMatchDay(5,50).stadium.pitchHeating).toEqual(false);

			expect(data.team.getMatchDay(5,51).stadium).toBeUndefined();

			done();
		});
	});

});
