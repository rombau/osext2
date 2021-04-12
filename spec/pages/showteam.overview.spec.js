describe('ShowteamOverviewPage', () => {

	let data = new ExtensionData();
	let page;
	
	beforeEach(() => {
		data = new ExtensionData();

		// for automatic regististration on new page
		spyOn(Persistence, 'updateCachedData').and.callFake((modifyData) => Promise.resolve());

		page = new ShowteamOverviewPage();
	});

	it('should extract team data and extend page', (done) => {

		Fixture.getDocument('showteam.php', doc => {
			
			page.extract(doc, data);
					
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
			
			page.extend(doc, data);
			
			done();
		});
	});
});
