describe('Page.AccountStatement', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.AccountStatement} */ let page;

	beforeEach(() => {
		data = new ExtensionData();
		page = new Page.AccountStatement();
	});

	it('should extract current balance from account statement', (done) => {

		Fixture.getDocument('ka.php', doc => {

			data.initNextZat(54);
			data.initNextSeason(16);

			page.extract(doc, data);

			expect(data.team.accountBalance).toEqual(32221833);

			expect(data.team.getMatchDay(16, 54).accountBalanceBefore).toEqual(32221833);
			expect(data.team.getMatchDay(16, 54).otherBookings).toEqual({'Transfer':0});

			expect(data.team.getMatchDay(16, 53).accountBalanceBefore).toEqual(46161833);
			expect(data.team.getMatchDay(16, 53).otherBookings).toEqual({'Transfer':-14000000});
			expect(data.team.getMatchDay(16, 53).accountBalance).toEqual(32221833);
			expect(data.team.getMatchDay(16, 52).accountBalanceBefore).toEqual(46351833);
			expect(data.team.getMatchDay(16, 52).accountBalance).toEqual(46161833);

			expect(data.team.getMatchDay(16, 1).accountBalanceBefore).toEqual(20912802);
			expect(data.team.getMatchDay(16, 1).accountBalance).toEqual(32095993);

			done();
		});
	});

	it('should extract account statement from old season', (done) => {

		Fixture.getDocument('ka.php', doc => {

			data.initNextZat(1);
			data.initNextSeason(17);

			page.extract(doc, data);

			expect(data.team.accountBalance).toEqual(32221833);

			expect(data.team.getMatchDay(16, 72).otherBookings).toEqual({'Transfer':0});
			expect(data.team.getMatchDay(16, 72).advertisingIncome).toEqual(1332416);
			expect(data.team.getMatchDay(16, 72).merchandisingIncome).toEqual(1175694);

			expect(data.team.getMatchDay(16, 53).otherBookings).toEqual({'Transfer':-14000000});

			data.team.league.size = 10;

			page.extract(doc, data);

			expect(data.team.getMatchDay(16, 72).advertisingIncome).toEqual(1327260);
			expect(data.team.getMatchDay(16, 72).merchandisingIncome).toEqual(1180850);

			done();
		});
	});
});
