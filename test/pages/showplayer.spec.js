describe('Page.ShowPlayer', () => {

	/** @type {ExtensionData} */ let data;
	
	beforeEach(() => {
		// for automatic regististration on new page
		spyOn(Persistence, 'updateExtensionData').and.callFake((modifyData) => Promise.resolve());

		data = new ExtensionData();
	});

	it('should extract player birthday', (done) => {

		let page = new Page.ShowPlayer(20494, 'Ariel Barlarezo');

		Fixture.getDocument('sp.php', doc => {
			
			page.extract(doc, data);
			
			page.extend(doc, data);

			done();
		});
	});
});
