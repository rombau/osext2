describe('Page', () => {
	
	describe('should return URL for request', () => {
		
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
			
			let page = new Page('Testseite', 'test.php', new Page.Param('c'), new Page.Param('s', '1'));
			
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
			
			let page = new Page('Testseite', 'test.php', new Page.Param('c'), new Page.Param('s', '0', true));
			
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
	
	it('should return page with query params by location', () => {

		expect(Page.byLocation('http://www.any.com/test.php')).toBeUndefined();
		expect(Page.byLocation('http://www.any.com/showteam.php')).toEqual(new ShowteamOverviewPage());
		expect(Page.byLocation('http://www.any.com/showteam.php?s=2')).toEqual(new ShowteamSkillsPage());
		expect(Page.byLocation('http://www.any.com/st.php?s=2&c=1')).toEqual(new TeamSkillsPage());
	});
		
	it('should return page with post params by location', () => {

		expect(Page.byLocation('http://www.any.com/test.php')).toBeUndefined();
		expect(Page.byLocation('http://www.any.com/zar.php')).toEqual(new MatchDayReportPage());
		expect(Page.byLocation('http://www.any.com/zar.php')).not.toEqual(new MatchDayReportPage(15, 42));
	});

	it('should return page with path params by location', () => {

		let reportPage = new GameReportPage(new MatchDay(15, 42), new Team(1), new Team(2));

		Page.register(reportPage);

		expect(Page.byLocation('http://www.any.com/rep/saison')).toBeUndefined();
		expect(Page.byLocation('http://www.any.com/rep/saison/14/41/2-1.html')).toBeUndefined();
		expect(Page.byLocation('http://www.any.com/rep/saison/15/42/1-2.html')).toEqual(reportPage);
	});

	describe('should be checked', () => {
		
		let page = new Page();
		
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
			page = new Page();
			queue = new Requestor();
			data = new ExtensionData();
			doc = Fixture.createDocument('test'); 

			frame = document.getElementById(Requestor.FRAME_ID);

			spyOn(Persistence, 'getCachedData').and.callFake((callback) => callback(data));
			spyOn(Persistence, 'setCachedData').and.callFake((data, callback) => callback(data));

			spyOn(Requestor, 'create').and.callFake(() => queue);

			spyOn(page, 'extend');
		});

	    afterEach(() => {
	    	frame.parentNode.removeChild(frame);
	    });
	    		
		it('by extracting and extending simple page', () => {
			
			spyOn(page, 'extract');
			
			page.process(doc);
			
			expect(Persistence.getCachedData).toHaveBeenCalled();
			expect(page.extract).toHaveBeenCalled();
			expect(Persistence.setCachedData).toHaveBeenCalled();
			expect(page.extend).toHaveBeenCalled();
		});

		it('by notifying the embedding frame if page is loaded from request queue', () => {

			spyOn(page, 'extract');
			spyOn(frame, 'pageLoaded');
			
			page.process(frame.contentDocument, frame.contentWindow);
			
			expect(frame.pageLoaded).toHaveBeenCalled();
			expect(page.extend).not.toHaveBeenCalled();
		});

		it('by notifying the embedding frame if page is loaded from request queue with additional pages to load', () => {

			let pagesToRequest = [new Page()];
			
			spyOn(page, 'extract').and.returnValue(pagesToRequest);
			spyOn(frame, 'requestAdditionalPages');
			spyOn(frame, 'pageLoaded');

			page.process(frame.contentDocument, frame.contentWindow);
			
			expect(frame.requestAdditionalPages).toHaveBeenCalledWith(pagesToRequest);
			expect(frame.pageLoaded).toHaveBeenCalled();
			expect(page.extend).not.toHaveBeenCalled();
		});

		it('by starting and finishing a new request queue', () => {
			
			let pagesToRequest = [new Page()];
			
			spyOn(page, 'extract').and.returnValue(pagesToRequest);
			spyOn(queue, 'addPage').and.callThrough();
			spyOn(queue, 'start').and.callFake((page, callback) => callback());
			
			page.process(doc);
			
			expect(queue.addPage).toHaveBeenCalledTimes(1);
			expect(queue.start).toHaveBeenCalled();
			expect(page.extend).toHaveBeenCalled();
		});
	});

});

