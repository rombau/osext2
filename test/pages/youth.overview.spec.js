describe('YouthOverviewPage', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {YouthOverviewPage} */ let page;
	
	beforeEach(() => {		
		// for automatic regististration on new page
		spyOn(Persistence, 'updateCachedData').and.callFake((modifyData) => {
			modifyData(data);
			return Promise.resolve(data);
		});
		
		data = new ExtensionData();
		page = new YouthOverviewPage();
	});

	it('should extract team data and extend page', (done) => {

		data.nextZat = 53;
		data.nextZatSeason = 16;

		Fixture.getDocument('ju.php', doc => {
			
			page.extract(doc, data);
					
			expect(data.currentTeam.youthPlayers.length).toEqual(21);
			expect(data.currentTeam.youthPlayers[0].pos).toBeUndefined();
			expect(data.currentTeam.youthPlayers[0].countryCode).toEqual('CYP');
			expect(data.currentTeam.youthPlayers[0].countryName).toEqual('Zypern');
			expect(data.currentTeam.youthPlayers[0].uefa).toBeTruthy();
			expect(data.currentTeam.youthPlayers[0].talent).toEqual(Talent.NORMAL);

			expect(data.currentTeam.youthPlayers[9].pos).toEqual(Position.TOR);

			page.extend(doc, data);
		
			done();
		});
	});
});
