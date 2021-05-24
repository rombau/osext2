describe('ExtensionData', () => {

	/** @type {ExtensionData} */
	let data;

	beforeEach(() => {
		data = new ExtensionData();
	});

	it('should initializes the next zat regularly', () => {

		data.initNextZat(27);

		let ok = data.initNextSeason(12);

		expect(ok).toBeTruthy();
		expect(data.nextMatchDay.zat).toEqual(27);
		expect(data.nextMatchDay.season).toEqual(12);

		ok = data.initNextSeason(13);

		expect(ok).toBeTruthy();
		expect(data.nextMatchDay.season).toEqual(12);
	});

	it('should initializes the next zat after season', () => {

		data.team.getMatchDay(12, 72).result = '0 : 0';

		data.initNextZat(73);

		let ok = data.initNextSeason(12);

		expect(ok).toBeTruthy();
		expect(data.nextMatchDay.zat).toEqual(1);
		expect(data.nextMatchDay.season).toEqual(13);
	});

	it('should initializes the next zat before season', () => {

		data.initNextZat(0);

		let ok = data.initNextSeason(12);

		expect(ok).toBeFalsy()
	});

	it('should return next match day from team match days', () => {

		let teamMatchDay = data.team.getMatchDay(12, 27);

		data.initNextZat(27);
		data.initNextSeason(12);

		expect(data.nextMatchDay).toEqual(teamMatchDay);
	});

	it('should return last match day from team match days', () => {

		let teamMatchDay = data.team.getMatchDay(12, 26);

		data.initNextZat(27);
		data.initNextSeason(12);

		expect(data.lastMatchDay).toEqual(teamMatchDay);
	});

	it('should return last match day from team match days over season interval', () => {

		let teamMatchDay = data.team.getMatchDay(12, 72);
		teamMatchDay.result = '0 : 0';

		data.initNextZat(73);
		data.initNextSeason(12);

		expect(data.lastMatchDay).toEqual(teamMatchDay);
	});
});
