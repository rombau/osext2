describe('Page.LeagueTable', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.LeagueTable} */ let page;

	beforeEach(() => {
		data = new ExtensionData();
		page = new Page.LeagueTable();

		data.team.id = 19;
	});

	it('should extract league table and current ranking', (done) => {

		Fixture.getDocument('lt.php', doc => {
			
			page.extract(doc, data);
			
			expect(data.team.league.size).toEqual(10);
			expect(data.viewSettings.leagueRanking).toEqual(3);

			page.extend(doc, data);

			done();
		});
	});

	it('should extract league table and current ranking with team performance', (done) => {

		Fixture.getDocument('lt_performance.php', doc => {
			
			page.extract(doc, data);
			
			expect(data.team.league.size).toEqual(10);
			expect(data.viewSettings.leagueRanking).toEqual(2);

			page.extend(doc, data);

			done();
		});
	});

	it('should not extract if not current teams league', (done) => {

		Fixture.getDocument('lt.php', doc => {
			
			data.team.id = 4711;

			page.extract(doc, data);
			
			expect(data.team.league.size).toBeUndefined();
			expect(data.viewSettings.leagueRanking).toEqual(1);

			done();
		});
	});
});
