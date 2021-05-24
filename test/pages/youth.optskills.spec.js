describe('Page.YouthOptskills', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.YouthOptskills} */ let page;
	
	beforeEach(() => {			
		data = new ExtensionData();
		page = new Page.YouthOptskills();
	});

	it('should extend page', (done) => {

		data.nextZat = 53;
		data.nextSeason = 16;

		Fixture.getDocument('ju.php?page=3', doc => {
			
			page.extend(doc, data);
		
			done();
		});
	});
});
