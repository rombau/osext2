describe('Page.YouthOverview', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.YouthOverview} */ let page;
	
	beforeEach(() => {			
		data = new ExtensionData();
		page = new Page.YouthOverview();

		spyOn(Persistence, 'storeExtensionData').and.callFake(() => {
			return Promise.resolve();
		});
	});

	it('should extract team data and extend page', (done) => {

		data.nextZat = 53;
		data.nextZatSeason = 16;

		data.complete();
		
		Fixture.getDocument('ju.php', doc => {
			
			page.extract(doc, data);
					
			expect(data.team.youthPlayers.length).toEqual(21);
			expect(data.team.youthPlayers[0].pos).toBeUndefined();
			expect(data.team.youthPlayers[0].countryCode).toEqual('CYP');
			expect(data.team.youthPlayers[0].countryName).toEqual('Zypern');
			expect(data.team.youthPlayers[0].uefa).toBeTruthy();
			expect(data.team.youthPlayers[0].talent).toEqual(Talent.NORMAL);
			expect(data.team.youthPlayers[0].pullId).toEqual(200864);

			expect(data.team.youthPlayers[9].pos).toEqual(Position.TOR);
			expect(data.team.youthPlayers[9].pullId).toBeUndefined();

			page.extend(doc, data);
		
			done();
		});
	});
});
