describe('Page.YouthOptskills', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.YouthOptskills} */ let page;

	beforeEach(() => {
		data = new ExtensionData();
		page = new Page.YouthOptskills();

		spyOn(Persistence, 'storeExtensionData').and.callFake(() => {
			return Promise.resolve();
		});
	});

	it('should extract and extend page', (done) => {

		data.nextZat = 53;
		data.nextZatSeason = 16;

		data.complete();

		Fixture.getDocument('ju.php', doc => {

			new Page.YouthOverview().extract(doc, data);

			data.team.syncYouthPlayers();

			Fixture.getDocument('ju.php?page=3', doc => {

				page.extend(doc, data);

				done();
			});
		});

	});
});
