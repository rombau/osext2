describe('Page', () => {
	
	describe('should return URL for request', () => {
		
		beforeEach(() => {		
			spyOn(Persistence, 'updateCachedData').and.callFake((modifyData) => Promise.resolve());
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
			spyOn(Persistence, 'updateCachedData').and.callFake((modifyData) => Promise.resolve());
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

		/** @type {ExtensionData} */ let data;

		beforeEach(() => {
			
			data = new ExtensionData();

			spyOn(Persistence, 'getCachedData').and.callFake(() => Promise.resolve(JSON.parse(JSON.stringify(data))));
			spyOn(Persistence, 'updateCachedData').and.callFake((modifyData) => {
				modifyData(data);
				return Promise.resolve();
			});
		});

		it('with query params', () => {

			let showteamOverview = new ShowteamOverviewPage();
			let showteamSkills = new ShowteamSkillsPage();

			Page.byLocation('http://www.any.com/test.php', page => expect(page).toBeUndefined());
			Page.byLocation('http://www.any.com/showteam.php', page => expect(page).toEqual(showteamOverview));
			Page.byLocation('http://www.any.com/showteam.php?s=2', page => expect(page).toEqual(showteamSkills));
			Page.byLocation('http://www.any.com/showteam.php?s=4711', page => expect(page).toBeUndefined());
		});

		it('with mandatory query params', () => {

			Page.byLocation('http://www.any.com/sp.php?s=1', page => expect(page).toBeUndefined());
			Page.byLocation('http://www.any.com/sp.php?s=2', page => expect(page).toBeUndefined());

			let playerPage1 = new ShowPlayerPage(1);
			let playerPage2 = new ShowPlayerPage(2);
			
			Page.byLocation('http://www.any.com/test.php', page => expect(page).toBeUndefined());
			Page.byLocation('http://www.any.com/sp.php?s=1', page => expect(page).toEqual(playerPage1));
			Page.byLocation('http://www.any.com/sp.php?s=2', page => expect(page).toEqual(playerPage2));
		});
			
		it('with post params', () => {

			let matchDayReport = new MatchDayReportPage();
			let matchDayReportWithParams = new MatchDayReportPage(15, 42);

			Page.byLocation('http://www.any.com/test.php', page => expect(page).toBeUndefined());
			Page.byLocation('http://www.any.com/zar.php', page => expect(page).toEqual(matchDayReport));
			Page.byLocation('http://www.any.com/zar.php', page => expect(page).not.toEqual(matchDayReportWithParams));
		});

		it('with path params', () => {

			let reportPage = new GameReportPage(15, 42, 1, 2);

			Page.byLocation('http://www.any.com/rep/saison', page => expect(page).toBeUndefined());
			Page.byLocation('http://www.any.com/rep/saison/14/41/2-1.html', page => expect(page).toBeUndefined());
			Page.byLocation('http://www.any.com/rep/saison/15/42/1-2.html', page => expect(page).toEqual(reportPage));
		});
	});

	describe('should be checked', () => {
		
		let page;

		beforeEach(() => {		
			spyOn(Persistence, 'updateCachedData').and.callFake((modifyData) => Promise.resolve());
			page = new Page();
		});
		
		it('and throw error if calculation is running', () => {
			
			let fixture = Fixture.createDocument('Für die Dauer von ZAT 42 sind die Seiten von OS 2.0 gesperrt!');
	
			expect(() => page.check(fixture)).toThrowError('Auswertung läuft!');		
		});
		
		it('and throw error if user accessing office without authentication', () => {
			
			let fixture = Fixture.createDocument('Willkommen im Managerbüro von DemoTeam');
	
			expect(() => page.check(fixture)).toThrowError('Anmeldung erforderlich!');
		});
	
		it('and throw error if user accessing team overview without authentication', () => {
			
			let fixture = Fixture.createDocument('<b>Demoteam</b>');
	
			expect(() => page.check(fixture)).toThrowError('Anmeldung erforderlich!');
		});
	
		it('and throw error if user accessing private page without authentication', () => {
			
			let fixture = Fixture.createDocument('Diese Seite ist ohne Team nicht verfügbar!');
	
			expect(() => page.check(fixture)).toThrowError('Anmeldung erforderlich!');
		});

	});
	
	describe('should be processed', () => {
		
		/** @type {Page} */ let page
		/** @type {Requestor} */ let queue;
		/** @type {ExtensionData} */ let data;
		/** @type {HTMLElement} */ let frame;
		/** @type {Document} */ let doc
		
		beforeEach(() => {
			data = new ExtensionData();
			queue = new Requestor();

			spyOn(Persistence, 'updateCachedData').and.callFake((modifyData) => {
				modifyData(data);
				return Promise.resolve(data);
			});
			spyOn(Requestor, 'create').and.callFake(() => queue);

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
			
			expect(Persistence.updateCachedData).toHaveBeenCalled();
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
			spyOn(queue, 'addPage').and.callThrough();
			spyOn(queue, 'start').and.callFake((triggerPage, _callback) => {
				expect(triggerPage).toEqual(page);
				done();
			});
			
			page.process(doc);			
		});
	});

});

