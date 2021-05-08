describe('YouthOptionsPage', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {YouthOptionsPage} */ let page;
	
	beforeEach(() => {		
		// for automatic regististration on new page
		spyOn(Persistence, 'updateCachedData').and.callFake((modifyData) => {
			modifyData(data);
			return Promise.resolve(data);
		});
		
		data = new ExtensionData();
		page = new YouthOptionsPage();
	});

	it('should extract page data', (done) => {

		Fixture.getDocument('ju.php?page=4', doc => {
			
			page.extract(doc, data);
		
			done();
		});
	});
});
