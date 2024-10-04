describe('Page.Main', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.Main} */ let page;

	beforeEach(() => {
		data = new ExtensionData();
		page = new Page.Main();

		spyOn(Persistence, 'updateCurrentTeam').and.callFake(() => {
			return Promise.resolve();
		});
	});

	it('should extract team name', (done) => {

		Fixture.getDocument('haupt.php', doc => {

			spyOn(Object.getPrototypeOf(Object.getPrototypeOf(page)), 'process').and.callFake(() => {
				done();
			});

			page.process(doc, data);

			expect(Persistence.updateCurrentTeam).toHaveBeenCalledWith('FC Cork');
		});
	});

	it('should extract team data for new match day', (done) => {

		Fixture.getDocument('haupt.php', doc => {

			page.process(doc, data);

			page.extract(doc, data);

			expect(data.nextZat).toEqual(49);

			expect(data.team.id).toEqual(19);
			expect(data.team.name).toEqual('FC Cork');
			expect(data.team.emblem).toEqual('00000019.png');
			expect(data.team.league.level).toEqual(1);
			expect(data.team.league.countryName).toEqual('Irland');
			expect(data.team.accountBalance).toEqual(42300545);

			expect(data.pagesToRequest.length).toBeGreaterThan(0);

			data.nextZatSeason = 12; // initialized before extend

			let player1 = new SquadPlayer();
			player1.name = 'Test1';
			player1.contractExtensionMatchDay = data.lastMatchDay;
			player1.contractExtensionTerm = 24;
			data.team.squadPlayers.push(player1);
			let player2 = new SquadPlayer();
			player2.name = 'Test2';
			player2.contractExtensionMatchDay = data.lastMatchDay;
			player2.contractExtensionTerm = 36;

			data.team.squadPlayers.push(player2);
			let player3 = new SquadPlayer();
			player3.name = 'Test3';
			player3.fastTransferMatchDay = data.lastMatchDay;
			data.team.squadPlayers.push(player3);

			let player4 = new YouthPlayer();
			player4.pullMatchDay = data.lastMatchDay;
			data.team.youthPlayers.push(player4);

			page.extend(doc, data);

			let actionItems = doc.querySelectorAll('.osext-action-info');
			expect(actionItems.length).toEqual(3);
			expect(actionItems[0].textContent).toEqual('Vertragsverlängerung von Test1 (24 Monate), Test2 (36 Monate)');
			expect(actionItems[1].textContent).toEqual('Schnelltranfer von Test3');
			expect(actionItems[2].textContent).toEqual('Jugendspieler (1) ins A-Team übernehmen');

			done();
		});
	});
});
