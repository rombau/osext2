describe('Page showteam overview', () => {

	let data;
	
	beforeEach(() => {
		data = {};
	});

	it('should extract team data and extend page', (done) => {

		Fixture.getDocument('showteam.php', doc => {
			
			let additionalPagesToLoad = Page.ShowteamOverview.extract(doc, data);
			
			expect(data.team.id).toEqual(19);
			expect(data.team.name).toEqual('FC Cork');
			expect(data.team.image).toEqual('00000019.png');
			expect(data.team.league.level).toEqual(1);
			expect(data.team.league.country).toEqual('Irland');
			
			expect(data.team.squadPlayers.length).toEqual(32);
			expect(data.team.squadPlayers[0].id).toEqual(41930);
			expect(data.team.squadPlayers[0].pos).toEqual('TOR');
			expect(data.team.squadPlayers[0].name).toEqual('Steve Stapleton');
			expect(data.team.squadPlayers[0].country).toEqual('IRL');
			expect(data.team.squadPlayers[0].uefa).toBeTruthy();
			expect(data.team.squadPlayers[0].injured).toBeUndefined();
			expect(data.team.squadPlayers[0].state).toEqual('U');
			expect(data.team.squadPlayers[0].locked).toBeUndefined();
			expect(data.team.squadPlayers[0].banned).toBeUndefined();

			expect(additionalPagesToLoad.length).toEqual(32);
			
			Page.ShowteamOverview.extend(doc, data);
			
			done();
		});
	});
});
