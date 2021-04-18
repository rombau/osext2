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
					'contractTerm': 19
				},
				'skill': 'ueb',
				'chance': 23.39
			},
			'lastTraining': {
				'matchBonus': 1,
				'trainer': {
					'nr': 2,
					'salary': 507957,
					'contractTerm': 19
				},
				'skill': 'ueb',
				'chance': 23.39
			}
		});
	});
	
	it('should return static forecast values', () => {

		expect(player.getForecast(new MatchDay(15,10), new MatchDay(15,10))).toBe(player);

		let forecastPlayer = player.getForecast(new MatchDay(15,10), new MatchDay(15,72));

		expect(forecastPlayer.moral).toBeUndefined();
		expect(forecastPlayer.fitness).toBeUndefined();
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
	});


	
});
