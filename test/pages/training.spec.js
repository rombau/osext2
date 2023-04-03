describe('Page.Training', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.Training} */ let page;

	beforeEach(() => {
		data = new ExtensionData();
		page = new Page.Training();
	});

	it('should extract player training settings', (done) => {

		let playerWithBonus = data.team.getSquadPlayer(11031);
		playerWithBonus.nextTraining = new SquadPlayer.Training();
		playerWithBonus.nextTraining.matchBonus = 1.1;

		let playerWithOutBonus = data.team.getSquadPlayer(41930);
		playerWithOutBonus.nextTraining = new SquadPlayer.Training();

		let playerWithTraining = data.team.getSquadPlayer(81726);
		playerWithTraining.nextTraining = new SquadPlayer.Training();

		Fixture.getDocument('training.php', doc => {

			page.extract(doc, data);

			expect(playerWithBonus.nextTraining.matchBonus).toEqual(1.1);
			expect(playerWithOutBonus.nextTraining).toBeNull();
			expect(playerWithTraining.nextTraining.matchBonus).toEqual(1);
			expect(playerWithTraining.nextTraining.skill).toEqual(Skill.AGG);
			expect(playerWithTraining.nextTraining.chance).toEqual(87.95);

			page.extend(doc, data);

			done();
		});
	});
});
