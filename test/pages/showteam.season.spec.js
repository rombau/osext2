describe('Page.ShowteamSeason', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.ShowteamSeason} */ let page;
	
	beforeEach(() => {
		data = new ExtensionData();
		page = new Page.ShowteamSeason();
	});

	it('should extract match days', (done) => {

		data.nextZat = 49;

		Fixture.getDocument('showteam.php?s=6', doc => {
			
			page.extract(doc, data);
						
			expect(data.team.matchDays.length).toEqual(72);
			expect(data.team.matchDays[0].zat).toEqual(1);
			expect(data.team.matchDays[0].season).toEqual(10);
			expect(data.team.matchDays[0].competition).toEqual(Competition.FRIENDLY);
			expect(data.team.matchDays[0].location).toEqual(GameLocation.AWAY);
			expect(data.team.matchDays[0].result).toEqual('1 : 0');
			expect(data.team.matchDays[0].opponent.id).toEqual(724);
			expect(data.team.matchDays[0].opponent.name).toEqual('FC Ferastrau Suceava');

			expect(data.team.matchDays[66].friendlyShare).toEqual(50);

			expect(data.nextMatchDay.season).toEqual(10);
			expect(data.nextMatchDay.zat).toEqual(49);
			expect(data.nextMatchDay.opponent.name).toEqual('Eski Turgutluspor');

			done();
		});
	});

	it('should extract match days from previous season', (done) => {

		data.nextZat = 1;

		Fixture.getDocument('showteam.php?s=6', doc => {
			
			HtmlUtil.getTableRowsByHeader(doc, ...Page.ShowteamSeason.HEADERS).forEach(row => {
				row.cells[3].textContent = '';
			});

			let pagesToLoad = page.extract(doc, data);
						
			expect(pagesToLoad.length).toEqual(1);
			expect(pagesToLoad[0].name).toEqual('Saisonplan (Saison 9)');

			expect(data.nextMatchDay).toBeUndefined();

			done();
		});
	});

});
