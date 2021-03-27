describe('Team', () => {

	let team = new Team();
	
	it('should be created', () => {
		
		expect(team.id).toBeUndefined();
		expect(team.league.level).toBeUndefined();

	});

	it('should return storage data', () => {
		
		team.squadPlayers.push(new SquadPlayer());
		team.squadPlayers[0].id = 4711;
		team.squadPlayers[0].birthday = 6;
		
		expect(team.getStorageData()).toEqual({players: [{id: 4711, birthday: 6}]});
	});

	it('should be initialized by storage data', () => {
				
		team.applyStorageData({players: [{id: 4711, birthday: 6}, {id: 4712, birthday: 12}]});
		
		expect(team.squadPlayers.length).toEqual(2);
		expect(team.squadPlayers[0].id).toEqual(4711);
		expect(team.squadPlayers[0].birthday).toEqual(6);
		expect(team.squadPlayers[1].id).toEqual(4712);
		expect(team.squadPlayers[1].birthday).toEqual(12);
	});

	it('should be overridden by storage data', () => {
		
		team.squadPlayers.push(new SquadPlayer());
		team.squadPlayers[0].id = 4711;
		team.squadPlayers[0].name = 'Hugo';
		
		team.applyStorageData({players: [{id: 4711, birthday: 6}]});
		
		expect(team.squadPlayers[0].id).toEqual(4711);
		expect(team.squadPlayers[0].birthday).toEqual(6);
	});

});
