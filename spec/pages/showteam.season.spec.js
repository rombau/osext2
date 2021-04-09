describe('ShowteamSeasonPage', () => {

	let data = new ExtensionData();
	let page = new ShowteamSeasonPage();
	
	beforeEach(() => {
		data = new ExtensionData();
		page = new ShowteamSeasonPage();
	});

	it('should extract match days', (done) => {

		Fixture.getDocument('showteam.php?s=6', doc => {
			
			page.extract(doc, data);
					
			expect(data.nextMatchDay.season).toEqual(10);
						
			expect(data.currentTeam.matchDays.length).toEqual(72);
			expect(data.currentTeam.matchDays[0].zat).toEqual(1);
			expect(data.currentTeam.matchDays[0].season).toEqual(10);
			expect(data.currentTeam.matchDays[0].competition).toEqual(Competition.FRIENDLY);
			expect(data.currentTeam.matchDays[0].location).toEqual(GameLocation.AWAY);
			expect(data.currentTeam.matchDays[0].result).toEqual('1 : 0');
			expect(data.currentTeam.matchDays[0].immutable).toBeTruthy();

			expect(data.currentTeam.matchDays[66].friendlyShare).toEqual(50);
			expect(data.currentTeam.matchDays[66].immutable).toBeFalsy()

			// TODO: assert opponent
			
			done();
		});
	});

	it('should not handle next match day if already done', () => {

		data.nextMatchDay.season = 5;
		data.nextMatchDay.zat = 12;
		data.nextMatchDay.immutable = true;

		let ok = page.handleNextMatchDay(data, 4);
				
		expect(ok).toBeTruthy();
		expect(data.nextMatchDay.season).toEqual(5);
		expect(data.nextMatchDay.zat).toEqual(12);
		expect(data.nextMatchDay.immutable).toBeTruthy();
	});

	it('should handle next match day regularly', () => {

		data.nextMatchDay.zat = 16;

		let ok = page.handleNextMatchDay(data, 10);
				
		expect(ok).toBeTruthy();
		expect(data.nextMatchDay.season).toEqual(10);
		expect(data.nextMatchDay.zat).toEqual(16);
		expect(data.nextMatchDay.immutable).toBeTruthy();
	});

	it('should handle next match day after season', () => {

		data.currentTeam.getMatchDay(10,1).result = '0 : 0';
		data.nextMatchDay.zat = 73;

		let ok = page.handleNextMatchDay(data, 10);
				
		expect(ok).toBeTruthy();
		expect(data.nextMatchDay.season).toEqual(11);
		expect(data.nextMatchDay.zat).toEqual(1);
		expect(data.nextMatchDay.immutable).toBeTruthy();
	});

	it('should handle next match day before season', () => {

		data.nextMatchDay.zat = 1;

		let ok = page.handleNextMatchDay(data, 10);
				
		expect(ok).toBeFalsy();
		expect(data.nextMatchDay.season).toEqual(10);
		expect(data.nextMatchDay.zat).toEqual(1);
		expect(data.nextMatchDay.immutable).toBeFalsy();
	});
});
