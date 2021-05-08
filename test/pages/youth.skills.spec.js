describe('YouthSkillsPage', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {YouthSkillsPage} */ let page;
	
	beforeEach(() => {		
		// for automatic regististration on new page
		spyOn(Persistence, 'updateCachedData').and.callFake((modifyData) => {
			modifyData(data);
			return Promise.resolve(data);
		});
		
		data = new ExtensionData();
		page = new YouthSkillsPage();
	});

	it('should extract team data and extend page', (done) => {

		data.nextZat = 53;
		data.nextZatSeason = 16;

		Fixture.getDocument('ju.php?page=2', doc => {
			
			page.extract(doc, data);
					
			expect(data.currentTeam.youthPlayers.length).toEqual(21);
			expect(data.currentTeam.youthPlayers[0].skills.sch).toEqual(69);
			expect(data.currentTeam.youthPlayers[0].skills.bak).toEqual(30);
			expect(data.currentTeam.youthPlayers[0].skills.kob).toEqual(62);
			expect(data.currentTeam.youthPlayers[0].skills.zwk).toEqual(53);
			expect(data.currentTeam.youthPlayers[0].skills.dec).toEqual(30);
			expect(data.currentTeam.youthPlayers[0].skills.ges).toEqual(56);
			expect(data.currentTeam.youthPlayers[0].skills.fuq).toEqual(0);
			expect(data.currentTeam.youthPlayers[0].skills.erf).toEqual(0);
			expect(data.currentTeam.youthPlayers[0].skills.agg).toEqual(29);
			expect(data.currentTeam.youthPlayers[0].skills.pas).toEqual(24);
			expect(data.currentTeam.youthPlayers[0].skills.aus).toEqual(25);
			expect(data.currentTeam.youthPlayers[0].skills.ueb).toEqual(16);
			expect(data.currentTeam.youthPlayers[0].skills.wid).toEqual(95);
			expect(data.currentTeam.youthPlayers[0].skills.sel).toEqual(38);
			expect(data.currentTeam.youthPlayers[0].skills.dis).toEqual(76);
			expect(data.currentTeam.youthPlayers[0].skills.zuv).toEqual(26);
			expect(data.currentTeam.youthPlayers[0].skills.ein).toEqual(79);

			page.extend(doc, data);
		
			done();
		});
	});
});
