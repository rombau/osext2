describe('Page.LeagueTable', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.LeagueTable} */ let page;

	beforeEach(() => {
		// for automatic regististration on new page
		spyOn(Persistence, 'updateExtensionData').and.callFake((modifyData) => Promise.resolve());

		data = new ExtensionData();
		page = new Page.LeagueTable();
	});

	it('should extract league table and current ranking', (done) => {

		Fixture.getDocument('lt.php', doc => {
			
			data.currentTeam.id = 19;

			page.extract(doc, data);
			
			expect(data.currentTeam.league.size).toEqual(10);
			expect(data.currentTeam.leagueRanking).toEqual(3);

			page.extend(doc, data);

			done();
		});
	});
});
