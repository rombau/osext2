describe('Page.ContractExtension', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.ContractExtension} */ let page;
	
	beforeEach(() => {
		data = new ExtensionData();
		page = new Page.ContractExtension();
	});

	it('should extract contract extension data', (done) => {

		Fixture.getDocument('vt.php', doc => {
			
			page.extract(doc, data);
					
			expect(data.team.squadPlayers[0].followUpSalary['24']).toEqual(59597);
			expect(data.team.squadPlayers[0].followUpSalary['36']).toEqual(50565);
			expect(data.team.squadPlayers[0].followUpSalary['48']).toEqual(42901);
			expect(data.team.squadPlayers[0].followUpSalary['60']).toEqual(36400);
			
			done();
		});
	});
});
