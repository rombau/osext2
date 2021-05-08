describe('YouthOptskillsPage', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {YouthOptskillsPage} */ let page;
	
	beforeEach(() => {		
		// for automatic regististration on new page
		spyOn(Persistence, 'updateCachedData').and.callFake((modifyData) => {
			modifyData(data);
			return Promise.resolve(data);
		});
		
		data = new ExtensionData();
		page = new YouthOptskillsPage();
	});

	it('should extend page', (done) => {

		data.nextZat = 53;
		data.nextZatSeason = 16;

		Fixture.getDocument('ju.php?page=3', doc => {
			
			page.extend(doc, data);
		
			done();
		});
	});
});
