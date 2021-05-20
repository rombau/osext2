describe('Page.YouthOptions', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.YouthOptions} */ let page;
	
	beforeEach(() => {		
		// for automatic regististration on new page
		spyOn(Persistence, 'updateExtensionData').and.callFake((modifyData) => {
			modifyData(data);
			return Promise.resolve(data);
		});
		
		data = new ExtensionData();
		page = new Page.YouthOptions();
	});

	it('should extract page data', (done) => {

		Fixture.getDocument('ju.php?page=4', doc => {
			
			page.extract(doc, data);
		
			done();
		});
	});
});
