describe('ShowteamOverviewPage', () => {

	let data = new ExtensionData();
	let page = new ShowteamOverviewPage();
	
	beforeEach(() => {
		data = new ExtensionData();
		page = new ShowteamOverviewPage();
	});

	it('should extract team data and extend page', (done) => {

		Fixture.getDocument('showteam.php', doc => {
			
			page.extract(doc, data);
			
			expect(data.currentTeam.id).toEqual(19);
			expect(data.currentTeam.name).toEqual('FC Cork');
			expect(data.currentTeam.emblem).toEqual('00000019.png');
			expect(data.currentTeam.league.level).toEqual(1);
			expect(data.currentTeam.league.countryName).toEqual('Irland');
			
			expect(data.currentTeam.squadPlayers.length).toEqual(32);
			expect(data.currentTeam.squadPlayers[0].id).toEqual(41930);
			expect(data.currentTeam.squadPlayers[0].pos).toEqual(Position.TOR);
			expect(data.currentTeam.squadPlayers[0].name).toEqual('Steve Stapleton');
			expect(data.currentTeam.squadPlayers[0].countryCode).toEqual('IRL');
			expect(data.currentTeam.squadPlayers[0].countryName).toEqual('Irland');
			expect(data.currentTeam.squadPlayers[0].uefa).toBeTruthy();
			expect(data.currentTeam.squadPlayers[0].injured).toBeUndefined();
			expect(data.currentTeam.squadPlayers[0].transferState).toEqual('U');
			expect(data.currentTeam.squadPlayers[0].transferLock).toBeUndefined();

			// TODO: extract bans and loans ...
			
			page.extend(doc, data);
			
			done();
		});
	});
});
