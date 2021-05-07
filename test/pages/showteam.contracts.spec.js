describe('ShowteamContractsPage', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {ShowteamContractsPage} */ let page;
	
	beforeEach(() => {
		// for automatic regististration on new page
		spyOn(Persistence, 'updateCachedData').and.callFake((modifyData) => {
			modifyData(data);
			return Promise.resolve(data);
		});

		data = new ExtensionData();
		page = new ShowteamContractsPage();
	});

	it('should extract team data and extend page', (done) => {

		data.nextZat = 53;
		data.nextZatSeason = 16;
		
		Fixture.getDocument('showteam.php?s=1', doc => {
			
			page.extract(doc, data);
					
			expect(data.currentTeam.squadPlayers[0].birthday).toEqual(18);
			expect(data.currentTeam.squadPlayers[0].contractTerm).toEqual(17);
			expect(data.currentTeam.squadPlayers[0].salary).toEqual(59812);
			expect(data.currentTeam.squadPlayers[0].marketValue).toEqual(9379453);

			page.extend(doc, data);

			let spy = spyOn(page, 'updateWithTeam').and.callFake((team, current, matchDay) => {

				(spy.and.callThrough()).call(page, team, current, matchDay);

				doc.querySelector('.osext-fast-transfer.add > .fas.fa-bolt').dispatchEvent(new Event('click'));
				doc.querySelector('td.osext-fast-transfer.delete > i.fas.fa-trash-alt').dispatchEvent(new Event('click'));

				done();
			});

			let slider = doc.querySelector('input[type=range]')
			slider.value = (+slider.value) + 1;
			slider.dispatchEvent(new Event('input'));
			slider.dispatchEvent(new Event('change'));

		});
	});
});
