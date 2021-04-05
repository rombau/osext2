describe('Team', () => {

	let team = new Team();
	
	it('should be created', () => {
		
		expect(team.id).toBeUndefined();
		expect(team.league.level).toBeUndefined();

		expect(team.squadPlayers.length).toEqual(0);
		expect(team.youthPlayers.length).toEqual(0);
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
