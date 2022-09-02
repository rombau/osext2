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

			expect(data.team.squadPlayers[0].nextTraining.matchBonus).toEqual(1.1);
			expect(data.team.squadPlayers[1].nextTraining.matchBonus).toEqual(1.35);
			
			done();
		});
	});
});
