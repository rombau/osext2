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

			expect(data.team.matchDays.length).toEqual(71);
			expect(data.team.matchDays[0].zat).toEqual(1);
			expect(data.team.matchDays[0].season).toEqual(10);
			expect(data.team.matchDays[0].competition).toEqual(Competition.FRIENDLY);
			expect(data.team.matchDays[0].location).toEqual(GameLocation.AWAY);
			expect(data.team.matchDays[0].result).toEqual('1 : 0');
			expect(data.team.matchDays[0].opponent.id).toEqual(724);
			expect(data.team.matchDays[0].opponent.name).toEqual('FC Ferastrau Suceava');

			expect(data.team.matchDays[66].friendlyShare).toEqual(50);
			expect(data.team.matchDays[66].nextRound).toBeFalsy();

			expect(data.team.matchDays[68].competition).toEqual(Competition.CUP);
			expect(data.team.matchDays[68].nextRound).toBeTruthy();

			expect(data.nextMatchDay.season).toEqual(10);
			expect(data.nextMatchDay.zat).toEqual(49);
			expect(data.nextMatchDay.opponent.name).toEqual('Eski Turgutluspor');

			done();
		});
	});

	it('should extract match days and extend page', (done) => {

		data.nextZat = 53;
		data.nextZatSeason = 10;

		data.complete();

		spyOn(data.team, 'getMatchDaysWithBalance').and.callFake((matchDays) => {
			data.team.matchDays.forEach(day => {
				day.accountBalance = 0;
				day.youthSupport = 1;
				day.accountBalanceBefore = 1;
				day.accountBalancePromise = Promise.resolve(day);
			});
			return data.team.matchDays;
		});

		Fixture.getDocument('showteam.php?s=6', doc => {

			page.extract(doc, data);

			page.extend(doc, data);

			expect(doc.getElementsByTagName('table')[2].rows[22].cells[1].textContent).toContain('Liga (12. Spieltag)');
			expect(doc.getElementsByTagName('table')[2].rows[23].cells[1].textContent).toContain('OSE (1. Runde Hin)');
			expect(doc.getElementsByTagName('table')[2].rows[27].cells[1].textContent).toContain('LP (3. Runde)');

			let spy = spyOn(page, 'updateWithMatchDays').and.callFake((matchDays) => {

				(spy.and.callThrough()).call(page, matchDays);

				done();
			});

			let slider = doc.querySelector('input[type=range]');
			slider.value = (+slider.value) + 1;
			slider.dispatchEvent(new Event('input'));
			slider.dispatchEvent(new Event('change'));

		});
	});
});
