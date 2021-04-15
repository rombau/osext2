describe('Team', () => {

	/** @type {Team} */
	let team;
	
	beforeEach(() => {
		team = new Team();
	});

	it('should be created', () => {
		
		expect(team.id).toBeUndefined();
		expect(team.league.level).toBeUndefined();

		expect(team.squadPlayers.length).toEqual(0);
		expect(team.youthPlayers.length).toEqual(0);

	});

	it('should return requested squad player', () => {
		
		expect(team.getSquadPlayer()).toBeUndefined();
		expect(team.getSquadPlayer(1)).toBeDefined();
		expect(team.getSquadPlayer(1).id).toEqual(1);
		expect(team.getSquadPlayer(2)).toBe(team.getSquadPlayer(2));
	});

	it('should return requested match day', () => {
		
		expect(team.getMatchDay()).toBeUndefined();
		expect(team.getMatchDay(5,34)).toBeDefined();
		expect(team.getMatchDay(5,34).zat).toEqual(34);
		expect(team.getMatchDay(5,34).season).toEqual(5);
		expect(team.getMatchDay(7,11)).toBe(team.getMatchDay(7,11));
	});

	it('should return requested trainer', () => {
		
		expect(team.getTrainer()).toBeUndefined();
		expect(team.getTrainer(1)).toBeDefined();
		expect(team.getTrainer(1).nr).toEqual(1);
		expect(team.getTrainer(2)).toBe(team.getTrainer(2));
	});

	it('should return forecast', () => {

		team.squadPlayers.push(new SquadPlayer());

		let lastMatchDay = new MatchDay(15,50);

		expect(team.getForecast(lastMatchDay, new MatchDay(15,50))).toBe(team);
		expect(team.getForecast(lastMatchDay, new MatchDay(15,72))).not.toBe(team);
		expect(team.getForecast(lastMatchDay, new MatchDay(15,72)).squadPlayers.length).toEqual(team.squadPlayers.length);
		expect(team.getForecast(lastMatchDay, new MatchDay(15,72))).toBe(team.getMatchDay(15,72).team);
	});

	it('should handle storage data', () => {
		
		team.squadPlayers.push(new SquadPlayer());
		team.squadPlayers[0].id = 4711;
		team.squadPlayers[0].birthday = 6;

		team.squadPlayers.push(new SquadPlayer());
		team.squadPlayers[0].id = 4712;
		team.squadPlayers[0].fastTransfer = 41;
		
		let storageData = team.getStorageData();

		expect(storageData.squadPlayers.length).toEqual(1);
		expect(storageData.squadPlayers[0].id).toEqual(4712);
		expect(storageData.squadPlayers[0].fastTransfer).toEqual(41);

		team.squadPlayers[0].fastTransfer = null;

		team.applyStorageData(storageData);

		expect(team.squadPlayers[0].fastTransfer).toEqual(41);
	});

});
