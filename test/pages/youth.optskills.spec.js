describe('Page.YouthOptskills', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.YouthOptskills} */ let page;
	
	beforeEach(() => {			
		data = new ExtensionData();
		page = new Page.YouthOptskills();
	});

	it('should extract page', (done) => {

		Fixture.getDocument('ju.php?page=3', doc => {
			
			page.extract(doc, data);
		
			done();
		});
	});

	it('should extend page', (done) => {

		Fixture.getDocument('ju.php?page=3', doc => {
			
			page.extend(doc, data);
		
			done();
		});
	});
});
