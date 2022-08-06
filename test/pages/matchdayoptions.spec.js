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

			expect(data.team.squadPlayers[0].id).toEqual(11031);
			expect(data.team.squadPlayers[0].physioCosts).toBeNull();

			expect(data.team.squadPlayers[13].id).toEqual(111254);
			expect(data.team.squadPlayers[13].physioCosts).toEqual(50000);
			
			done();
		});
	});
});
