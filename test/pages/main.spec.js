describe('MainPage', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {MainPage} */ let page;
	
	beforeEach(() => {
		// for automatic regististration on new page
		spyOn(Persistence, 'updateCachedData').and.callFake((modifyData) => Promise.resolve());

		data = new ExtensionData();
		page = new MainPage();
	});

	it('should extract team data when not initialized', (done) => {

		Fixture.getDocument('haupt.php', doc => {
			
			let initPages = page.extract(doc, data);
			
			expect(data.nextZat).toEqual(49);

			expect(data.currentTeam.id).toEqual(19);
			expect(data.currentTeam.name).toEqual('FC Cork');
			expect(data.currentTeam.emblem).toEqual('00000019.png');
			expect(data.currentTeam.league.level).toEqual(1);
			expect(data.currentTeam.league.countryName).toEqual('Irland');
			
			expect(initPages).toBeDefined();

			data.nextZatSeason = 12; // initialized before extend

			page.extend(doc, data);
			
			done();
		});
	});
});
