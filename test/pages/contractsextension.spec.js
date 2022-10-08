describe('Page.ContractExtension', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.ContractExtension} */ let page;

	beforeEach(() => {
		data = new ExtensionData();
		page = new Page.ContractExtension();
	});

	it('should extract contract extension data', (done) => {

		data.nextZat = 31;
		data.nextZatSeason = 18;
		
		Fixture.getDocument('vt.php', doc => {
			
			page.extract(doc, data);
			
			expect(data.team.squadPlayers[0].followUpSalary['24']).toEqual(59597);
			expect(data.team.squadPlayers[0].followUpSalary['36']).toEqual(50565);
			expect(data.team.squadPlayers[0].followUpSalary['48']).toEqual(42901);
			expect(data.team.squadPlayers[0].followUpSalary['60']).toEqual(36400);

			data.team.squadPlayers.forEach(player => {
				player.ageExact = player.age;
				player.birthday = 72;
			});

			page.extend(doc, data);

			let spy = spyOn(page, 'updateWithTeam').and.callFake((team, current, matchDay) => {

				(spy.and.callThrough()).call(page, team, current, matchDay);

				if (!current) {
					doc.querySelector('.osext-set-zat.add > .fas.fa-plus-circle').dispatchEvent(new Event('click'));
					doc.querySelector('.osext-set-zat.delete > .fas.fa-trash-alt').dispatchEvent(new Event('click'));
				}

				done();
			});

			let slider = doc.querySelector('input[type=range]')
			slider.value = (+slider.value) + 1;
			slider.dispatchEvent(new Event('input'));
			slider.dispatchEvent(new Event('change'));

		});
	});
});
