describe('Page.ShowPlayer', () => {

	/** @type {ExtensionData} */ let data;

	beforeEach(() => {
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

	it('should not extract zero player', () => {

		let page = new Page.ShowPlayer();

		let doc = Fixture.createDocument('Any content');

		page.extract(doc, data);

	});
});
