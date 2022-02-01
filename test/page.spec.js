describe('Page', () => {
	
	describe('should return URL for request', () => {
		
		beforeEach(() => {		
			spyOn(Persistence, 'updateExtensionData').and.callFake((modifyData) => Promise.resolve());
		});
		
		it('without params', () => {
			
			let page = new Page('Testseite', 'xyz.php');
						
			expect(page.createUrl()).toMatch(/xyz\.php/);
		});
		
		it('with optional param', () => {
			
			let page = new Page('Testseite', 'xyz.php', new Page.Param('s', '1', true));
			
			expect(page.createUrl()).toMatch(/xyz\.php/);
		});
		
		it('with mandatory param', () => {
			
			let page = new Page('Testseite', 'xyz.php', new Page.Param('s', '1', false));
			
			expect(page.createUrl()).toMatch(/xyz\.php\?s=1/);
		});
		
		it('with undefined dynamic param', () => {
					
			let page = new Page('Testseite', 'xyz.php', new Page.Param('s'));
			
			expect(() => { page.createUrl(); }).toThrowError(/Value for s \(url: .+\) is missing/);
		});
			
		it('with path param', () => {
			
			let page = new Page('Testseite', 'rep/1/2.html');
			
			expect(page.createUrl()).toMatch(/rep\/1\/2\.html/);
		});
		
	});
	
	describe('should match given location', () => {

		beforeEach(() => {		
			spyOn(Persistence, 'updateExtensionData').and.callFake((modifyData) => Promise.resolve());
		});

		it('with invalid url', () => {
			
			let page = new Page('Testseite', 'test.php');
			
			expect(page.match('xyz')).toBeFalsy();
		});
		
		it('without any query param', () => {
			
			let page = new Page('Testseite', 'test.php');
			
			expect(page.match('http://www.any.com')).toBeFalsy();
			expect(page.match('http://www.any.com/showit.php')).toBeFalsy();
			expect(page.match('http://www.any.com/test.php')).toBeTruthy();
			expect(page.match('http://www.any.com/test.php?any')).toBeTruthy();
		});
		
		it('with one optional query param', () => {
			
			let page = new Page('Testseite', 'test.php', new Page.Param('s', '0', true));
			
			expect(page.match('http://www.any.com')).toBeFalsy();
			expect(page.match('http://www.any.com/showit.php')).toBeFalsy();
			expect(page.match('http://www.any.com/test.php')).toBeTruthy();
			expect(page.match('http://www.any.com/test.php?any')).toBeTruthy();
			expect(page.match('http://www.any.com/test.php?s')).toBeTruthy();
			expect(page.match('http://www.any.com/test.php?s=')).toBeTruthy();
			expect(page.match('http://www.any.com/test.php?s=0')).toBeTruthy();
			expect(page.match('http://www.any.com/test.php?any&s=0&any')).toBeTruthy();
			expect(page.match('http://www.any.com/test.php?s=1')).toBeFalsy();
			expect(page.match('http://www.any.com/test.php?xyz=xyz&s=1&all=true')).toBeFalsy();
		});

		it('with one mandatory query param', () => {
			
			let page = new Page('Testseite', 'test.php', new Page.Param('s', '1'));
			
			expect(page.match('http://www.any.com')).toBeFalsy();
			expect(page.match('http://www.any.com/showit.php')).toBeFalsy();
			expect(page.match('http://www.any.com/test.php')).toBeFalsy();
			expect(page.match('http://www.any.com/test.php?any')).toBeFalsy();
			expect(page.match('http://www.any.com/test.php?s')).toBeFalsy();
			expect(page.match('http://www.any.com/test.php?s=')).toBeFalsy();
			expect(page.match('http://www.any.com/test.php?s=0')).toBeFalsy();
			expect(page.match('http://www.any.com/test.php?any&s=0&any')).toBeFalsy();
			expect(page.match('http://www.any.com/test.php?s=1')).toBeTruthy();
			expect(page.match('http://www.any.com/test.php?xyz=xyz&s=1&all=true')).toBeTruthy();
		});
		
		it('with one mandatory and one optional query param', () => {
			
			let page = new Page('Testseite', 'test.php', new Page.Param('c', '1'), new Page.Param('s', '0', true));
			
			expect(page.match('http://www.any.com')).toBeFalsy();
			expect(page.match('http://www.any.com/showit.php')).toBeFalsy();
			expect(page.match('http://www.any.com/test.php')).toBeFalsy();
			expect(page.match('http://www.any.com/test.php?any')).toBeFalsy();
			expect(page.match('http://www.any.com/test.php?s=0')).toBeFalsy();
			expect(page.match('http://www.any.com/test.php?c=1')).toBeTruthy();
			expect(page.match('http://www.any.com/test.php?c=1&s=0')).toBeTruthy();
			expect(page.match('http://www.any.com/test.php?c=1&s=1')).toBeFalsy();
		});
		
		it('with one mandatory and one dynamic query param', () => {
			
			let page = new Page('Testseite', 'test.php', new Page.Param('c', '1'), new Page.Param('s', '1'));
			
			expect(page.match('http://www.any.com')).toBeFalsy();
			expect(page.match('http://www.any.com/showit.php')).toBeFalsy();
			expect(page.match('http://www.any.com/test.php')).toBeFalsy();
			expect(page.match('http://www.any.com/test.php?any')).toBeFalsy();
			expect(page.match('http://www.any.com/test.php?s=0')).toBeFalsy();
			expect(page.match('http://www.any.com/test.php?c=1')).toBeFalsy();
			expect(page.match('http://www.any.com/test.php?c=1&s=0')).toBeFalsy();
			expect(page.match('http://www.any.com/test.php?c=1&s=1')).toBeTruthy();
		});
		
		it('with one dynamic and one optional query param', () => {
			
			let page = new Page('Testseite', 'test.php', new Page.Param('c', '1'), new Page.Param('s', '0', true));
			
			expect(page.match('http://www.any.com')).toBeFalsy();
			expect(page.match('http://www.any.com/showit.php')).toBeFalsy();
			expect(page.match('http://www.any.com/test.php')).toBeFalsy();
			expect(page.match('http://www.any.com/test.php?any')).toBeFalsy();
			expect(page.match('http://www.any.com/test.php?s=0')).toBeFalsy();
			expect(page.match('http://www.any.com/test.php?c=1')).toBeTruthy();
			expect(page.match('http://www.any.com/test.php?c=1&s=0')).toBeTruthy();
			expect(page.match('http://www.any.com/test.php?c=1&s=1')).toBeFalsy();
		});

		it('with path param', () => {
			
			let page = new Page('Testseite', 'rep/1/2.html');
			
			expect(page.match('http://www.any.com')).toBeFalsy();
			expect(page.match('http://www.any.com/rep.html')).toBeFalsy();
			expect(page.match('http://www.any.com/rep/1.html')).toBeFalsy();
			expect(page.match('http://www.any.com/rep/1/2.html')).toBeTruthy();
		});
	});
	
	describe('should return page by location', () => {

		it('with query params', () => {

			let showteamOverview = new Page.ShowteamOverview();
			let showteamSkills = new Page.ShowteamSkills();

			expect(Page.byLocation('http://www.any.com/test.php')).toBeUndefined();
			expect(Page.byLocation('http://www.any.com/showteam.php')).toEqual(showteamOverview);
			expect(Page.byLocation('http://www.any.com/showteam.php?s=2')).toEqual(showteamSkills);
			expect(Page.byLocation('http://www.any.com/showteam.php?s=4711')).toBeUndefined();
		});

		it('with mandatory query params', () => {

			let playerPage1 = new Page.ShowPlayer(1);
			let playerPage2 = new Page.ShowPlayer(2);
			
			expect(Page.byLocation('http://www.any.com/sp.php')).toBeUndefined();
			expect(Page.byLocation('http://www.any.com/sp.php?s=1')).toEqual(playerPage1);
			expect(Page.byLocation('http://www.any.com/sp.php?s=2')).toEqual(playerPage2);
		});
			
		it('with post params', () => {

			let matchDayReport = new Page.MatchDayReport();
			let matchDayReportWithParams = new Page.MatchDayReport(15, 42);

			expect(Page.byLocation('http://www.any.com/test.php')).toBeUndefined();
			expect(Page.byLocation('http://www.any.com/zar.php')).toEqual(matchDayReport);
			expect(Page.byLocation('http://www.any.com/zar.php')).not.toEqual(matchDayReportWithParams);
		});

		// TODO fix path param matching
		xit('with path params', () => {

			let reportPage = new Page.GameReport(15, 42, 1, 2);

			expect(Page.byLocation('http://www.any.com/rep/saison')).toBeUndefined();
			expect(Page.byLocation('http://www.any.com/rep/saison/14/41/2-1.html')).toBeUndefined();
			expect(Page.byLocation('http://www.any.com/rep/saison/15/42/1-2.html')).toEqual(reportPage);
		});
	});

	describe('should be checked', () => {
		
		let page;

		beforeEach(() => {		
			spyOn(Persistence, 'updateExtensionData').and.callFake((modifyData) => Promise.resolve());
			page = new Page();
		});
		
		it('without any error', () => {
			
			let fixture = Fixture.createDocument('Any content');
	
			expect(() => page.check(fixture)).not.toThrowError();		
		});

		it('and throw error if calculation is running', () => {
			
			let fixture = Fixture.createDocument('Für die Dauer von ZAT 42 sind die Seiten von OS 2.0 gesperrt!');
	
			expect(() => page.check(fixture)).toThrowError('Auswertung läuft');		
		});
		
		it('and throw error if user accessing office without authentication', () => {
			
			let fixture = Fixture.createDocument('Willkommen im Managerbüro von DemoTeam');
	
			expect(() => page.check(fixture)).toThrowError('Anmeldung erforderlich');
		});
	
		it('and throw error if user accessing team overview without authentication', () => {
			
			let fixture = Fixture.createDocument('<b>Demoteam</b>');
	
			expect(() => page.check(fixture)).toThrowError('Anmeldung erforderlich');
		});
	
		it('and throw error if user accessing private page without authentication', () => {
			
			let fixture = Fixture.createDocument('Diese Seite ist ohne Team nicht verfügbar!');
	
			expect(() => page.check(fixture)).toThrowError('Anmeldung erforderlich');
		});

	});
	
	describe('should be processed', () => {
		
		/** @type {Page} */ let page
		/** @type {Requestor} */ let requestor;
		/** @type {ExtensionData} */ let data;
		/** @type {HTMLElement} */ let frame;
		/** @type {Document} */ let doc
		
		beforeEach(() => {
			data = new ExtensionData();
			requestor = new Requestor();

			spyOn(Persistence, 'updateExtensionData').and.callFake((modifyData) => {
				modifyData(data);
				return Promise.resolve(data);
			});
			spyOn(Requestor, 'create').and.callFake(() => requestor);

			page = new Page();
			doc = Fixture.createDocument('test'); 

			frame = document.getElementById(Requestor.FRAME_ID);

		});

	    afterEach(() => {
	    	frame.parentNode.removeChild(frame);
	    });
	    		
		it('by extracting and extending simple page', (done) => {
			
			spyOn(page, 'extract');
			spyOn(page, 'extend').and.callFake(done);
			
			page.process(doc);
			
			expect(Persistence.updateExtensionData).toHaveBeenCalled();
			expect(page.extract).toHaveBeenCalled();
		});

		it('by notifying the embedding frame if page is loaded from request queue', (done) => {

			spyOn(page, 'extract');
			spyOn(frame, 'pageLoaded').and.callFake(done);
			
			page.process(frame.contentDocument, frame.contentWindow);
		});

		it('by notifying the embedding frame if page is loaded from request queue with additional pages to load', (done) => {

			let pagesToRequest = [new Page()];
			
			spyOn(page, 'extract').and.returnValue(pagesToRequest);
			spyOn(frame, 'requestAdditionalPages').and.callFake(pages => {
				expect(pages).toEqual(pagesToRequest);
				done();
			});

			page.process(frame.contentDocument, frame.contentWindow);
		});

		it('by starting and finishing a new request queue', (done) => {
			
			let pagesToRequest = [new Page()];
			
			spyOn(page, 'extract').and.returnValue(pagesToRequest);
			spyOn(requestor, 'addPage').and.callThrough();
			spyOn(requestor, 'start').and.callFake((triggerPage, _callback) => {
				expect(triggerPage).toEqual(page);
				done();
			});
			
			page.process(doc);			
		});
	});

});

