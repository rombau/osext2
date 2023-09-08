describe('Page.LeagueTable', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.LeagueTable} */ let page;

	beforeEach(() => {
		data = new ExtensionData();
		page = new Page.LeagueTable();

		data.team.id = 19;
		data.team.league.countryName = 'Irland';
		data.team.league.level = 2;
	});

	it('should extract league table', (done) => {

		Fixture.getDocument('lt.php', doc => {

			page.extract(doc, data);

			expect(data.team.league.size).toEqual(10);
			expect(data.viewSettings.leagueRanking).toEqual(3);

			expect(data.pagesToRequest[0].name).toEqual('Ligatabelle');
			expect(data.pagesToRequest[0].params[0].name).toEqual('ligaauswahl');
			expect(data.pagesToRequest[0].params[0].value).toEqual(3);
			expect(data.team.league.relegation).toBeUndefined();

			done();
		});
	});

	it('should extract league table for relegation directly', (done) => {

		Fixture.getDocument('lt.php', doc => {

			doc.querySelector('select[name=ligaauswahl]').value = 3;

			page.extract(doc, data);

			expect(data.team.league.size).toEqual(10);
			expect(data.viewSettings.leagueRanking).toEqual(3);

			expect(data.pagesToRequest.length).toEqual(0);
			expect(data.team.league.relegation).toBeTruthy();

			done();
		});
	});

	it('should extract league table and current ranking with team performance', (done) => {

		Fixture.getDocument('lt_performance.php', doc => {

			page.extract(doc, data);

			expect(data.team.league.size).toEqual(10);
			expect(data.viewSettings.leagueRanking).toEqual(2);

			expect(data.pagesToRequest.length).toEqual(0);

			done();
		});
	});

	it('should not extract if not current teams league', (done) => {

		Fixture.getDocument('lt.php', doc => {

			data.team.id = 4711;

			page.extract(doc, data);

			expect(data.team.league.size).toBeUndefined();
			expect(data.viewSettings.leagueRanking).toEqual(1);

			expect(data.team.league.relegation).toBeTruthy();

			done();
		});
	});
});
