describe('Team', () => {

	/** @type {Team} */
	let team;

	/**
	 * Creates a youth player.
	 * 
	 * @param {Number} season 
	 * @param {Number} birthday 
	 * @param {String} countryCode 
	 * @param {Talent} talent 
	 * @param {Number} wid 
	 * @param {Number} sel 
	 * @param {Number} dis 
	 * @param {Number} ein 
	 * @param {String} data 
	 * @returns 
	 */
	let createYouthPlayer = (season, birthday, countryCode, talent, wid, sel, dis, ein, data) => {
		let player = new YouthPlayer();
		player.season = season;
		player.birthday = birthday;
		player.countryCode = countryCode;
		player.talent = talent;
		player.skills.wid = wid;
		player.skills.sel = sel;
		player.skills.dis = dis;
		player.skills.ein = ein;
		player.data = data;
		return player;
	}

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

	describe('should sync youth players', () => {

		it('with new one', () => {

			team.pageYouthPlayers.push(createYouthPlayer(11, 24, 'CYP', Talent.NORMAL, 11, 22, 33, 44));

			team.syncYouthPlayers();

			expect(team.youthPlayers.length).toEqual(1);
			expect(team.youthPlayers[0].getFingerPrint()).toEqual('CYP01124normal11223344');
			expect(team.youthPlayers[0].data).toBeUndefined();
		});

		it('with scouted one', () => {

			team.youthPlayers.push(createYouthPlayer(11, 6, 'FIN', Talent.NORMAL, 12, 23, 34, 45, 'data1'));
			team.youthPlayers.push(createYouthPlayer(11, 24, 'CYP', Talent.NORMAL, 11, 22, 33, 44, 'data2'));

			team.pageYouthPlayers.push(createYouthPlayer(11, 6, 'FIN', Talent.NORMAL, 12, 23, 34, 45));
			team.pageYouthPlayers.push(createYouthPlayer(11, 6, 'FIN', Talent.NORMAL, 0, 23, 34, 45));
			team.pageYouthPlayers.push(createYouthPlayer(11, 24, 'CYP', Talent.NORMAL, 11, 22, 33, 44));

			team.syncYouthPlayers();

			expect(team.youthPlayers.length).toEqual(3);
			expect(team.youthPlayers[0].getFingerPrint()).toEqual('FIN01106normal12233445');
			expect(team.youthPlayers[0].data).toEqual('data1');
			expect(team.youthPlayers[1].getFingerPrint()).toEqual('FIN01106normal00233445');
			expect(team.youthPlayers[1].data).toBeUndefined();
			expect(team.youthPlayers[2].getFingerPrint()).toEqual('CYP01124normal11223344');
			expect(team.youthPlayers[2].data).toEqual('data2');
		});

		it('with existing one', () => {

			team.youthPlayers.push(createYouthPlayer(11, 24, 'CYP', Talent.NORMAL, 11, 22, 33, 44, 'data'));

			team.pageYouthPlayers.push(createYouthPlayer(11, 24, 'CYP', Talent.NORMAL, 11, 22, 33, 44));

			team.syncYouthPlayers();

			expect(team.youthPlayers.length).toEqual(1);
			expect(team.youthPlayers[0].getFingerPrint()).toEqual('CYP01124normal11223344');
			expect(team.youthPlayers[0].data).toEqual('data');
		});

		it('with removed one', () => {

			team.youthPlayers.push(createYouthPlayer(11, 6, 'FIN', Talent.NORMAL, 12, 23, 34, 45, 'data1'));
			team.youthPlayers.push(createYouthPlayer(11, 24, 'CYP', Talent.NORMAL, 11, 22, 33, 44, 'data2'));

			team.pageYouthPlayers.push(createYouthPlayer(11, 24, 'CYP', Talent.NORMAL, 11, 22, 33, 44));

			team.syncYouthPlayers();

			expect(team.youthPlayers.length).toEqual(1);
			expect(team.youthPlayers[0].getFingerPrint()).toEqual('CYP01124normal11223344');
			expect(team.youthPlayers[0].data).toEqual('data2');
		});
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
				case 7:
					matchDay.competition = Competition.FRIENDLY;
					matchDay.friendlyShare = 70;
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

		expect(matchDaysInRange[7].friendlyShare).toEqual(70);
		expect(matchDaysInRange[8].friendlyShare).toBeUndefined();

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

		expect(team.calculateYouthSupport(matchDay, team.youthPlayers, viewSettings)).toEqual(-3000);
		expect(matchDay.youthSupport).toEqual(3000);

		team.youthPlayers[2].pullMatchDay = new MatchDay(15, 50);

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

	it('should return loan income and costs', () => {

		let matchDay = new MatchDay(16, 1); // zat 1

		team.squadPlayers.push(new SquadPlayer());
		team.squadPlayers[0].loan = new SquadPlayer.Loan('from', 'to', 1);
		team.squadPlayers[0].loan.fee = 20000;
		team.squadPlayers.push(new SquadPlayer());
		team.squadPlayers[1].loan = new SquadPlayer.Loan('from', 'to', 2);
		team.squadPlayers[1].loan.fee = -10000;

		expect(team.calculateLoan(matchDay, team.squadPlayers)).toEqual(10000);
		expect(matchDay.loanIncome).toEqual(20000);
		expect(matchDay.loanCosts).toEqual(10000);

		team.squadPlayers[0].loan.duration = 0;

		expect(team.calculateLoan(matchDay, team.squadPlayers)).toEqual(10000);
		expect(matchDay.loanIncome).toEqual(20000);
		expect(matchDay.loanCosts).toEqual(10000);

		team.squadPlayers[0].loan = null;

		expect(team.calculateLoan(matchDay, team.squadPlayers)).toEqual(-10000);
		expect(matchDay.loanIncome).toEqual(0);
		expect(matchDay.loanCosts).toEqual(10000);

		team.squadPlayers[1].loan = null;

		expect(team.calculateLoan(matchDay, team.squadPlayers)).toEqual(0);
		expect(matchDay.loanIncome).toEqual(0);
		expect(matchDay.loanCosts).toEqual(0);
	});

	it('should return trainer salary', () => {

		let matchDay = new MatchDay(16, 1); // zat 1

		team.trainers.push(new Team.Trainer());
		team.trainers[0].salary = 10000;
		team.trainers.push(new Team.Trainer());
		team.trainers[1].salary = 10000;

		expect(team.calculateTrainerSalary(matchDay, team.trainers)).toEqual(-20000);
		expect(matchDay.trainerSalary).toEqual(20000);
	});

	it('should return fast transfer income', () => {

		let matchDay = new MatchDay(16, 1); // zat 1

		team.squadPlayers.push(new SquadPlayer());
		team.squadPlayers[0].pos = Position.TOR;
		team.squadPlayers[0].ageExact = 32.958333333;
		Object.keys(team.squadPlayers[0].skills).forEach((skillname, s) => {
			team.squadPlayers[0].skills[skillname] = [18,64,86,85,84,84,0,26,14,29,19,24,46,44,82,29,53][s];
		});
		team.squadPlayers[0].contractTerm = 1;
		team.squadPlayers[0].salary = 100000;
		team.squadPlayers[0].fastTransferMatchDay = new MatchDay(16, 2);

		expect(team.calculateFastTransferIncome(matchDay, team.squadPlayers)).toEqual(0);
		expect(matchDay.fastTransferIncome).toEqual(0);

		matchDay.add(1);

		expect(team.calculateFastTransferIncome(matchDay, team.squadPlayers)).toEqual(4057261);
		expect(matchDay.fastTransferIncome).toEqual(4057261);
	});

	it('should not return physio costs for awarded players', () => {

		let matchDay = new MatchDay(16, 1); // zat 1

		team.squadPlayers.push(new SquadPlayer());
		team.squadPlayers[0].injuredBefore = 3;
		team.squadPlayers[0].injured = 1;
		team.squadPlayers[0].loan = new SquadPlayer.Loan();
		team.squadPlayers[0].loan.fee = 123456;

		expect(team.calculatePhysioCosts(matchDay, team.squadPlayers)).toEqual(-0);
		expect(matchDay.physio).toEqual(0);
	});

	it('should return physio costs', () => {

		let matchDay = new MatchDay(16, 1); // zat 1

		team.squadPlayers.push(new SquadPlayer());
		team.squadPlayers[0].injuredBefore = 3;
		team.squadPlayers[0].injured = 1;

		expect(team.calculatePhysioCosts(matchDay, team.squadPlayers)).toEqual(-10000);
		expect(matchDay.physio).toEqual(10000);

		team.squadPlayers[0].injuredBefore = 2;
		team.squadPlayers[0].injured = 0;

		expect(team.calculatePhysioCosts(matchDay, team.squadPlayers)).toEqual(-10000);
		expect(matchDay.physio).toEqual(10000);

		team.squadPlayers[0].injuredBefore = 1;
		team.squadPlayers[0].injured = 0;

		expect(team.calculatePhysioCosts(matchDay, team.squadPlayers)).toEqual(-0);
		expect(matchDay.physio).toEqual(0);
	});

	it('should return additional physio costs', () => {

		let matchDay = new MatchDay(16, 1); // zat 1

		team.squadPlayers.push(new SquadPlayer());
		team.squadPlayers[0].injuredBefore = 3;
		team.squadPlayers[0].injured = 1;
		team.squadPlayers[0].physioCosts = 10000;

		team.squadPlayers.push(new SquadPlayer());
		team.squadPlayers[1].physioCosts = 27000;

		expect(team.calculatePhysioCosts(matchDay, team.squadPlayers)).toEqual(-37000);
		expect(matchDay.physio).toEqual(37000);
	});

	it('should return balanced match days', () => {

		for (let zat = 2; zat < SEASON_MATCH_DAYS; zat += 2) {
			let matchDay = new MatchDay(15, zat);
			matchDay.competition = Competition.LEAGUE;			
			team.matchDays.push(matchDay);
		}

		let viewSettings = { leagueRanking : 1 };
		team.league.size = 10;
		Options.forecastSeasons = 1;

		let balancedMatchDays = team.getMatchDaysWithBalance(15, new MatchDay(15,3), viewSettings);

		expect(balancedMatchDays.length).toEqual(72);
	});


	it('should return win bonus per league match day', () => {

		for (let zat = 2; zat < SEASON_MATCH_DAYS; zat += 2) {
			let matchDay = new MatchDay(15, zat);
			matchDay.competition = Competition.LEAGUE;			
			team.matchDays.push(matchDay);
		}

		expect(team.calculateWinBonusPerLeagueMatchDay(1, 10)).toEqual(161143);
		expect(team.calculateWinBonusPerLeagueMatchDay(10, 10)).toEqual(35429);
		expect(team.calculateWinBonusPerLeagueMatchDay(1, 18)).toEqual(154857);
		expect(team.calculateWinBonusPerLeagueMatchDay(10, 18)).toEqual(98286);
		expect(team.calculateWinBonusPerLeagueMatchDay(1, 20)).toEqual(165143);
		expect(team.calculateWinBonusPerLeagueMatchDay(10, 20)).toEqual(114857);

	});
});
