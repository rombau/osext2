describe('Page.YouthSkills', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.YouthSkills} */ let page;
	
	beforeEach(() => {		
		data = new ExtensionData();
		page = new Page.YouthSkills();

		spyOn(Persistence, 'storeExtensionData').and.callFake(() => {
			return Promise.resolve();
		});
	});

	it('should extract team data and extend page', (done) => {

		data.nextZat = 53;
		data.nextZatSeason = 16;

		data.complete();

		Fixture.getDocument('ju.php?page=2', doc => {
			
			page.extract(doc, data);
					
			expect(data.team.youthPlayers.length).toEqual(21);
			expect(data.team.youthPlayers[0].skills.sch).toEqual(69);
			expect(data.team.youthPlayers[0].skills.bak).toEqual(30);
			expect(data.team.youthPlayers[0].skills.kob).toEqual(62);
			expect(data.team.youthPlayers[0].skills.zwk).toEqual(53);
			expect(data.team.youthPlayers[0].skills.dec).toEqual(30);
			expect(data.team.youthPlayers[0].skills.ges).toEqual(56);
			expect(data.team.youthPlayers[0].skills.fuq).toEqual(0);
			expect(data.team.youthPlayers[0].skills.erf).toEqual(0);
			expect(data.team.youthPlayers[0].skills.agg).toEqual(29);
			expect(data.team.youthPlayers[0].skills.pas).toEqual(24);
			expect(data.team.youthPlayers[0].skills.aus).toEqual(25);
			expect(data.team.youthPlayers[0].skills.ueb).toEqual(16);
			expect(data.team.youthPlayers[0].skills.wid).toEqual(95);
			expect(data.team.youthPlayers[0].skills.sel).toEqual(38);
			expect(data.team.youthPlayers[0].skills.dis).toEqual(76);
			expect(data.team.youthPlayers[0].skills.zuv).toEqual(26);
			expect(data.team.youthPlayers[0].skills.ein).toEqual(79);

			page.extend(doc, data);
		
			done();
		});
	});
});
