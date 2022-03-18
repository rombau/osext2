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

			done();
		});
	});
});
