describe('Page wappen', () => {

	beforeEach(() => {
		this.data = {};
	});

	it('should extract team data', (done) => {

		Fixture.getDocument('wappen.php', doc => {
			
			Page.Wappen.extract(doc, this.data);
			
			expect(this.data.currentTeamName).toEqual('FC Nivellois');
			
			done();
		});
	});

	it('should extract team data after team change', (done) => {

		this.data = {
			initialized : true,
			currentTeamName : 'FC Cork',
			team : {
				id : 19,
				image : '00000019.gif'
			}
		};
		
		Fixture.getDocument('wappen.php', doc => {
			
			Page.Wappen.extract(doc, this.data);
			
			expect(this.data.initialized).toBeFalsy();
			expect(this.data.team).toBeUndefined();
			expect(this.data.currentTeamName).toEqual('FC Nivellois');
			
			done();
		});
	});

});
