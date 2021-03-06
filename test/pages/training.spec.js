describe('Page.Training', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.Training} */ let page;

	beforeEach(() => {
		data = new ExtensionData();
		page = new Page.Training();
	});

	it('should extract player training settings', (done) => {

		Fixture.getDocument('training.php', doc => {

			page.extract(doc, data);

			page.extend(doc, data);

			done();
		});
	});
});
