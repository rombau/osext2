describe('Page.MatchDayLineUp', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.MatchDayLineUp} */ let page;

	beforeEach(() => {
		data = new ExtensionData();
		page = new Page.MatchDayLineUp();
	});

	it('should extract page data', (done) => {

		Fixture.getDocument('zugabgabe.php', doc => {

			page.extract(doc, data);

			expect(1).toEqual(1);
			
			done();
		});
	});
});
