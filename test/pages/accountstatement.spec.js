describe('Page.AccountStatement', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.AccountStatement} */ let page;

	beforeEach(() => {
		data = new ExtensionData();
		page = new Page.AccountStatement();

		data.initNextZat(54);
		data.initNextSeason(16);
	});

	it('should extract current balance from account statement', (done) => {

		Fixture.getDocument('ka.php', doc => {

			page.extract(doc, data);

			expect(data.team.accountBalance).toEqual(32221833);
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
});
