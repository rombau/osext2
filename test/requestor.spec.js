describe('Requestor', () => {
	
	/** @type {Requestor} */ let requestor;
	
    afterEach(() => {
		if (requestor) Requestor.cleanUp();
    });
    
	it('should be created with hidden iframe and status', () => {

		requestor = Requestor.create(document);

		expect(requestor.frame.id).toEqual(Requestor.FRAME_ID);
		expect(requestor.frame.src).toEqual('about:blank');
		expect(requestor.frame.className).toEqual(STYLE_HIDDEN);

		expect(requestor.status.id).toEqual(Requestor.STATUS_ID);
		expect(requestor.status.className).toContain(STYLE_STATUS);
		expect(requestor.status.className).toContain(STYLE_MESSAGE);
	});

	it('should be found from within the iframe', () => {
		
		requestor = Requestor.create(document);
		
		expect(Requestor.getCurrent(document)).toBeNull();
		expect(Requestor.getCurrent(requestor.frame.contentDocument)).toBeDefined();
	});

	it('should request page with query parameters', () => {
		
		requestor = Requestor.create(document);

		requestor.requestPage(new Page.ShowPlayer(123456, 'Hugo'));

		expect(requestor.frame.src).toMatch(/sp\.php\?s=123456/);
		expect(requestor.status.lastChild.textContent).toEqual('Initialisiere Spieler Hugo');
	});

	it('should request page with form parameters', () => {
		
		requestor = Requestor.create(document);

		requestor.requestPage(new Page.MatchDayReport(15, 43));

		expect(requestor.status.lastChild.textContent).toEqual('Initialisiere ZAT-Report (Saison 15, Zat 43)');

		let form = requestor.frame.ownerDocument.getElementById(Requestor.FORM_ID);

		expect(form.firstElementChild.name).toEqual('saison');
		expect(form.firstElementChild.value).toEqual('15');
		expect(form.lastElementChild.name).toEqual('zat');
		expect(form.lastElementChild.value).toEqual('43');

	});

	it('should use callback after finsihing and clean up', (done) => {
		
		requestor = Requestor.create(document, () => {
			done();
		});
	
		requestor.finish();

		expect(requestor.frame).toBeNull();
		expect(requestor.status).toBeNull();
		expect(() => requestor.requestPage(new Page('Testseite'))).toThrowError('Testseite kann nicht initialisiert werden.');
		expect(Requestor.getCurrent(document)).toBeNull();
	});

});
