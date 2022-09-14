describe('Page.MatchDayReport', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.MatchDayReport} */ let page;

	beforeEach(() => {
		data = new ExtensionData();
		page = new Page.MatchDayReport();
	});

	it('should extract all page data for current report', (done) => {

		data.nextZat = 31;
		data.nextZatSeason = 18;

		Fixture.getDocument('zar.php', doc => {

			page.extract(doc, data);

			let matchday = data.team.getMatchDay(18, 30);
			expect(matchday.stadiumIncome).toEqual(1665000);
			expect(matchday.stadiumCosts).toEqual(180000);
			expect(matchday.squadSalary).toEqual(4936279);
			expect(matchday.trainerSalary).toEqual(2407344);
			expect(matchday.loanCosts).toEqual(423088);
			expect(matchday.loanIncome).toEqual(215502);
			expect(matchday.youthSupport).toEqual(230000);
			expect(matchday.advertisingIncome).toEqual(747752);
			expect(matchday.merchandisingIncome).toEqual(654163);
			expect(matchday.physio).toEqual(20000);
			expect(matchday.winBonus).toEqual(200000);
			expect(matchday.cupPremium).toEqual(1000000);
			expect(matchday.intPremium).toEqual(1000000);
		
			expect(data.team.getSquadPlayer(105508).lastTraining).toBeUndefined();
			expect(data.team.getSquadPlayer(135694).lastTraining.successful).toBeTruthy();

			done();
		});
	});

	it('should extract income and costs only for older reports', (done) => {

		data.nextZat = 30;
		data.nextZatSeason = 18;

		Fixture.getDocument('zar.php', doc => {

			page.extract(doc, data);

			let matchday = data.team.getMatchDay(18, 30);
			expect(matchday.stadiumIncome).toEqual(1665000);
			expect(matchday.stadiumCosts).toEqual(180000);
			expect(matchday.squadSalary).toEqual(4936279);
			expect(matchday.trainerSalary).toEqual(2407344);
			expect(matchday.loanCosts).toEqual(423088);
			expect(matchday.loanIncome).toEqual(215502);
			expect(matchday.youthSupport).toEqual(230000);
			expect(matchday.advertisingIncome).toEqual(747752);
			expect(matchday.merchandisingIncome).toEqual(654163);
			expect(matchday.physio).toEqual(20000);
		
			expect(data.team.getSquadPlayer(105508).lastTraining).toBeUndefined();
			expect(data.team.getSquadPlayer(135694).lastTraining).toBeUndefined();

			done();
		});
	});

});
