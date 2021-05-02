describe('Requestor', () => {
	
	/** @type {Document} */ let doc;
	/** @type {Requestor} */ let requestor;
	
	beforeEach(() => {
		doc = Fixture.createDocument('');
		requestor = new Requestor(doc);

		// for automatic regististration on new page
		spyOn(Persistence, 'updateCachedData').and.callFake((modifyData) => Promise.resolve());
	});

    afterEach(() => {
    	if (requestor.frame) requestor.frame.parentNode.removeChild(requestor.frame);
		if (requestor.status) requestor.status.parentNode.removeChild(requestor.status);
    });
    
	it('should be created with hidden iframe', () => {
		
		expect(requestor.doc).toEqual(doc);
		expect(requestor.pageQueue.length).toEqual(0);
		expect(requestor.frame).not.toBeNull();
		expect(requestor.frame.id).toEqual(Requestor.FRAME_ID);
		expect(requestor.frame.src).toEqual('about:blank');
		expect(requestor.frame.className).toEqual('osext-hidden');
		expect(requestor.frame.requestAdditionalPages).toBeDefined();
		expect(requestor.frame.pageLoaded).toBeDefined();
	});

	it('should request pages with query parameters', () => {
		
		requestor.addPage(new ShowteamOverviewPage());
		requestor.addPage(new ShowteamSkillsPage());
		
		expect(requestor.pageQueue.length).toEqual(2);
		expect(requestor.status).toBeUndefined();
		
		requestor.start(new MainPage());
		
		expect(requestor.status.classList).not.toContain('osext-hidden');
		
		expect(requestor.pageQueue.length).toEqual(1);
		expect(requestor.status.textContent).toContain('Initialisiere Teamübersicht ...');

		requestor.frame.pageLoaded();

		expect(requestor.pageQueue.length).toEqual(0);
		expect(requestor.status.textContent).toContain('Initialisiere Einzelskills ...');

		requestor.frame.requestAdditionalPages(new ShowPlayerPage(123456, 'Hugo'));
		requestor.frame.pageLoaded();

		expect(requestor.pageQueue.length).toEqual(0);
		expect(requestor.status.textContent).toContain('Initialisiere Spieler Hugo ...');

		requestor.frame.pageLoaded();

		expect(requestor.status.classList).toContain('osext-hidden');
		
	});

	it('should request pages with form parameters', () => {
		
		requestor.addPage(new MatchDayReportPage(15, 43));
		
		expect(requestor.pageQueue.length).toEqual(1);
		expect(requestor.status).toBeUndefined();
		
		requestor.start(new MainPage());
		
		expect(requestor.status.classList).not.toContain('osext-hidden');
		
		expect(requestor.pageQueue.length).toEqual(0);
		expect(requestor.status.textContent).toContain('Initialisiere ZAT-Report (Saison 15, Zat 43) ...');

		/** @type {HTMLFormElement} */
		let form = doc.getElementById(Requestor.FORM_ID)

		expect(form.firstElementChild.name).toEqual('saison');
		expect(form.firstElementChild.value).toEqual('15');
		expect(form.lastElementChild.name).toEqual('zat');
		expect(form.lastElementChild.value).toEqual('43');

		requestor.frame.pageLoaded();

		expect(requestor.status.classList).toContain('osext-hidden');
		
	});
});
