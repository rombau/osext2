describe('Page.MatchDayOptions', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.MatchDayOptions} */ let page;
	
	beforeEach(() => {		
		data = new ExtensionData();
		page = new Page.MatchDayOptions();
	});

	it('should extract page data', (done) => {

		Fixture.getDocument('zuzu.php', doc => {
			
			page.extract(doc, data);

			expect(data.viewSettings.ticketPrice.league).toEqual(31);
			expect(data.viewSettings.ticketPrice.cup).toEqual(36);
			expect(data.viewSettings.ticketPrice.international).toEqual(43);
		
			done();
		});
	});
});
