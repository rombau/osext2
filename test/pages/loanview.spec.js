describe('LoanViewPage', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {LoanViewPage} */ let page;

	beforeEach(() => {
		// for automatic regististration on new page
		spyOn(Persistence, 'updateCachedData').and.callFake((modifyData) => Promise.resolve());

		data = new ExtensionData();
		page = new LoanViewPage();
	});

	it('should extract loan information', (done) => {

		let playerFrom = data.currentTeam.getSquadPlayer(11031);
		playerFrom.loan = new SquadPlayer.Loan('Team1', 'Team2', 15);
		playerFrom.pos = Position.TOR;

		let playerTo = data.currentTeam.getSquadPlayer(81726);
		playerTo.loan = new SquadPlayer.Loan('Team3', 'Team4', 51);
		playerTo.pos = 'LEI';

		Fixture.getDocument('viewleih.php', doc => {
			
			page.extract(doc, data);
			
			expect(playerFrom.loan.fee).toEqual(-96793);

			expect(playerTo.loan.fee).toEqual(168406);
			expect(playerTo.pos).toEqual(Position.TOR);

			page.extend(doc, data);

			done();
		});
	});
});
