describe('Page.ShowteamInfo', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.ShowteamInfo} */ let page;

	beforeEach(() => {
		data = new ExtensionData();
		page = new Page.ShowteamInfo();
	});

	it('should extract stadium', (done) => {

		data.nextZat = 72;
		data.nextZatSeason = 5;
		data.team.getMatchDay(5,72).location = GameLocation.HOME;

		Fixture.getDocument('showteam.php?s=5', doc => {

			page.extract(doc, data);

			expect(data.team.stadium.places).toEqual(7500);
			expect(data.team.stadium.coveredPlaces).toEqual(0);
			expect(data.team.stadium.seats).toEqual(2250);
			expect(data.team.stadium.coveredSeats).toEqual(22500);
			expect(data.team.stadium.pitchHeating).toEqual(false);

			expect(data.team.getMatchDay(5,72).stadiumCapacity).toEqual(32250);
			expect(data.team.getMatchDay(5,72).stadium).toBeUndefined();

			expect(data.team.getMatchDay(6,1).stadium.places).toEqual(10000);
			expect(data.team.getMatchDay(6,1).stadium.coveredPlaces).toEqual(0);
			expect(data.team.getMatchDay(6,1).stadium.seats).toEqual(3000);
			expect(data.team.getMatchDay(6,1).stadium.coveredSeats).toEqual(31000);
			expect(data.team.getMatchDay(6,1).stadium.pitchHeating).toEqual(false);

			expect(data.team.getMatchDay(6,2).stadium).toBeUndefined();

			done();
		});
	});

});
