describe('Page.ShowteamInfo', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.ShowteamInfo} */ let page;
	
	beforeEach(() => {
		data = new ExtensionData();
		page = new Page.ShowteamInfo();
	});

	it('should extract stadium', (done) => {

		data.nextZat = 49;

		Fixture.getDocument('showteam.php?s=5', doc => {
			
			page.extract(doc, data);
						
			expect(data.team.stadium.places).toEqual(10000);
			expect(data.team.stadium.coveredPlaces).toEqual(0);
			expect(data.team.stadium.seats).toEqual(3000);
			expect(data.team.stadium.coveredSeats).toEqual(30000);
			expect(data.team.stadium.pitchHeating).toEqual(false);

			done();
		});
	});

});