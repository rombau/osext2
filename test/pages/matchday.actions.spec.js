describe('Page.MatchDayActions', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.MatchDayActions} */ let page;

	beforeEach(() => {
		data = new ExtensionData();
		page = new Page.MatchDayActions();
	});

	it('should extract page data', (done) => {

		data.team.squadPlayers[0] = new SquadPlayer();
		data.team.squadPlayers[0].name = 'Sasa Colaric';
		data.team.squadPlayers[1] = new SquadPlayer();
		data.team.squadPlayers[1].name = 'Chris Vertenten';

		Fixture.getDocument('zugabgabe.php?p=1', doc => {

			page.extract(doc, data);

			expect(data.team.squadPlayers[0].nextTraining.matchBonus).toEqual(1.25);
			expect(data.team.squadPlayers[1].nextTraining.matchBonus).toEqual(1.25);
			
			done();
		});
	});
});
