describe('WappenPage', () => {

	let data = new ExtensionData();

	beforeEach(() => {
		data = new ExtensionData();
	});

	it('should extract team name', (done) => {

		Fixture.getDocument('wappen.php', doc => {
			
			new WappenPage().extract(doc, data);
			
			expect(data.currentTeam.name).toEqual('FC Nivellois');
			
			done();
		});
	});

	it('should extract team name after team change', (done) => {

		data.initilized = true;
		data.currentTeam = new Team();
		data.currentTeam.name = 'FC Cork';
		
		Fixture.getDocument('wappen.php', doc => {
			
			new WappenPage().extract(doc, data);
			
			expect(data.initialized).toBeFalsy();
			expect(data.currentTeam.name).toEqual('FC Nivellois');
			
			done();
		});
	});

});
