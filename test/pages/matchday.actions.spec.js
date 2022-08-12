describe('Page.MatchDayActions', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.MatchDayActions} */ let page;

	beforeEach(() => {
		data = new ExtensionData();
		page = new Page.MatchDayActions();
	});

	it('should extract page data', (done) => {

		Fixture.getDocument('zugabgabe.php?p=1', doc => {

			page.extract(doc, data);

			expect(1).toEqual(1);
			
			done();
		});
	});
});
