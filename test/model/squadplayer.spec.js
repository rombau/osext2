describe('SquadPlayer', () => {
	
	/** @type {SquadPlayer} */ 
	let player;
	
	beforeEach(() => {
		player = new SquadPlayer();
	});
	
	describe('Ban', () => {

		/** @type {SquadPlayer.Ban} */
		let ban;

		it('should be initialized by text', () => {
			
			ban = new SquadPlayer.Ban();
			expect(ban.type).toBeUndefined();
			expect(ban.duration).toBeUndefined();

			ban = new SquadPlayer.Ban('1L');
			expect(ban.type).toEqual(BanType.LEAGUE);
			expect(ban.duration).toEqual(1);

			ban = new SquadPlayer.Ban('2P');
			expect(ban.type).toEqual(BanType.CUP);
			expect(ban.duration).toEqual(2);

			ban = new SquadPlayer.Ban('3I');
			expect(ban.type).toEqual(BanType.INTERNATIONAL);
			expect(ban.duration).toEqual(3);
		});

		it('should be serialized', () => {
			
			ban = new SquadPlayer.Ban('1L');
			expect(ban.getText()).toEqual('1L');
			expect(ban.getText(true)).toEqual('1 Ligaspiel');

			ban = new SquadPlayer.Ban('2P');
			expect(ban.getText()).toEqual('2P');
			expect(ban.getText(true)).toEqual('2 Pokalspiele');

			ban = new SquadPlayer.Ban('3I');
			expect(ban.getText()).toEqual('3I');
			expect(ban.getText(true)).toEqual('3 internationale Spiele');

			ban = new SquadPlayer.Ban();
			expect(ban.getText()).toEqual('');
			expect(ban.getText(true)).toEqual('');
		});
	});

	describe('Loan', () => {

		/** @type {SquadPlayer.Loan} */
		let loan;

		it('should be initialized', () => {
			
			loan = new SquadPlayer.Loan();
			expect(loan.from).toBeUndefined();
			expect(loan.to).toBeUndefined();
			expect(loan.duration).toBeUndefined();

			loan = new SquadPlayer.Loan('FC Cork', 'Swallos', 23);
			expect(loan.from).toEqual('FC Cork');
			expect(loan.to).toEqual('Swallos');
			expect(loan.duration).toEqual(23);
		});

		it('should be serialized', () => {
			
			loan = new SquadPlayer.Loan('FC Cork', 'Swallos', 23);
			expect(loan.getText()).toEqual('L23');
			expect(loan.getText(true)).toEqual('Leihgabe von FC Cork an Swallos für 23 ZATs');

			loan = new SquadPlayer.Loan();
			expect(loan.getText()).toEqual('');
			expect(loan.getText(true)).toEqual('');
		});
	});

});
