describe('Matchday', () => {

	/** @type {MatchDay} */ let matchDay;
	/** @type {Stadium} */ let stadium;
	/** @type {Team.League} */ let league;
	let settings;

	beforeEach(() => {
		matchDay = new MatchDay();
		stadium = new Stadium();
		stadium.coveredSeats = 50000;
		league = new Team.League();
		settings = {
			ticketPrice : {
				league : 20,
				cup : 30,
				international : 40
			},
			stadiumLoad : 100,
			leagueRanking : 1
		}
	});

	it('should be compared', () => {

		expect(new MatchDay(1, 1).equals(new MatchDay(1, 1))).toBeTruthy();
		expect(new MatchDay(1, 2).equals(new MatchDay(1, 1))).toBeFalsy();
		expect(new MatchDay(2, 1).equals(new MatchDay(1, 1))).toBeFalsy();
	});

	it('should be after macthday', () => {

		expect(new MatchDay(1, 2).after(new MatchDay(1, 1))).toBeTruthy();
		expect(new MatchDay(2, 1).after(new MatchDay(1, 72))).toBeTruthy();
		expect(new MatchDay(1, 1).after(new MatchDay(1, 1))).toBeFalsy();
		expect(new MatchDay(1, 1).after(new MatchDay(1, 2))).toBeFalsy();
	});

	it('should be before macthday', () => {

		expect(new MatchDay(1, 1).before(new MatchDay(1, 2))).toBeTruthy();
		expect(new MatchDay(1, 72).before(new MatchDay(2, 1))).toBeTruthy();
		expect(new MatchDay(1, 1).before(new MatchDay(1, 1))).toBeFalsy();
		expect(new MatchDay(1, 2).before(new MatchDay(1, 1))).toBeFalsy();
	});

	it('should return interval in days', () => {

		expect(new MatchDay(1, 1).intervalTo(new MatchDay(1, 1))).toEqual(0);
		expect(new MatchDay(1, 72).intervalTo(new MatchDay(2, 1))).toEqual(1);
		expect(new MatchDay(2, 1).intervalTo(new MatchDay(1, 72))).toEqual(1);
		expect(new MatchDay(1, 2).intervalTo(new MatchDay(1, 1))).toEqual(1);
		expect(new MatchDay(2, 1).intervalTo(new MatchDay(1, 1))).toEqual(72);
	});

	it('should be increased by days', () => {

		expect(new MatchDay(1, 1).add(1)).toEqual(new MatchDay(1, 2));
		expect(new MatchDay(1, 72).add(1)).toEqual(new MatchDay(2, 1));
	});

	it('should be calculate friendly income', () => {

		matchDay.competition = Competition.FRIENDLY;

		matchDay.friendlyShare = 50;
		expect(matchDay.calculateMatchDayIncome()).toEqual(250000);
		expect(matchDay.fiendlyIncome).toEqual(250000);

		matchDay.friendlyShare = 70;
		expect(matchDay.calculateMatchDayIncome()).toEqual(350000);
		expect(matchDay.fiendlyIncome).toEqual(350000);
	});

	it('should be calculate league income', () => {

		matchDay.competition = Competition.LEAGUE;
		expect(matchDay.calculateMatchDayIncome()).toEqual(250000);
		expect(matchDay.fiendlyIncome).toEqual(250000);

		matchDay.opponent = new Team();
		matchDay.location = GameLocation.AWAY;
		expect(matchDay.calculateMatchDayIncome()).toEqual(0);

		matchDay.location = GameLocation.HOME;
		expect(matchDay.calculateMatchDayIncome(stadium, settings)).toEqual(1250000);
		expect(matchDay.stadiumIncome).toEqual(1500000);
		expect(matchDay.stadiumCosts).toEqual(250000);
	});

	it('should be calculate cup income', () => {

		matchDay.competition = Competition.CUP;
		expect(matchDay.calculateMatchDayIncome()).toEqual(250000);
		expect(matchDay.fiendlyIncome).toEqual(250000);

		matchDay.opponent = new Team();
		expect(matchDay.calculateMatchDayIncome(stadium, settings)).toEqual(875000);
		expect(matchDay.stadiumIncome).toEqual(1000000);
		expect(matchDay.stadiumCosts).toEqual(125000);
	});

	it('should be calculate international income', () => {

		matchDay.competition = Competition.OSE;
		expect(matchDay.calculateMatchDayIncome()).toEqual(250000);
		expect(matchDay.fiendlyIncome).toEqual(250000);

		matchDay.opponent = new Team();
		matchDay.location = GameLocation.AWAY;
		expect(matchDay.calculateMatchDayIncome()).toEqual(0);

		matchDay.location = GameLocation.HOME;
		expect(matchDay.calculateMatchDayIncome(stadium, settings)).toEqual(2250000);
		expect(matchDay.stadiumIncome).toEqual(2500000);
		expect(matchDay.stadiumCosts).toEqual(250000);
	});

	it('should be calculate premium income', () => {

		expect(matchDay.calculatePremium()).toEqual(0);

		matchDay.competition = Competition.LEAGUE;
		expect(matchDay.calculatePremium()).toEqual(0);

		matchDay.location = GameLocation.HOME;
		league.level = 2;
		expect(matchDay.calculatePremium(league, settings)).toEqual(1191628);
		expect(matchDay.advertisingIncome).toEqual(635589);
		expect(matchDay.merchandisingIncome).toEqual(556039);

		league.level = 1;
		expect(matchDay.calculatePremium(league, settings)).toEqual(1401915);
		expect(matchDay.advertisingIncome).toEqual(747752);
		expect(matchDay.merchandisingIncome).toEqual(654163);

		settings.leagueRanking = 2;
		expect(matchDay.calculatePremium(league, settings)).toEqual(1377419);
		expect(matchDay.advertisingIncome).toEqual(733704);
		expect(matchDay.merchandisingIncome).toEqual(643715);

		matchDay.competition = Competition.FRIENDLY;
		matchDay.zat = 72;
		settings.leagueRanking =1;
		expect(matchDay.calculatePremium(league, settings)).toEqual(2803830);
		expect(matchDay.advertisingIncome).toEqual(1495504);
		expect(matchDay.merchandisingIncome).toEqual(1308326);
	});

});
