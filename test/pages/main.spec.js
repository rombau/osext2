describe('Page.Main', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.Main} */ let page;

	beforeEach(() => {
		data = new ExtensionData();
		page = new Page.Main();

		spyOn(Persistence, 'storeExtensionData').and.callFake(() => {
			return Promise.resolve();
		});
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

			page.extract(doc, data);

			expect(data.nextZat).toEqual(49);

			expect(data.team.id).toEqual(19);
			expect(data.team.name).toEqual('FC Cork');
			expect(data.team.emblem).toEqual('00000019.png');
			expect(data.team.league.level).toEqual(1);
			expect(data.team.league.countryName).toEqual('Irland');
			expect(data.team.accountBalance).toEqual(42300545);

			expect(data.pagesToRequest.length).toBeGreaterThan(0);

			data.nextZatSeason = 12; // initialized before extend

			page.extend(doc, data);

			done();
		});
	});
});
