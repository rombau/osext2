describe('Page showteam skills', () => {

	let data;
	
	beforeEach(() => {
		data = {};
	});

	it('should extract team data and extend page', (done) => {

		Fixture.getDocument('showteam.php?s=2', doc => {
			
			Page.ShowteamSkills.extract(doc, data);
						
			expect(data.team.squadPlayers.length).toEqual(32);
			expect(data.team.squadPlayers[0].skills).toEqual({sch:58, bak:80, kob: 85, zwk: 85, dec: 85, ges: 85, fuq: 0, erf: 78, agg: 33, pas: 60, aus: 50, ueb: 66, wid: 28, sel: 34, dis: 3, zuv: 80, ein: 30});
			
			Page.ShowteamSkills.extend(doc, data);
			
			done();
		});
	});
});
