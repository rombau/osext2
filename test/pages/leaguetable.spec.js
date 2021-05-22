describe('Page.LeagueTable', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.LeagueTable} */ let page;

	beforeEach(() => {
		data = new ExtensionData();
		page = new Page.LeagueTable();
	});

	it('should extract league table and current ranking', (done) => {

		Fixture.getDocument('lt.php', doc => {
			
			data.team.id = 19;

			page.extract(doc, data);
			
			expect(data.team.league.size).toEqual(10);
			expect(data.team.leagueRanking).toEqual(3);

			page.extend(doc, data);

			done();
		});
	});
});
