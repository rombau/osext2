describe('Requestor', () => {
	
	/** @type {Requestor} */ let requestor;
	
	beforeEach(() => {
		spyOn(XMLHttpRequest.prototype, 'open').and.callThrough();
		spyOn(XMLHttpRequest.prototype, 'send');
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

	it('should request page with query parameters', () => {
		
		requestor = Requestor.create(document);

		requestor.requestPage(new Page.ShowPlayer(123456, 'Hugo'));

		expect(requestor.status.lastChild.textContent).toEqual('Initialisiere Spieler Hugo');
		expect(XMLHttpRequest.prototype.open).toHaveBeenCalled();
		expect(XMLHttpRequest.prototype.send).toHaveBeenCalled();
	});

	it('should request page with form parameters', () => {
		
		requestor = Requestor.create(document);

		requestor.requestPage(new Page.MatchDayReport(15, 43));

		expect(requestor.status.lastChild.textContent).toEqual('Initialisiere ZAT-Report (Saison 15, Zat 43)');
		expect(XMLHttpRequest.prototype.open).toHaveBeenCalled();
		expect(XMLHttpRequest.prototype.send).toHaveBeenCalled();
	});

	it('should use callback after finsihing and clean up', (done) => {
		
		requestor = Requestor.create(document, () => {
			done();
		});
	
		requestor.finish();

		expect(requestor.status).toBeNull();
		expect(() => requestor.requestPage(new Page('Testseite'))).toThrowError('Testseite kann nicht initialisiert werden');
		expect(Requestor.getCurrent(document)).toBeNull();
	});

});
