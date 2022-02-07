describe('YouthPlayer', () => {
	
	/** @type {YouthPlayer} */ 
	let player;
	
	beforeEach(() => {
		player = Object.assign(new YouthPlayer(), {
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
			'age': 17,
			'birthday': 24,
			'countryCode': 'GUA',
			'countryName': 'Guatemala',
			'uefa': false
		});
	});
	
	it('should complete initialization', () => {

		player.complete(new MatchDay(14, 5));

		expect(player.ageExact).toEqual(17.73611111111111);
		expect(player.pos).toEqual(Position.MIT);
		expect(player.trainingFactor).toEqual(1);

		player.complete(new MatchDay(14, 64));

		expect(player.ageExact).toEqual(17.555555555555557);
		expect(player.pos).toEqual(Position.MIT);
		expect(player.trainingFactor).toEqual(1);
	});

});
