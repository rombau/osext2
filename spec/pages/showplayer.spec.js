describe('ShowPlayerPage', () => {

	let data = new ExtensionData();
	
	beforeEach(() => {
		data = new ExtensionData();

		// for automatic regististration on new page
		spyOn(Persistence, 'updateCachedData').and.callFake((modifyData) => Promise.resolve());
	});

	it('should extract player birthday', (done) => {

		let page = new ShowPlayerPage(20494, 'Ariel Barlarezo');

		Fixture.getDocument('sp.php', doc => {
			
			page.extract(doc, data);
			
			page.extend(doc, data);

			done();
		});
	});
});
