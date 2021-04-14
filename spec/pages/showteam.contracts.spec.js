describe('ShowteamContractsPage', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {ShowteamContractsPage} */ let page;
	
	beforeEach(() => {
		// for automatic regististration on new page
		spyOn(Persistence, 'updateCachedData').and.callFake((modifyData) => Promise.resolve());

		data = new ExtensionData();
		page = new ShowteamContractsPage();
	});

	it('should extract team data and extend page', (done) => {

		Fixture.getDocument('showteam.php?s=1', doc => {
			
			page.extract(doc, data);
					
			expect(data.currentTeam.squadPlayers[0].birthday).toEqual(18);
			expect(data.currentTeam.squadPlayers[0].contractTerm).toEqual(17);
			expect(data.currentTeam.squadPlayers[0].salary).toEqual(59812);
			expect(data.currentTeam.squadPlayers[0].marketValue).toEqual(9379453);

			page.extend(doc, data);
			
			done();
		});
	});
});
