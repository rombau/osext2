describe('Page.YouthOverview', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.YouthOverview} */ let page;

	beforeEach(() => {
		data = new ExtensionData();
		page = new Page.YouthOverview();

		spyOn(data.team, 'syncYouthPlayers').and.callThrough();

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

			expect(data.team.pageYouthPlayers.length).toEqual(21);
			expect(data.team.pageYouthPlayers[0].pos).toBeUndefined();
			expect(data.team.pageYouthPlayers[0].countryCode).toEqual('CYP');
			expect(data.team.pageYouthPlayers[0].countryName).toEqual('Zypern');
			expect(data.team.pageYouthPlayers[0].uefa).toBeTruthy();
			expect(data.team.pageYouthPlayers[0].season).toEqual(11);
			expect(data.team.pageYouthPlayers[0].talent).toEqual(Talent.NORMAL);
			expect(data.team.pageYouthPlayers[0].pullId).toEqual(200864);

			expect(data.team.pageYouthPlayers[9].season).toEqual(14);
			expect(data.team.pageYouthPlayers[9].pos).toEqual(Position.TOR);
			expect(data.team.pageYouthPlayers[9].pullId).toBeUndefined();

			expect(data.pagesToRequest.length).toEqual(1);
			expect(data.pagesToRequest[0].name).toEqual('Jugendeinzelskills');

			page.extract(doc, data);

			expect(data.pagesToRequest.length).toEqual(1);
			expect(data.pagesToRequest[0].name).toEqual('Jugendeinzelskills');
			expect(data.team.syncYouthPlayers).not.toHaveBeenCalled();

			data.pagesToRequest = [];

			page.extract(doc, data);

			expect(data.team.syncYouthPlayers).toHaveBeenCalled();

			expect(data.team.youthPlayers.length).toEqual(21);
			expect(data.team.youthPlayers[0].pos).toBeUndefined();
			expect(data.team.youthPlayers[0].countryCode).toEqual('CYP');
			expect(data.team.youthPlayers[0].countryName).toEqual('Zypern');
			expect(data.team.youthPlayers[0].uefa).toBeTruthy();
			expect(data.team.youthPlayers[0].season).toEqual(11);
			expect(data.team.youthPlayers[0].talent).toEqual(Talent.NORMAL);
			expect(data.team.youthPlayers[0].pullId).toEqual(200864);

			expect(data.team.youthPlayers[9].season).toEqual(14);
			expect(data.team.youthPlayers[9].pos).toEqual(Position.TOR);
			expect(data.team.youthPlayers[9].pullId).toBeUndefined();

			page.extend(doc, data);

			done();
		});
	});
});
