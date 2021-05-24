describe('Page.ShowteamOverview', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.ShowteamOverview} */ let page;
	
	beforeEach(() => {		
		data = new ExtensionData();
		page = new Page.ShowteamOverview();
	});

	it('should extract team data and extend page', (done) => {

		data.nextZat = 53;
		data.nextSeason = 16;

		data.complete();

		data.team.squadPlayers.push(new SquadPlayer());

		Fixture.getDocument('showteam.php', doc => {
			
			page.extract(doc, data);
					
			expect(data.team.squadPlayers.length).toEqual(32);
			expect(data.team.squadPlayers[0].id).toEqual(41930);
			expect(data.team.squadPlayers[0].pos).toEqual(Position.TOR);
			expect(data.team.squadPlayers[0].name).toEqual('Steve Stapleton');
			expect(data.team.squadPlayers[0].countryCode).toEqual('IRL');
			expect(data.team.squadPlayers[0].countryName).toEqual('Irland');
			expect(data.team.squadPlayers[0].uefa).toBeTruthy();
			expect(data.team.squadPlayers[0].injured).toEqual(0);
			expect(data.team.squadPlayers[0].transferState).toEqual('U');
			expect(data.team.squadPlayers[0].transferLock).toEqual(0);
			expect(data.team.squadPlayers[0].bans.length).toEqual(3);
			expect(data.team.squadPlayers[0].bans[0].type).toEqual(BanType.LEAGUE);
			expect(data.team.squadPlayers[0].bans[0].duration).toEqual(1);
			expect(data.team.squadPlayers[0].loan).toBeUndefined();

			expect(data.team.squadPlayers[1].bans.length).toEqual(0);

			expect(data.team.squadPlayers[21].pos).toEqual('LEI');
			expect(data.team.squadPlayers[21].loan.from).toEqual('FC Cork');
			expect(data.team.squadPlayers[21].loan.to).toEqual('Kickers Dresden');
			expect(data.team.squadPlayers[21].loan.duration).toEqual(1);

			page.extend(doc, data);
		
			let slider = doc.querySelector('input[type=range]')
			slider.value += 19; // to test season interval
			slider.dispatchEvent(new Event('input'));
			slider.dispatchEvent(new Event('change'));
		
			done();
		});
	});
});
