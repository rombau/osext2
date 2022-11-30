describe('Requestor', () => {

	/** @type {Requestor} */ let requestor;

	beforeEach(() => {
		spyOn(window, 'fetch').and.resolveTo(new Response('', { status: 200, statusText: 'OK' }));
	});

	afterEach(() => {
		if (requestor) Requestor.cleanUp();
	});

	it('should be created with hidden iframe and status', () => {

		requestor = Requestor.create(document);

		expect(requestor.status.id).toEqual(Requestor.STATUS_ID);
		expect(requestor.status.className).toContain(STYLE_STATUS);
		expect(requestor.status.className).toContain(STYLE_MESSAGE);
	});

	it('should request page with query parameters', (done) => {

		let page = new Page.ShowPlayer(123456, 'Hugo');

		spyOn(page, 'process').and.callFake(() => {});

		requestor = Requestor.create(document);

		requestor.fetchPage(page).then(() => {
			expect(requestor.status.lastChild.textContent).toEqual('Initialisiere Spieler Hugo');
			expect(window.fetch).toHaveBeenCalledWith(jasmine.stringMatching(/sp\.php\?s=123456/), {});
			done();
		});

	});

	it('should request page with path parameters', (done) => {

		let page = new Page.GameReport(12, 46, 1, 2);

		spyOn(page, 'process').and.callFake(() => {});

		requestor = Requestor.create(document);

		requestor.fetchPage(page).then(() => {
			expect(requestor.status.lastChild.textContent).toEqual('Initialisiere Spielbericht');
			expect(window.fetch).toHaveBeenCalledWith(jasmine.stringMatching(/rep\/saison\/12\/46\/1-2\.html/), {});
			done();
		});

	});

	it('should request page with form parameters', (done) => {

		let page = new Page.MatchDayReport(15, 43);

		spyOn(page, 'process').and.callFake(() => {});

		requestor = Requestor.create(document);

		requestor.fetchPage(page).then(() => {
			expect(requestor.status.lastChild.textContent).toEqual('Initialisiere ZAT-Report (Saison 15, Zat 43)');
			let data = new FormData();
			data.append('saison', '15');
			data.append('zat', '43');
			expect(window.fetch).toHaveBeenCalledWith(jasmine.stringMatching(/zar\.php/), { method: 'POST', body: data });
			done();
		});

	});

	it('should use callback after finsihing and clean up', (done) => {

		requestor = Requestor.create(document, () => {
			done();
		});

		requestor.finish();

		expect(requestor.status).toBeNull();
		expect(Requestor.getCurrent(document)).toBeNull();
	});

});
