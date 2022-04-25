describe('Page.Trainer', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.Trainer} */ let page;

	beforeEach(() => {
		data = new ExtensionData();
		page = new Page.Trainer();
	});

	it('should extract trainers', (done) => {

		Fixture.getDocument('trainer.php', doc => {

			page.extract(doc, data);

			expect(data.team.trainers.length).toEqual(6);
			expect(data.team.trainers[0].nr).toEqual(1);
			expect(data.team.trainers[0].salary).toEqual(507957);
			expect(data.team.trainers[0].upToSkill).toEqual(99);
			expect(data.team.trainers[0].legacySkill).toEqual(99);
			expect(data.team.trainers[0].contractTerm).toEqual(19);

			page.extend(doc, data);

			done();
		});
	});

	it('should not extract trainers', (done) => {

		Fixture.getDocument('trainer.confirm.php', doc => {

			page.extract(doc, data);

			expect(data.team.trainers.length).toEqual(0);

			page.extend(doc, data);

			done();
		});
	});

	it('should throw an error when layout is changed', (done) => {

		// header changed in fixture
		Fixture.getDocument('trainer.modified.php', doc => {

			try {
				page.extract(doc, data);
			} catch (e) {
				expect(e.message).toEqual('Tabelle nicht gefunden (trainer.modified.php.html)!');
			}

			done();
		});
	});
});
