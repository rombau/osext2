describe('Page.ShowteamSkills', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.ShowteamSkills} */ let page;
	
	beforeEach(() => {
		data = new ExtensionData();
		page = new Page.ShowteamSkills();
	});

	it('should extract team data and extend page', (done) => {

		data.nextZat = 53;
		data.nextZatSeason = 16;
		
		Fixture.getDocument('showteam.php?s=2', doc => {
			
			page.extract(doc, data);
						
			expect(data.currentTeam.squadPlayers.length).toEqual(32);
			expect(data.currentTeam.squadPlayers[0].skills.sch).toEqual(58);
			expect(data.currentTeam.squadPlayers[0].skills.bak).toEqual(80);
			expect(data.currentTeam.squadPlayers[0].skills.kob).toEqual(85);
			expect(data.currentTeam.squadPlayers[0].skills.zwk).toEqual(85);
			expect(data.currentTeam.squadPlayers[0].skills.dec).toEqual(85);
			expect(data.currentTeam.squadPlayers[0].skills.ges).toEqual(85);
			expect(data.currentTeam.squadPlayers[0].skills.fuq).toEqual(0);
			expect(data.currentTeam.squadPlayers[0].skills.erf).toEqual(78);
			expect(data.currentTeam.squadPlayers[0].skills.agg).toEqual(33);
			expect(data.currentTeam.squadPlayers[0].skills.pas).toEqual(60);
			expect(data.currentTeam.squadPlayers[0].skills.aus).toEqual(50);
			expect(data.currentTeam.squadPlayers[0].skills.ueb).toEqual(66);
			expect(data.currentTeam.squadPlayers[0].skills.wid).toEqual(28);
			expect(data.currentTeam.squadPlayers[0].skills.sel).toEqual(34);
			expect(data.currentTeam.squadPlayers[0].skills.dis).toEqual(3);
			expect(data.currentTeam.squadPlayers[0].skills.zuv).toEqual(80);
			expect(data.currentTeam.squadPlayers[0].skills.ein).toEqual(30);
			
			page.extend(doc, data);
			
			let slider = doc.querySelector('input[type=range]')
			slider.value += 19; // to test season interval
			slider.dispatchEvent(new Event('input'));
			slider.dispatchEvent(new Event('change'));

			done();
		});
	});
});
