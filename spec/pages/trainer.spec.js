describe('TrainerPage', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {TrainerPage} */ let page;

	beforeEach(() => {
		// for automatic regististration on new page
		spyOn(Persistence, 'updateCachedData').and.callFake((modifyData) => Promise.resolve());

		data = new ExtensionData();
		page = new TrainerPage();
	});

	it('should extract trainers', (done) => {

		Fixture.getDocument('trainer.php', doc => {
			
			page.extract(doc, data);
			
			page.extend(doc, data);

			done();
		});
	});
});
