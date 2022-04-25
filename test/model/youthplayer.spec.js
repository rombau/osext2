describe('YouthPlayer', () => {

	/** @type {YouthPlayer} */
	let player;

	beforeEach(() => {
		player = Object.assign(new YouthPlayer(), {
			'skills': {
				'sch': 19,
				'bak': 33,
				'kob': 25,
				'zwk': 26,
				'dec': 35,
				'ges': 19,
				'fuq': 0,
				'erf': 0,
				'agg': 23,
				'pas': 34,
				'aus': 25,
				'ueb': 37,
				'wid': 15,
				'sel': 5,
				'dis': 95,
				'zuv': 21,
				'ein': 29
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
		expect(player.pos).toEqual(Position.DMI);
		expect(player.trainingFactor).toEqual(1);

		player.complete(new MatchDay(14, 64));

		expect(player.ageExact).toEqual(17.555555555555557);
		expect(player.pos).toEqual(Position.DMI);
		expect(player.trainingFactor).toEqual(1);

		player.pullMatchDay = new MatchDay(14, 65);

		player.complete(new MatchDay(14, 66));

		expect(player.pullMatchDay).toBeNull();
		expect(player.pullContractTerm).toBeNull();
		expect(player.pullPosition).toBeNull();
	});

	it('should return salary', () => {

		expect(player.getSalary()).toEqual(6036);
		expect(player.getSalary(24)).toEqual(6036);
		expect(player.getSalary(36)).toEqual(7392);
		expect(player.getSalary(48)).toEqual(8676);
		expect(player.getSalary(60)).toEqual(10124);
		expect(player.getSalary(72)).toEqual(11489);
	});

	it('should return forecast days interval', () => {

		expect(player.getForecastDays(new MatchDay(15, 25), new MatchDay(15, 72))).toEqual(47);
		expect(player.getForecastDays(new MatchDay(15, 25))).toEqual(142);
	});

	it('should return age forecast', () => {

		player.age = 15;
		player.birthday = 24;

		expect(player.getForecast(new MatchDay(15, 25), new MatchDay(15, 72)).age).toEqual(15);
		expect(player.getForecast(new MatchDay(15, 10), new MatchDay(15, 72)).age).toEqual(16);
		expect(player.getForecast(new MatchDay(15, 10), new MatchDay(16, 72)).age).toEqual(17);
		expect(player.getForecast(new MatchDay(15, 10), new MatchDay(17, 72)).age).toEqual(18);
		expect(player.getForecast(new MatchDay(15, 10), new MatchDay(18, 24)).age).toEqual(19);
		expect(player.getForecast(new MatchDay(15, 10), new MatchDay(18, 24)).active).toBeFalsy();
	});

	it('should return skill forecast based on current skills and past time', () => {

		player.age = 15;

		let forecastPlayer = player.getForecast(new MatchDay(15, 65), new MatchDay(16, 11));

		expect(JSON.stringify(Object.values(forecastPlayer.skills)))
			.toEqual('[21,36,27,29,38,21,0,0,25,37,27,41,15,5,95,23,29]');

		player.skills.bak = 98;

		forecastPlayer = player.getForecast(new MatchDay(15, 65), new MatchDay(16, 11));

		expect(JSON.stringify(Object.values(forecastPlayer.skills)))
			.toEqual('[21,99,27,29,38,21,0,0,25,37,27,41,15,5,95,23,29]');
	});

	it('should return salary forecast when pulled', () => {

		player.age = 15;
		player.birthday = 24;
		player.pullMatchDay = new MatchDay(18, 23);
		player.pullContractTerm = 72;

		let forecastPlayer = player.getForecast(new MatchDay(15, 10), new MatchDay(18, 24));

		expect(forecastPlayer.salary).toEqual(92419);
	});
});
