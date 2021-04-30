describe('ContractExtensionPage', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {ContractExtensionPage} */ let page;
	
	beforeEach(() => {
		// for automatic regististration on new page
		spyOn(Persistence, 'updateCachedData').and.callFake((modifyData) => Promise.resolve());

		data = new ExtensionData();
		page = new ContractExtensionPage();
	});

	it('should extract contract extension data', (done) => {

		Fixture.getDocument('vt.php', doc => {
			
			page.extract(doc, data);
					
			expect(data.currentTeam.squadPlayers[0].followUpSalary['24']).toEqual(59597);
			expect(data.currentTeam.squadPlayers[0].followUpSalary['36']).toEqual(50565);
			expect(data.currentTeam.squadPlayers[0].followUpSalary['48']).toEqual(42901);
			expect(data.currentTeam.squadPlayers[0].followUpSalary['60']).toEqual(36400);
			
			done();
		});
	});
});
