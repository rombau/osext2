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
	});
	
	it('should complete initialization', () => {

		player.complete(new MatchDay(14, 5));

		expect(player.ageExact).toEqual(19.73611111111111);
		expect(player.trainingFactor).toEqual(1.1612527977729297);

		player.complete(new MatchDay(14, 64));

		expect(player.ageExact).toEqual(19.555555555555557);
		expect(player.trainingFactor).toEqual(1.1451562706246994);
	});

	it('should return static forecast values', () => {

		expect(player.getForecast(new MatchDay(15,10), new MatchDay(15,10))).toBe(player);

		let forecastPlayer = player.getForecast(new MatchDay(15,10), new MatchDay(15,72));

		expect(forecastPlayer.moral).toBeUndefined();
		expect(forecastPlayer.fitness).toBeUndefined();
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
		expect(player.getForecast(new MatchDay(15, 65), new MatchDay(16, 3)).loan).toBeUndefined();

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

		expect(JSON.stringify(Object.values(player.skills)))
			.toEqual('[31,64,46,63,29,40,0,1,38,86,32,79,6,16,46,33,38]');

		forecastPlayer = player.getForecast(start, end);

		expect(forecastPlayer.age).toEqual(33);
		expect(JSON.stringify(Object.values(forecastPlayer.skills)))
			.toEqual('[29,62,43,59,27,35,0,1,33,83,30,79,5,15,46,31,36]');
		expect(skillSum - Object.values(forecastPlayer.skills).reduce((accu, curr) => accu + curr, 0)).toEqual(34);

		player.age = 33;

		forecastPlayer = player.getForecast(start, end);

		expect(forecastPlayer.age).toEqual(34);
		expect(JSON.stringify(Object.values(forecastPlayer.skills)))
			.toEqual('[28,61,42,57,26,32,0,1,31,82,29,79,5,14,46,30,34]');
		expect(skillSum - Object.values(forecastPlayer.skills).reduce((accu, curr) => accu + curr, 0)).toEqual(51);

		player.age = 34;

		forecastPlayer = player.getForecast(start, end);

		expect(forecastPlayer.age).toEqual(35);
		expect(JSON.stringify(Object.values(forecastPlayer.skills)))
			.toEqual('[27,60,40,55,25,30,0,1,28,81,28,79,4,14,46,29,33]');
		expect(skillSum - Object.values(forecastPlayer.skills).reduce((accu, curr) => accu + curr, 0)).toEqual(68);

		player.age = 35;
		player.skills.ges = 0;
		skillSum = Object.values(player.skills).reduce((accu, curr) => accu + curr, 0);

		forecastPlayer = player.getForecast(start, end);

		expect(forecastPlayer.age).toEqual(36);
		expect(JSON.stringify(Object.values(forecastPlayer.skills)))
			.toEqual('[25,58,37,51,24,0,0,1,23,78,26,79,4,13,46,27,31]');
		expect(skillSum - Object.values(forecastPlayer.skills).reduce((accu, curr) => accu + curr, 0)).toEqual(85);
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
});
