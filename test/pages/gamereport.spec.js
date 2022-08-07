describe('Page.GameReport', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.GameReport} */ let page;

	beforeEach(() => {
		data = new ExtensionData();
		page = new Page.GameReport(18, 39, 19, 193);
	});

	it('should extract current balance from account statement', (done) => {

		data.team.id = 19;

		Fixture.getDocument('rep/saison/18/39/19-193.html', doc => {

			page.extract(doc, data);

			expect(data.team.getMatchDay(18, 39).stadiumVisitors).toEqual(45791);

			done();
		});
	});
});
