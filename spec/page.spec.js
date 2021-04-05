describe('Page', () => {
	
	describe('should return URL', () => {
		
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
		
		it('with dynamic param', () => {
			
			let page = new Page('Testseite', 'xyz.php', new Page.Param('s'));
			
			expect(page.createUrl({s:1})).toMatch(/xyz\.php\?s=1/);
		});
		
		it('with multiple params', () => {
			
			let page = new Page('Testseite', 'xyz.php',
				new Page.Param('s', '0', true),
				new Page.Param('t', '1'),
				new Page.Param('u', '2', true),
				new Page.Param('v', '3', false));
			
			expect(page.createUrl()).toMatch(/xyz\.php\?t=1\&v=3/);
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
	});
	
	it('should return page by location', () => {

		expect(Page.byLocation('http://www.any.com/test.php')).toBeUndefined();
		expect(Page.byLocation('http://www.any.com/showteam.php')).toEqual(new ShowteamOverviewPage());
		expect(Page.byLocation('http://www.any.com/showteam.php?s=2')).toEqual(new ShowteamSkillsPage());
		expect(Page.byLocation('http://www.any.com/st.php?s=2&c=1')).toEqual(new StSkillsPage());
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
		
		let data, queue, frame, page = new Page();
		
		beforeEach(() => {
			queue = new RequestQueue();
			data = new ExtensionData();
			data.initialized = true;
			frame = document.getElementById(RequestQueue.FRAME_ID);
			spyOn(chrome.runtime, 'sendMessage').and.callFake((message, callback) => {
				if (callback) callback(data);
			});
			spyOn(page, 'extend');
		});

	    afterEach(() => {
	    	frame.parentNode.removeChild(frame);
	    });
	    		
		it('by extracting and extending simple page', () => {
			
			spyOn(page, 'extract');
			
			let doc = Fixture.createDocument('test'); 
			
			page.process(doc);
			
			expect(chrome.runtime.sendMessage).toHaveBeenCalled();
			expect(page.extract).toHaveBeenCalled();
			expect(page.extend).toHaveBeenCalled();
		});

		it('by notifying the embedding frame if page is loaded from request queue', () => {

			spyOn(page, 'extract');
			spyOn(frame, 'readyAfterLoad');
			
			page.process(frame.contentDocument, null, frame.contentWindow);
			
			expect(page.extend).not.toHaveBeenCalled();
			expect(frame.readyAfterLoad).toHaveBeenCalled();
		});

		it('by notifying the embedding frame if page is loaded from request queue with additional pages to load', () => {

			let additionalPages = [{url:'', name:''}];
			
			spyOn(page, 'extract').and.returnValue(additionalPages);
			spyOn(frame, 'readyAfterLoad');
			
			page.process(frame.contentDocument, null, frame.contentWindow);
			
			expect(page.extend).not.toHaveBeenCalled();
			expect(frame.readyAfterLoad).toHaveBeenCalledWith(additionalPages);
		});

		it('by starting the initializer queue when not initialized', () => {
			
			spyOn(page, 'extract');
			
			spyOn(chrome.storage.local, 'get').and.callFake((key, callback) => {
				if (callback) callback({});
			});
			spyOn(chrome.storage.local, 'set').and.callFake((object, callback) => {
				if (callback) callback();
			});

			let doc = Fixture.createDocument('test'); 
			data.initialized = false;
			data.currentTeam.name = 'TheName';
			
			page.process(doc, queue);
			
			expect(chrome.storage.local.get).toHaveBeenCalled();
			expect(chrome.storage.local.set).toHaveBeenCalled();
			expect(page.extend).toHaveBeenCalled();
			expect(data.initialized).toBeTruthy();
		});
	});

});

