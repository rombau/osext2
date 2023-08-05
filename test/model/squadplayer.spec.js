describe('SquadPlayer', () => {

	/** @type {SquadPlayer} */
	let player;

	beforeEach(() => {
		player = Object.assign(new SquadPlayer(), {
			'skills': {
				'sch': 31,
				'bak': 64,
				'kob': 46,
				'zwk': 63,
				'dec': 29,
				'ges': 40,
				'fuq': 0,
				'erf': 1,
				'agg': 38,
				'pas': 86,
				'aus': 32,
				'ueb': 79,
				'wid': 6,
				'sel': 16,
				'dis': 46,
				'zuv': 33,
				'ein': 38
			},
			'bans': [],
			'id': 139948,
			'nr': 22,
			'name': 'Ramiro Kopingo',
			'age': 19,
			'pos': 'DMI',
			'countryCode': 'GUA',
			'countryName': 'Guatemala',
			'uefa': false,
			'moral': 79,
			'fitness': 75,
			'injured': 0,
			'transferState': 'N',
			'transferLock': 10,
			'birthday': 24,
			'contractTerm': 67,
			'salary': 34040,
			'marketValue': 5916727,
			'nextTraining': {
				'matchBonus': 1,
				'trainer': {
					'nr': 2,
					'salary': 507957,
					'contractTerm': 19,
					'legacySkill': 99,
					'upToSkill': 99
				},
				'skill': 'ueb'
			},
			'lastTraining': {
				'matchBonus': 1,
				'trainer': {
					'nr': 2,
					'salary': 507957,
					'contractTerm': 19,
					'legacySkill': 99,
					'upToSkill': 99
				},
				'skill': 'ueb'
			}
		});

		jasmine.addMatchers({
			toEqualSkillValues: () => {
				return {
					compare: function(actualSkills, expectedValues) {
						let result = { pass: true, error: undefined };
						let message = {};
						Object.entries(actualSkills).forEach(([key, value], index) => {
							if (value != expectedValues[index]) {
								message[key] = `Expected ${value} to equal ${expectedValues[index]}`;
								result.pass = false;
							}
						});
						if (!result.pass) {
							result.message = 'Skills not matching\n' + JSON.stringify(message, undefined, 2);
						}
						return result;
					}
				};
			}
		});
	});

	it('should complete initialization', () => {

		player.complete(new MatchDay(14, 5));

		expect(player.ageExact).toEqual(19.73611111111111);
		expect(player.trainingFactor).toEqual(1.1612527977729297);

		player.complete(new MatchDay(14, 64));

		expect(player.ageExact).toEqual(19.555555555555557);
		expect(player.trainingFactor).toEqual(1.1451562706246994);

		player.fastTransferMatchDay = new MatchDay(14, 65);
		player.contractExtensionMatchDay = new MatchDay(14, 65);
		player.contractExtensionTerm = 24;

		player.complete(new MatchDay(14, 66));

		expect(player.fastTransferMatchDay).toBeNull();
		expect(player.contractExtensionMatchDay).toBeNull();
		expect(player.contractExtensionTerm).toBeNull();
	});

	it('should return static forecast values', () => {

		expect(player.getForecast(new MatchDay(15,10), new MatchDay(15,10))).toBe(player);

		let forecastPlayer = player.getForecast(new MatchDay(15,10), new MatchDay(15,72));

		expect(forecastPlayer.moral).toBeNull();
		expect(forecastPlayer.fitness).toBeNull();
	});

	it('should return salary', () => {

		player.complete(new MatchDay(14, 5));

		expect(player.getSalary(24)).toEqual(43721);

	});

	it('should return age forecast', () => {

		player.age = 19;
		player.birthday = 24;

		expect(player.getForecast(new MatchDay(15, 10), new MatchDay(15, 72)).age).toEqual(20);
		expect(player.getForecast(new MatchDay(15, 10), new MatchDay(16, 72)).age).toEqual(21);
	});

	it('should return injury forecast', () => {

		player.injured = 19;

		expect(player.getForecast(new MatchDay(15, 65), new MatchDay(16, 2)).injured).toEqual(1);
		expect(player.getForecast(new MatchDay(15, 65), new MatchDay(16, 3)).injured).toEqual(0);
	});

	it('should return transfer lock forecast', () => {

		player.transferLock = 19;

		expect(player.getForecast(new MatchDay(15, 65), new MatchDay(16, 11)).transferLock).toEqual(1);
		expect(player.getForecast(new MatchDay(15, 65), new MatchDay(16, 12)).transferLock).toEqual(0);
	});

	it('should return loan forecast', () => {

		expect(player.getForecast(new MatchDay(15, 65), new MatchDay(16, 11)).loan).toBeUndefined();

		player.loan = new SquadPlayer.Loan('Team1', 'Team2', 10);

		expect(player.getForecast(new MatchDay(15, 65), new MatchDay(16, 2)).loan.duration).toEqual(1);
		expect(player.getForecast(new MatchDay(15, 65), new MatchDay(16, 3)).loan.duration).toEqual(0);
		expect(player.getForecast(new MatchDay(15, 65), new MatchDay(16, 4)).loan).toBeNull();

		player.loan.fee = -100000; // lend from other team

		expect(player.getForecast(new MatchDay(15, 65), new MatchDay(16, 3)).active).toBeFalsy();

		player.loan.fee = 100000; // lend to other team

		expect(player.getForecast(new MatchDay(15, 65), new MatchDay(16, 3)).active).toBeTruthy();
	});

	it('should return ban forecast', () => {

		player.bans.push(new SquadPlayer.Ban(BanType.LEAGUE, 3));
		player.bans.push(new SquadPlayer.Ban(BanType.CUP, 2));
		player.bans.push(new SquadPlayer.Ban(BanType.INTERNATIONAL, 1));

		let matchDayInRange = [];
		let forecastPlayer;

		forecastPlayer = player.getForecast(new MatchDay(15, 1), new MatchDay(15, 72), matchDayInRange);
		expect(forecastPlayer.bans[0].duration).toEqual(3);
		expect(forecastPlayer.bans[1].duration).toEqual(2);
		expect(forecastPlayer.bans[2].duration).toEqual(1);

		const createMatchDay = (season, zat, competition) => {
			let matchDay = new MatchDay(season, zat);
			matchDay.competition = competition;
			return matchDay;
		};

		matchDayInRange.push(createMatchDay(15, 2, Competition.LEAGUE));

		forecastPlayer = player.getForecast(new MatchDay(15, 1), new MatchDay(15, 72), matchDayInRange);
		expect(forecastPlayer.bans.length).toEqual(3);
		expect(forecastPlayer.bans[0].duration).toEqual(2);
		expect(forecastPlayer.bans[1].duration).toEqual(2);
		expect(forecastPlayer.bans[2].duration).toEqual(1);

		matchDayInRange.push(createMatchDay(15, 39, Competition.CUP));

		forecastPlayer = player.getForecast(new MatchDay(15, 1), new MatchDay(15, 72), matchDayInRange);
		expect(forecastPlayer.bans.length).toEqual(3);
		expect(forecastPlayer.bans[0].duration).toEqual(2);
		expect(forecastPlayer.bans[1].duration).toEqual(1);
		expect(forecastPlayer.bans[2].duration).toEqual(1);

		matchDayInRange.push(createMatchDay(15, 23, Competition.OSE));

		forecastPlayer = player.getForecast(new MatchDay(15, 1), new MatchDay(15, 72), matchDayInRange);
		expect(forecastPlayer.bans.length).toEqual(2);
		expect(forecastPlayer.bans[0].duration).toEqual(2);
		expect(forecastPlayer.bans[1].duration).toEqual(1);

		matchDayInRange.push(createMatchDay(15, 4, Competition.LEAGUE));
		matchDayInRange.push(createMatchDay(15, 6, Competition.LEAGUE));
		matchDayInRange.push(createMatchDay(15, 51, Competition.CUP));

		forecastPlayer = player.getForecast(new MatchDay(15, 1), new MatchDay(15, 72), matchDayInRange);
		expect(forecastPlayer.bans.length).toEqual(0);
	});

	it('should return skill forecast based on training', () => {

		let start = new MatchDay(15, 1);
		let end = new MatchDay(15, 72);
		let forecastPlayer;

		player.lastTraining.trainer.legacySkill = 99;
		player.nextTraining.trainer.legacySkill = 99;

		Options.primarySkillTrainingLimit = 85;
		Options.ageTrainingLimit = 19;

		// one skill and one trainer
		player.skills.ueb = 79;
		player.skills.bak = 64;
		player.lastTraining.skill = Skill.UEB;
		player.nextTraining.skill = Skill.UEB;

		forecastPlayer = player.getForecast(start, end);

		expect(forecastPlayer.skills.ueb).toEqual(84);
		expect(forecastPlayer.skills.bak).toEqual(78);

		// two skills and one trainer
		player.skills.ueb = 79;
		player.skills.bak = 64;
		player.skills.pas = 86;
		player.lastTraining.skill = Skill.PAS;
		player.nextTraining.skill = Skill.UEB;

		forecastPlayer = player.getForecast(start, end);

		expect(forecastPlayer.skills.ueb).toEqual(84);
		expect(forecastPlayer.skills.bak).toEqual(68);
		expect(forecastPlayer.skills.pas).toEqual(90);

		// two skills and two trainers
		player.skills.ueb = 79;
		player.skills.bak = 64;
		player.skills.pas = 86;
		player.lastTraining.skill = Skill.PAS;
		player.nextTraining.skill = Skill.UEB;
		player.lastTraining.trainer.legacySkill = 80;

		forecastPlayer = player.getForecast(start, end);

		expect(forecastPlayer.skills.ueb).toEqual(84);
		expect(forecastPlayer.skills.bak).toEqual(68);
		expect(forecastPlayer.skills.pas).toEqual(87);

		// one skill and one trainer reaching limit twice
		player.skills.ueb = 79;
		player.skills.bak = 64;
		player.lastTraining.skill = Skill.UEB;
		player.nextTraining.skill = Skill.UEB;
		player.lastTraining.trainer.legacySkill = 99;

		Options.primarySkillTrainingLimit = 80;

		forecastPlayer = player.getForecast(start, end);

		expect(forecastPlayer.skills.ueb).toEqual(80);
		expect(forecastPlayer.skills.bak).toEqual(79);
		expect(forecastPlayer.skills.dec).toEqual(49);

		// one skill and one trainer different age for trainings limit
		Options.ageTrainingLimit = 25;
		Options.primarySkillTrainingLimit = 85;

		player.skills.ueb = 79;
		player.skills.bak = 64;
		player.lastTraining.skill = Skill.UEB;
		player.nextTraining.skill = Skill.UEB;

		forecastPlayer = player.getForecast(start, end);

		expect(forecastPlayer.skills.ueb).toEqual(89);
		expect(forecastPlayer.skills.bak).toEqual(64);
	});

	it('should return skill forecast based on aging', () => {

		let start = new MatchDay(15, 23);
		let end = new MatchDay(15, 24);
		let forecastPlayer;
		let skillSum = Object.values(player.skills).reduce((accu, curr) => accu + curr, 0);

		player.age = 32;

		expect(player.skills).toEqualSkillValues([31,64,46,63,29,40,0,1,38,86,32,79,6,16,46,33,38]);

		forecastPlayer = player.getForecast(start, end);

		expect(forecastPlayer.age).toEqual(33);
		expect(forecastPlayer.skills).toEqualSkillValues([29,62,43,60,27,35,0,1,33,84,30,79,4,14,46,31,36]);
		expect(skillSum - Object.values(forecastPlayer.skills).reduce((accu, curr) => accu + curr, 0)).toEqual(34);

		player.age = 33;

		forecastPlayer = player.getForecast(start, end);

		expect(forecastPlayer.age).toEqual(34);
		expect(forecastPlayer.skills).toEqualSkillValues([28,62,42,58,26,32,0,1,31,83,29,79,3,14,46,29,34]);
		expect(skillSum - Object.values(forecastPlayer.skills).reduce((accu, curr) => accu + curr, 0)).toEqual(51);

		player.age = 34;

		forecastPlayer = player.getForecast(start, end);

		expect(forecastPlayer.age).toEqual(35);
		expect(forecastPlayer.skills).toEqualSkillValues([27,61,41,57,25,30,0,1,28,82,27,79,2,13,46,28,33]);
		expect(skillSum - Object.values(forecastPlayer.skills).reduce((accu, curr) => accu + curr, 0)).toEqual(68);

		player.age = 35;
		skillSum = Object.values(player.skills).reduce((accu, curr) => accu + curr, 0);

		forecastPlayer = player.getForecast(start, end);

		expect(forecastPlayer.age).toEqual(36);
		expect(forecastPlayer.skills).toEqualSkillValues([26,60,39,55,24,28,0,1,26,81,26,79,1,12,46,27,32]);
		expect(skillSum - Object.values(forecastPlayer.skills).reduce((accu, curr) => accu + curr, 0)).toEqual(85);
	});

	it('should return skill forecast based on aging for Agron Devolli', () => {

		let start = new MatchDay(19, 65);
		let end = new MatchDay(19, 66);
		let forecastPlayer;

		player.age = 32;
		player.birthday = 66;
		player.skills.sch = 97;
		player.skills.bak = 87;
		player.skills.kob = 88;
		player.skills.zwk = 89;
		player.skills.dec = 38;
		player.skills.ges = 88;
		player.skills.fuq = 8;
		player.skills.erf = 99;
		player.skills.agg = 55;
		player.skills.pas = 41;
		player.skills.aus = 60;
		player.skills.ueb = 80;
		player.skills.wid = 9;
		player.skills.sel = 4;
		player.skills.dis = 27;
		player.skills.zuv = 66;
		player.skills.ein = 45;
						
		let skillSum = Object.values(player.skills).reduce((accu, curr) => accu + curr, 0);

		forecastPlayer = player.getForecast(start, end);

		expect(forecastPlayer.skills).toEqualSkillValues([94,86,85,86,36,82,8,99,50,40,58,80,7,3,27,63,43]);
		expect(skillSum - Object.values(forecastPlayer.skills).reduce((accu, curr) => accu + curr, 0)).toEqual(34);
	});

	it('should return fast transfer value', () => {

		player.age = player.ageExact = 19;

		expect(player.getFastTransferValue()).toEqual(1763937);

		player.age = player.ageExact = 25;

		expect(player.getFastTransferValue()).toEqual(240831);

		player.age = player.ageExact = 33;

		expect(player.getFastTransferValue()).toEqual(0);

		player.contractTerm = 1;

		expect(player.getFastTransferValue()).toEqual(1519080);
	});

	it('should return contract term and salary forecast', () => {

		let start = new MatchDay(15, 65);
		let end = new MatchDay(16, 11);
		let forecastPlayer;

		player.contractTerm = 67;
		player.salary = 10000;

		forecastPlayer = player.getForecast(start, end);

		expect(forecastPlayer.contractTerm).toEqual(64);
		expect(forecastPlayer.salary).toEqual(10000);

		player.contractTerm = 1;
		player.salary = 10000;
		player.followUpSalary['24'] = 20000;
		Options.followUpContractTerm = 24;

		forecastPlayer = player.getForecast(start, end);

		expect(forecastPlayer.contractTerm).toEqual(22);
		expect(forecastPlayer.salary).toEqual(20000);
	});

	it('should return training chance with bonus', () => {

		expect(player.nextTraining.getChanceWithBonus()).toEqual(0);

		player.nextTraining.chance = 75.5;

		expect(player.nextTraining.getChanceWithBonus()).toEqual(75.5);

		player.nextTraining.matchBonus = 1.35;

		expect(player.nextTraining.getChanceWithBonus()).toEqual(99);
	});

	it('should return potential', () => {

		let potentialPlayer = new SquadPlayer();
		potentialPlayer.skills = {
			'sch': 21,
			'bak': 26,
			'kob': 85,
			'zwk': 87,
			'dec': 85,
			'ges': 37,
			'fuq': 0,
			'erf': 17,
			'agg': 33,
			'pas': 35,
			'aus': 31,
			'ueb': 35,
			'wid': 56,
			'sel': 1,
			'dis': 36,
			'zuv': 71,
			'ein': 78
		};
		potentialPlayer.pos = Position.ABW;
		potentialPlayer.age = 21;
		potentialPlayer.ageExact = 21.84722222222222;

		expect(potentialPlayer.getPotential()).toEqual(513);

	});
});
