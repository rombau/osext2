describe('ShowPlayerPage', () => {

	let data = new ExtensionData();
	let page = new ShowPlayerPage();
	
	beforeEach(() => {
		data = new ExtensionData();
		page = new ShowPlayerPage();
	});

	it('should extract player birthday', (done) => {

		Fixture.getDocument('sp.php', doc => {
			
			page.extract(doc, data);
			
			page.extend(doc, data);

			done();
		});
	});
});
