describe('YouthPlayer', () => {

	/** @type {YouthPlayer} */
	let player;

	beforeEach(() => {
		Options.youthSkillForecastMethod = YouthSkillForecastMethod.DEFAULT;
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
		player.pos = player.getBestPosition();

		jasmine.addMatchers({
			toEqualSkillValues: () => {
				return {
					compare: function (actualSkills, expectedValues) {
						let result = {pass: true, error: undefined};
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

		expect(player.ageExact).toEqual(17.73611111111111);
		expect(player.trainingFactor).toEqual(1);

		player.complete(new MatchDay(14, 64));

		expect(player.ageExact).toEqual(17.555555555555557);
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

		expect(player.skills).toEqualSkillValues([19, 33, 25, 26, 35, 19, 0, 0, 23, 34, 25, 37, 15, 5, 95, 21, 29]);

		let forecastPlayer = player.getForecast(new MatchDay(15, 65), new MatchDay(16, 11));

		expect(forecastPlayer.skills).toEqualSkillValues([21, 36, 27, 29, 38, 21, 0, 0, 25, 37, 27, 41, 15, 5, 95, 23, 29]);
		expect(Object.values(forecastPlayer.skills).reduce((sum, value) => sum + value, 0) - Object.values(player.skills).reduce((sum, value) => sum + value, 0))
			.toEqual(28);

		player.skills.bak = 98;

		forecastPlayer = player.getForecast(new MatchDay(15, 65), new MatchDay(16, 11));

		expect(forecastPlayer.skills).toEqualSkillValues([21, 99, 27, 29, 38, 21, 0, 0, 25, 37, 27, 41, 15, 5, 95, 23, 29]);
		expect(Object.values(forecastPlayer.skills).reduce((sum, value) => sum + value, 0) - Object.values(player.skills).reduce((sum, value) => sum + value, 0))
			.toEqual(26);
	});

	it('should return skill forecast based on current skills and average increase per day', () => {

		Options.youthSkillForecastMethod = YouthSkillForecastMethod.SAINTE_LAGUE;
		player.age = 15;

		expect(player.getAverageIncreasePerDay(player.getYouthDays(new MatchDay(15, 65))).toFixed(3))
			.toEqual('1.605');
		expect(player.skills).toEqualSkillValues([19, 33, 25, 26, 35, 19, 0, 0, 23, 34, 25, 37, 15, 5, 95, 21, 29]);

		let forecastPlayer = player.getForecast(new MatchDay(15, 65), new MatchDay(15, 67));

		expect(forecastPlayer.skills).toEqualSkillValues([19, 33, 26, 27, 35, 19, 0, 0, 23, 34, 25, 38, 15, 5, 95, 21, 29]);
		expect(Object.values(forecastPlayer.skills).reduce((sum, value) => sum + value, 0) - Object.values(player.skills).reduce((sum, value) => sum + value, 0))
			.toEqual(3);

		forecastPlayer = player.getForecast(new MatchDay(15, 65), new MatchDay(16, 11));

		expect(forecastPlayer.skills).toEqualSkillValues([21, 36, 27, 29, 39, 21, 0, 0, 25, 37, 27, 41, 15, 5, 95, 23, 29]);
		expect(Object.values(forecastPlayer.skills).reduce((sum, value) => sum + value, 0) - Object.values(player.skills).reduce((sum, value) => sum + value, 0))
			.toEqual(29);

		player.skills.bak = 98;
		expect(player.getAverageIncreasePerDay(player.getYouthDays(new MatchDay(15, 65))).toFixed(3))
			.toEqual('1.957');

		forecastPlayer = player.getForecast(new MatchDay(15, 65), new MatchDay(16, 11));

		expect(forecastPlayer.skills).toEqualSkillValues([21, 99, 27, 29, 41, 21, 0, 0, 25, 40, 27, 44, 15, 5, 95, 23, 29]);
		expect(Object.values(forecastPlayer.skills).reduce((sum, value) => sum + value, 0) - Object.values(player.skills).reduce((sum, value) => sum + value, 0))
			.toEqual(35);

		Options.youthSkillForecastMethod = YouthSkillForecastMethod.DEFAULT;
	});

	it('should return skill forecast based on current skills and average increase per day edge case poor', () => {

		Options.youthSkillForecastMethod = YouthSkillForecastMethod.SAINTE_LAGUE;
		player = Object.assign(new YouthPlayer(), {
			'skills': {
				'sch': 0,
				'bak': 1,
				'kob': 0,
				'zwk': 0,
				'dec': 0,
				'ges': 0,
				'fuq': 0,
				'erf': 0,
				'agg': 0,
				'pas': 1,
				'aus': 0,
				'ueb': 0,
				'wid': 15,
				'sel': 5,
				'dis': 95,
				'zuv': 0,
				'ein': 29
			},
			'age': 13,
			'birthday': 24,
		});
		player.pos = player.getBestPosition();

		expect(player.getAverageIncreasePerDay(player.getYouthDays(new MatchDay(15, 25)))).toEqual(2);

		let forecastPlayer = player.getForecast(new MatchDay(15, 25), new MatchDay(21, 23));

		expect(forecastPlayer.skills).toEqualSkillValues([0, 99, 0, 0, 0, 0, 0, 0, 0, 99, 0, 0, 15, 5, 95, 0, 29]);
		expect(Object.values(forecastPlayer.skills).reduce((sum, value) => sum + value, 0) - Object.values(player.skills).reduce((sum, value) => sum + value, 0))
			.toEqual(196);

		Options.youthSkillForecastMethod = YouthSkillForecastMethod.DEFAULT;
	});

	it('should return salary forecast when pulled', () => {

		player.age = 15;
		player.birthday = 24;
		player.pullMatchDay = new MatchDay(18, 23);
		player.pullContractTerm = 72;

		let forecastPlayer = player.getForecast(new MatchDay(15, 10), new MatchDay(18, 24));

		expect(forecastPlayer.salary).toEqual(92419);
	});

	it('should return fingerprint', () => {

		player.season = 1;
		player.talent = Talent.NORMAL;
		player.birthday = 24;

		expect(player.getFingerPrint()).toEqual('GUA00124normal15059529');

		player.pos = Position.TOR;
		player.talent = Talent.HIGH;

		expect(player.getFingerPrint()).toEqual('GUA00124hoch15059529');

		player.birthday = 6;

		expect(player.getFingerPrint()).toEqual('GUA00106hoch15059529');
	});
});
