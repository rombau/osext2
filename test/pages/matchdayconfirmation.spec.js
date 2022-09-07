describe('Page.MatchDayConfirmation', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.MatchDayConfirmation} */ let page;

	beforeEach(() => {
		data = new ExtensionData();
		page = new Page.MatchDayConfirmation();
	});

	it('should extract page data', (done) => {

		data.team.squadPlayers[0] = new SquadPlayer();
		data.team.squadPlayers[0].name = 'Sasa Colaric';
		data.team.squadPlayers[1] = new SquadPlayer();
		data.team.squadPlayers[1].name = 'Chris Vertenten';
		data.team.squadPlayers[2] = new SquadPlayer();
		data.team.squadPlayers[2].name = 'Anker Jensen';
		data.team.squadPlayers[3] = new SquadPlayer();
		data.team.squadPlayers[3].name = 'Kurt Depuysselaer';
		data.team.squadPlayers[4] = new SquadPlayer();
		data.team.squadPlayers[4].name = 'Hugo Boss';
		data.team.squadPlayers[5] = new SquadPlayer();
		data.team.squadPlayers[5].name = 'Emanuel Kant';
		data.team.squadPlayers[5].nextTraining = new SquadPlayer.Training();
		data.team.squadPlayers[5].nextTraining.matchBonus = 1.35;

		Fixture.getDocument('checkza.php', doc => {

			page.extract(doc, data);

			expect(data.team.squadPlayers[0].nextTraining.matchBonus).toEqual(1.25);
			expect(data.team.squadPlayers[1].nextTraining.matchBonus).toEqual(1.25);
			expect(data.team.squadPlayers[2].nextTraining.matchBonus).toEqual(1.35);
			expect(data.team.squadPlayers[3].nextTraining.matchBonus).toEqual(1.1);
			expect(data.team.squadPlayers[4].nextTraining).toBeUndefined();
			expect(data.team.squadPlayers[5].nextTraining.matchBonus).toEqual(1);
			
			done();
		});
	});
});
