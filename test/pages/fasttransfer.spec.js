describe('Page.FastTransfer', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.FastTransfer} */ let page;

	beforeEach(() => {
		data = new ExtensionData();
		page = new Page.FastTransfer();
	});

	it('should check predefined', (done) => {

		data.nextZat = 53;
		data.nextZatSeason = 16;

		let player = data.team.getSquadPlayer(61744);
		player.fastTransferMatchDay = data.lastMatchDay;

		Fixture.getDocument('blitz.php', doc => {

			page.extend(doc, data);

			expect(doc.querySelector('input[type="checkbox"][value="61744"]').checked).toBeTruthy();

			done();
		});
	});

	it('should handle confirmation page', (done) => {

		Fixture.getDocument('blitz.confirm.php', doc => {

			page.extend(doc, data);

			done();
		});
	});
});
