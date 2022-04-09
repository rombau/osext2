describe('Team', () => {

	/** @type {Team} */
	let team;
	
	beforeEach(() => {
		team = new Team();
	});

	it('should be created', () => {
		
		expect(team.id).toBeUndefined();
		expect(team.league.level).toBeUndefined();

		expect(team.squadPlayers.length).toEqual(0);
		expect(team.youthPlayers.length).toEqual(0);

	});

	it('should return requested squad player', () => {
		
		expect(team.getSquadPlayer()).toBeNull();
		expect(team.getSquadPlayer(1)).toBeDefined();
		expect(team.getSquadPlayer(1).id).toEqual(1);
		expect(team.getSquadPlayer(2)).toBe(team.getSquadPlayer(2));
	});

	it('should return requested youth player', () => {
		
		expect(team.getYouthPlayer(0)).toBeDefined();

		let p1 = team.getYouthPlayer(0);
		p1.pullId = 33;
		let p2 = team.getYouthPlayer(1);
		p2.pullId = 44;
		let p3 = team.getYouthPlayer(2);
		p3.pullId = 55;
		let p4 = team.getYouthPlayer(3); // no pull
		let p5 = team.getYouthPlayer(4); // no pull
		
		expect(team.getYouthPlayer(0, 33)).toBe(p1);
		expect(team.getYouthPlayer(1, 44)).toBe(p2);
		expect(team.getYouthPlayer(2, 55)).toBe(p3);
		expect(team.getYouthPlayer(3)).toBe(p4);
		expect(team.getYouthPlayer(4)).toBe(p5);

		// p1 pulled
		expect(team.getYouthPlayer(0, 44)).toBe(p2);
		expect(team.getYouthPlayer(1, 55)).toBe(p3);
		expect(team.getYouthPlayer(2)).toBe(p4);
		expect(team.getYouthPlayer(3)).toBe(p5);

		// p3 pulled, no more players to pull
		expect(team.getYouthPlayer(0, 44)).toBe(p2);
		expect(team.getYouthPlayer(1)).toBe(p4);
		expect(team.getYouthPlayer(2)).toBe(p5);

		// p4 can now be pulled
		expect(team.getYouthPlayer(0, 44)).toBe(p2);
		expect(team.getYouthPlayer(1, 66)).toBe(p4);
		expect(team.getYouthPlayer(2)).toBe(p5);
	});

	it('should return requested match day', () => {
		
		expect(team.getMatchDay()).toBeNull();
		expect(team.getMatchDay(5,34)).toBeDefined();
		expect(team.getMatchDay(5,34).zat).toEqual(34);
		expect(team.getMatchDay(5,34).season).toEqual(5);
		expect(team.getMatchDay(7,11)).toBe(team.getMatchDay(7,11));
	});

	it('should return requested trainer', () => {
		
		expect(team.getTrainer()).toBeNull();
		expect(team.getTrainer(1)).toBeDefined();
		expect(team.getTrainer(1).nr).toEqual(1);
		expect(team.getTrainer(2)).toBe(team.getTrainer(2));
	});

	it('should return forecast', () => {

		team.squadPlayers.push(new SquadPlayer());
		team.matchDays.push(new MatchDay(15,50));
		team.matchDays.push(new MatchDay(15,51));

		let lastMatchDay = new MatchDay(15,50);

		expect(team.getForecast(lastMatchDay, new MatchDay(15,50))).toBe(team);
		expect(team.getForecast(lastMatchDay, new MatchDay(15,51))).not.toBe(team);
		expect(team.getForecast(lastMatchDay, new MatchDay(15,51)).squadPlayers.length).toEqual(team.squadPlayers.length);
	});

	it('should return match days in range', () => {

		for (let zat = 1; zat < SEASON_MATCH_DAYS + 1; zat++) {
			let matchDay = new MatchDay(15, zat);
			switch (zat % 10) {
				case 1:
					matchDay.competition = Competition.LEAGUE;
					break;
				case 2:
					matchDay.competition = Competition.CUP;
					break;
				case 3:
					matchDay.competition = Competition.OSC;
					break;
				case 4:
					matchDay.competition = Competition.OSCQ;
					break;
				case 5:
					matchDay.competition = Competition.OSE;
					break;
				case 6:
					matchDay.competition = Competition.OSEQ;
					break;
				default:
					matchDay.competition = Competition.FRIENDLY;
					break;
			}
			team.matchDays.push(matchDay);
		}

		Options.forecastSeasons = 2;

		let matchDaysInRange = team.getMatchDaysInRange(new MatchDay(15,50), new MatchDay(16,40));

		expect(matchDaysInRange.length).toEqual(63);
		expect(matchDaysInRange.filter(matchDay => matchDay.competition === Competition.FRIENDLY).length).toEqual(41);
		expect(matchDaysInRange.filter(matchDay => matchDay.competition === Competition.LEAGUE).length).toEqual(7);
		expect(matchDaysInRange.filter(matchDay => matchDay.competition === Competition.CUP).length).toEqual(7);
		expect(matchDaysInRange.filter(matchDay => matchDay.competition === Competition.OSC).length).toEqual(2);
		expect(matchDaysInRange.filter(matchDay => matchDay.competition === Competition.OSCQ).length).toEqual(2);
		expect(matchDaysInRange.filter(matchDay => matchDay.competition === Competition.OSE).length).toEqual(2);
		expect(matchDaysInRange.filter(matchDay => matchDay.competition === Competition.OSEQ).length).toEqual(2);

	});

	it('should calculate youth support', () => {

		let matchDay = new MatchDay(15, 51);
		let viewSettings = {
			youthSupportPerDay : 1000,
		}
		for (let index = 0; index < 5; index++) {
			let player = new YouthPlayer();
			player.age = YOUTH_AGE_MIN;
			team.youthPlayers.push(player);
		}

		expect(team.calculateYouthSupport(matchDay, team.youthPlayers, viewSettings)).toEqual(-5000);

		team.youthPlayers[0].active = false;

		expect(team.calculateYouthSupport(matchDay, team.youthPlayers, viewSettings)).toEqual(-4000);

		team.youthPlayers[1].season = 13;
		team.youthPlayers[2].season = 14;
		team.youthPlayers[3].season = 15;
		team.youthPlayers[4].season = 16;

		viewSettings.youthSupportBarrierSeason = 15;
		viewSettings.youthSupportBarrierType = YouthSupportBarrierType.AND_OLDER;

		expect(team.calculateYouthSupport(matchDay, team.youthPlayers, viewSettings)).toEqual(-2500);

		viewSettings.youthSupportBarrierType = YouthSupportBarrierType.AND_YOUNGER;

		expect(team.calculateYouthSupport(matchDay, team.youthPlayers, viewSettings)).toEqual(-3000);

		team.youthPlayers[2].pullMatchDay = new MatchDay(15, 51);

		expect(team.calculateYouthSupport(matchDay, team.youthPlayers, viewSettings)).toEqual(-2000);
		expect(matchDay.youthSupport).toEqual(2000);
	});

	describe('should return squad salary', () => {

		/** @type {MatchDay} */
		let matchDay;

		beforeEach(() => {
			matchDay = new MatchDay(16, 1); // zat 1
		});

		it('with multiple squad players', () => {

			team.squadPlayers.push(new SquadPlayer());
			team.squadPlayers[0].salary = 10000;
			team.squadPlayers.push(new SquadPlayer());
			team.squadPlayers[1].salary = 20000;
			team.squadPlayers.push(new SquadPlayer());
			team.squadPlayers[2].salary = 30000;

			expect(team.calculateSquadSalary(matchDay, team.squadPlayers, team.youthPlayers)).toEqual(-60000);
			expect(matchDay.squadSalary).toEqual(60000);
		});

		it('with youth player pulled', () => {

			team.youthPlayers.push(new YouthPlayer());
			team.youthPlayers[0].pullMatchDay = new MatchDay(16, 1);
			team.youthPlayers[0].pullContractTerm = 72;
			team.youthPlayers[0].age = 18;
			team.youthPlayers[0].skills = {'sch': 19, 'bak': 33, 'kob': 25, 'zwk': 26, 'dec': 35, 'ges': 19, 'fuq': 0, 'erf': 0, 'agg': 23, 'pas': 34, 'aus': 25, 'ueb': 37, 'wid': 15, 'sel': 5, 'dis': 95, 'zuv': 21, 'ein': 29};
			team.youthPlayers[0].salary = 7702;

			expect(team.calculateSquadSalary(matchDay, team.squadPlayers, team.youthPlayers)).toEqual(-0);
			expect(matchDay.squadSalary).toEqual(0);

			matchDay.add(1); // zat 2

			expect(team.calculateSquadSalary(matchDay, team.squadPlayers, team.youthPlayers)).toEqual(-7702);
			expect(matchDay.squadSalary).toEqual(7702);
		});

		it('with player loaned from', () => {

			team.squadPlayers.push(new SquadPlayer());
			team.squadPlayers[0].salary = 10000;
			team.squadPlayers[0].loan = new SquadPlayer.Loan('from', 'to', 1);
			team.squadPlayers[0].loan.fee = -1;

			expect(team.calculateSquadSalary(matchDay, team.squadPlayers, team.youthPlayers)).toEqual(-10000);
			expect(matchDay.squadSalary).toEqual(10000);

			matchDay.add(1); // zat 2
			team.squadPlayers[0].loan.duration--; // 0
			team.squadPlayers[0].active = false;

			expect(team.calculateSquadSalary(matchDay, team.squadPlayers, team.youthPlayers)).toEqual(-10000);
			expect(matchDay.squadSalary).toEqual(10000);

			matchDay.add(1); // zat 3
			team.squadPlayers[0].loan = null;

			expect(team.calculateSquadSalary(matchDay, team.squadPlayers, team.youthPlayers)).toEqual(-0);
			expect(matchDay.squadSalary).toEqual(0);
		});

		it('with player loaned to', () => {

			team.squadPlayers.push(new SquadPlayer());
			team.squadPlayers[0].salary = 10000;
			team.squadPlayers[0].loan = new SquadPlayer.Loan('from', 'to', 1);
			team.squadPlayers[0].loan.fee = 1;

			expect(team.calculateSquadSalary(matchDay, team.squadPlayers, team.youthPlayers)).toEqual(-0);
			expect(matchDay.squadSalary).toEqual(0);

			matchDay.add(1); // zat 2
			team.squadPlayers[0].loan.duration--; // 0

			expect(team.calculateSquadSalary(matchDay, team.squadPlayers, team.youthPlayers)).toEqual(-0);
			expect(matchDay.squadSalary).toEqual(0);

			matchDay.add(1); // zat 3
			team.squadPlayers[0].loan = null;

			expect(team.calculateSquadSalary(matchDay, team.squadPlayers, team.youthPlayers)).toEqual(-10000);
			expect(matchDay.squadSalary).toEqual(10000);
		});

		it('with fast transfered player', () => {

			team.squadPlayers.push(new SquadPlayer());
			team.squadPlayers[0].salary = 10000;
			team.squadPlayers[0].fastTransferMatchDay = new MatchDay(16, 1);

			expect(team.calculateSquadSalary(matchDay, team.squadPlayers, team.youthPlayers)).toEqual(-10000);
			expect(matchDay.squadSalary).toEqual(10000);

			matchDay.add(1); // zat 2
			team.squadPlayers[0].active = false;

			expect(team.calculateSquadSalary(matchDay, team.squadPlayers, team.youthPlayers)).toEqual(-0);
			expect(matchDay.squadSalary).toEqual(0);
		});

		it('with defined players contract term extension', () => {

			team.squadPlayers.push(new SquadPlayer());
			team.squadPlayers[0].salary = 10000;
			team.squadPlayers[0].followUpSalary = {'24': 20000};
			team.squadPlayers[0].contractExtensionMatchDay = new MatchDay(16, 1);
			team.squadPlayers[0].contractExtensionTerm = 24;

			expect(team.calculateSquadSalary(matchDay, team.squadPlayers, team.youthPlayers)).toEqual(-10000);
			expect(matchDay.squadSalary).toEqual(10000);

			team.squadPlayers[0]._forecastContractAndSalary(team.squadPlayers[0], team.squadPlayers[0].contractExtensionMatchDay);
			matchDay.add(1); // zat 2

			expect(team.calculateSquadSalary(matchDay, team.squadPlayers, team.youthPlayers)).toEqual(-20000);
			expect(matchDay.squadSalary).toEqual(20000);
		});

		it('with automatic players contract term extension', () => {

			team.squadPlayers.push(new SquadPlayer());
			team.squadPlayers[0].salary = 10000;
			team.squadPlayers[0].contractTerm = 1;

			expect(team.calculateSquadSalary(matchDay, team.squadPlayers, team.youthPlayers)).toEqual(-10000);
			expect(matchDay.squadSalary).toEqual(10000);

			matchDay.add(1); // zat 2
			team.squadPlayers[0].contractTerm = 24;
			team.squadPlayers[0].salary = 20000;

			expect(team.calculateSquadSalary(matchDay, team.squadPlayers, team.youthPlayers)).toEqual(-20000);
			expect(matchDay.squadSalary).toEqual(20000);
		});

	});

	it('should return balanced match days', () => {

		Options.forecastSeasons = 1;

		let balancedMatchDays = team.getMatchDaysWithBalance(15, new MatchDay(15,3), {});

		expect(balancedMatchDays.length).toEqual(72);
	});
});
