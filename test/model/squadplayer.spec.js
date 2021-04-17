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

	describe('Ban', () => {

		/** @type {SquadPlayer.Ban} */
		let ban;

		it('should be initialized by text', () => {
			
			ban = new SquadPlayer.Ban();
			expect(ban.type).toBeUndefined();
			expect(ban.duration).toBeUndefined();

			ban = new SquadPlayer.Ban('1L');
			expect(ban.type).toEqual(BanType.LEAGUE);
			expect(ban.duration).toEqual(1);

			ban = new SquadPlayer.Ban('2P');
			expect(ban.type).toEqual(BanType.CUP);
			expect(ban.duration).toEqual(2);

			ban = new SquadPlayer.Ban('3I');
			expect(ban.type).toEqual(BanType.INTERNATIONAL);
			expect(ban.duration).toEqual(3);
		});

		it('should be serialized', () => {
			
			ban = new SquadPlayer.Ban('1L');
			expect(ban.getText()).toEqual('1L');
			expect(ban.getText(true)).toEqual('1 Ligaspiel');

			ban = new SquadPlayer.Ban('2P');
			expect(ban.getText()).toEqual('2P');
			expect(ban.getText(true)).toEqual('2 Pokalspiele');

			ban = new SquadPlayer.Ban('3I');
			expect(ban.getText()).toEqual('3I');
			expect(ban.getText(true)).toEqual('3 internationale Spiele');

			ban = new SquadPlayer.Ban();
			expect(ban.getText()).toEqual('');
			expect(ban.getText(true)).toEqual('');
		});
	});

	describe('Loan', () => {

		/** @type {SquadPlayer.Loan} */
		let loan;

		it('should be initialized', () => {
			
			loan = new SquadPlayer.Loan();
			expect(loan.from).toBeUndefined();
			expect(loan.to).toBeUndefined();
			expect(loan.duration).toBeUndefined();

			loan = new SquadPlayer.Loan('FC Cork', 'Swallos', 23);
			expect(loan.from).toEqual('FC Cork');
			expect(loan.to).toEqual('Swallos');
			expect(loan.duration).toEqual(23);
		});

		it('should be serialized', () => {
			
			loan = new SquadPlayer.Loan('FC Cork', 'Swallos', 23);
			expect(loan.getText()).toEqual('L23');
			expect(loan.getText(true)).toEqual('Leihgabe von FC Cork an Swallos für 23 ZATs');

			loan = new SquadPlayer.Loan();
			expect(loan.getText()).toEqual('');
			expect(loan.getText(true)).toEqual('');
		});
	});

});
