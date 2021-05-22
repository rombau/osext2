describe('Page.Main', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.Main} */ let page;
	
	beforeEach(() => {
		data = new ExtensionData();
		page = new Page.Main();
	});

	it('should extract team name', (done) => {
		
		Fixture.getDocument('haupt.php', doc => {
			
			spyOn(Persistence, 'updateCurrentTeam').and.callFake(() => {
				return Promise.resolve();
			});
			spyOn(Object.getPrototypeOf(Object.getPrototypeOf(page)), 'process').and.callFake(() => {
				done();
			});
			
			page.process(doc, data);
			
			expect(Persistence.updateCurrentTeam).toHaveBeenCalledWith('FC Cork');
		});
	});

	it('should extract team data for new match day', (done) => {

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
