describe('Page.Trainer', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.Trainer} */ let page;

	beforeEach(() => {
		// for automatic regististration on new page
		spyOn(Persistence, 'updateExtensionData').and.callFake((modifyData) => Promise.resolve());

		data = new ExtensionData();
		page = new Page.Trainer();
	});

	it('should extract trainers', (done) => {

		Fixture.getDocument('trainer.php', doc => {
			
			page.extract(doc, data);
			
			page.extend(doc, data);

			done();
		});
	});
});
