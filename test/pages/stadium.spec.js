describe('Page.Stadium', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.Stadium} */ let page;

	beforeEach(() => {
		data = new ExtensionData();
		page = new Page.Stadium();
	});

	it('should extract current stadium data', (done) => {

		Fixture.getDocument('osneu/stadion', doc => {
			
			page.extract(doc, data);
			
			done();
		});
	});
});
