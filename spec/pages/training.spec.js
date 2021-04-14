describe('TrainingPage', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {TrainingPage} */ let page;

	beforeEach(() => {
		// for automatic regististration on new page
		spyOn(Persistence, 'updateCachedData').and.callFake((modifyData) => Promise.resolve());

		data = new ExtensionData();
		page = new TrainingPage();
	});

	it('should extract player training settings', (done) => {

		Fixture.getDocument('training.php', doc => {
			
			page.extract(doc, data);

			page.extend(doc, data);

			done();
		});
	});
});
