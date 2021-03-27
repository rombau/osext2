describe('Page (s)how (p)layer', () => {

	let data;
	
	beforeEach(() => {
		data = {};
		data.team = new Team();
		data.team.squadPlayers.push(new SquadPlayer());
		data.team.squadPlayers.push(new SquadPlayer());
		data.team.squadPlayers.push(new SquadPlayer());
		data.team.squadPlayers[1].id = 20494;
	});

	it('should extract player birthday', (done) => {

		Fixture.getDocument('sp.php', doc => {
			
			Page.ShowPlayer.extract(doc, data);

			expect(data.team.squadPlayers.length).toEqual(3);
			expect(data.team.squadPlayers[0].birthday).toBeUndefined();
			expect(data.team.squadPlayers[1].birthday).toEqual(12);
			expect(data.team.squadPlayers[2].birthday).toBeUndefined();
			
			done();
		});
	});
});
