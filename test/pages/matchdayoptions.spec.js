describe('Page.MatchDayOptions', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.MatchDayOptions} */ let page;
	/** @type {MatchDay} */ let matchday;

	beforeEach(() => {
		data = new ExtensionData();
		page = new Page.MatchDayOptions();

		spyOn(page, 'createPopupElement').and.callThrough();

		data.nextZat = 53;
		data.nextZatSeason = 16;
		matchday = data.team.getMatchDay(data.nextZatSeason, data.nextZat);
		matchday.location = GameLocation.HOME;
	});

	it('should extract page data', (done) => {

		Fixture.getDocument('zuzu.php', doc => {

			page.extract(doc, data);

			expect(data.viewSettings.ticketPrice.league).toEqual(31);
			expect(data.viewSettings.ticketPrice.cup).toEqual(36);
			expect(data.viewSettings.ticketPrice.international).toEqual(43);

			expect(data.viewSettings.ticketPrice.international).toEqual(43);

			expect(data.team.squadPlayers[0].id).toEqual(11031);
			expect(data.team.squadPlayers[0].physioCosts).toBeNull();

			expect(data.team.squadPlayers[13].id).toEqual(111254);
			expect(data.team.squadPlayers[13].physioCosts).toEqual(50000);

			done();
		});
	});

	it('should extract ticketprice for upcoming league fixture', (done) => {

		matchday.competition = Competition.LEAGUE;

		Fixture.getDocument('zuzu.php', doc => {

			page.extract(doc, data);

			expect(matchday.ticketPrice).toEqual(31);

			done();
		});
	});

	it('should extract ticketprice for upcoming cup fixture', (done) => {

		matchday.competition = Competition.CUP;

		Fixture.getDocument('zuzu.php', doc => {

			page.extract(doc, data);

			expect(matchday.ticketPrice).toEqual(36);

			done();
		});
	});

	it('should extract ticketprice for upcoming international fixture', (done) => {

		matchday.competition = Competition.OSE;

		Fixture.getDocument('zuzu.php', doc => {

			page.extract(doc, data);

			expect(matchday.ticketPrice).toEqual(43);

			done();
		});
	});

	it('should extract ticketprice for upcoming away fixture', (done) => {

		matchday.location = GameLocation.AWAY;

		Fixture.getDocument('zuzu.php', doc => {

			page.extract(doc, data);

			expect(matchday.ticketPrice).toBeNull();

			done();
		});
	});

	it('should extend page with stadium report', (done) => {

		Fixture.getDocument('zuzu.php', doc => {

			let matchDay = new MatchDay(1, 2);
			matchDay.competition = Competition.LEAGUE;
			matchDay.location = GameLocation.HOME;
			matchDay.ticketPrice = 10;
			matchDay.stadiumCapacity = 50000;
			matchDay.stadiumVisitors = 40000;
			data.team.matchDays.push(matchDay);

			page.extend(doc, data);

			expect(page.createPopupElement).toHaveBeenCalledTimes(3);
			expect(page.createPopupElement).toHaveBeenCalledWith(jasmine.any(HTMLInputElement), 'Übersicht der gespeicherten Ligaspiele', jasmine.any(Array));
			expect(page.createPopupElement).toHaveBeenCalledWith(jasmine.any(HTMLInputElement), 'Übersicht der gespeicherten Pokalspiele', jasmine.any(Array));
			expect(page.createPopupElement).toHaveBeenCalledWith(jasmine.any(HTMLInputElement), 'Übersicht der gespeicherten internationalen Spiele', jasmine.any(Array));

			expect(doc.querySelector('.osext-popup.visitors.liga')).not.toBeNull();
			expect(doc.querySelector('.osext-popup.visitors.pokal')).toBeNull();
			expect(doc.querySelector('.osext-popup.visitors.int')).toBeNull();

			done();
		});
	});
});
