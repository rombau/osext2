
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
			
			expect(() => { page.createUrl(); }).toThrowError(/Parameter s fehlt \(url: .+\)/);
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
			
			let page = new Page('Testseite', 'test.php', new Page.Param('s', '1', true));
			
			expect(page.match('http://www.any.com')).toBeFalsy();
			expect(page.match('http://www.any.com/showit.php')).toBeFalsy();
			expect(page.match('http://www.any.com/test.php')).toBeTruthy();
			expect(page.match('http://www.any.com/test.php?any')).toBeTruthy();
			expect(page.match('http://www.any.com/test.php?s')).toBeTruthy();
			expect(page.match('http://www.any.com/test.php?s=')).toBeTruthy();
			expect(page.match('http://www.any.com/test.php?s=0')).toBeFalsy();
			expect(page.match('http://www.any.com/test.php?any&s=0&any')).toBeFalsy();
			expect(page.match('http://www.any.com/test.php?s=1')).toBeTruthy();
			expect(page.match('http://www.any.com/test.php?xyz=xyz&s=1&all=true')).toBeTruthy();
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

		beforeEach(() => { 
			jasmine.addMatchers({ 
				toEqualWithoutLogger: (matchersUtil) => {
					return {    
						compare: function(actual, expected) {
							delete actual.logger;
							delete expected.logger;
							let result = {};
							result.pass = matchersUtil.equals(actual, expected);
							if (!result.pass) {
								result.message = `Expected ${actual} to equal ${expected}`;
							}
							return result;
						}   
					};   
				}    
			});    
		});
		
		it('with query params', () => {

			let showteamOverview = new Page.ShowteamOverview();
			let showteamSkills = new Page.ShowteamSkills();

			expect(Page.byLocation('http://www.any.com/test.php')).toBeUndefined();

			expect(Page.byLocation('http://www.any.com/showteam.php')).toEqualWithoutLogger(showteamOverview);
			expect(Page.byLocation('http://www.any.com/showteam.php?s=2')).toEqualWithoutLogger(showteamSkills);
			expect(Page.byLocation('http://www.any.com/showteam.php?s=4711')).toBeUndefined();
		});

		it('with mandatory query params', () => {

			let playerPage1 = new Page.ShowPlayer(1);
			let playerPage2 = new Page.ShowPlayer(2);
			
			expect(Page.byLocation('http://www.any.com/sp.php')).toBeUndefined();
			expect(Page.byLocation('http://www.any.com/sp.php?s=1')).toEqualWithoutLogger(playerPage1);
			expect(Page.byLocation('http://www.any.com/sp.php?s=2')).toEqualWithoutLogger(playerPage2);
		});
			
		it('with post params', () => {

			let matchDayReport = new Page.MatchDayReport();
			let matchDayReportWithParams = new Page.MatchDayReport(15, 42);

			expect(Page.byLocation('http://www.any.com/test.php')).toBeUndefined();
			expect(Page.byLocation('http://www.any.com/zar.php')).toEqualWithoutLogger(matchDayReport);
			expect(Page.byLocation('http://www.any.com/zar.php')).not.toEqualWithoutLogger(matchDayReportWithParams);
		});

		// TODO fix path param matching
		xit('with path params', () => {

			let reportPage = new Page.GameReport(15, 42, 1, 2);

			expect(Page.byLocation('http://www.any.com/rep/saison')).toBeUndefined();
			expect(Page.byLocation('http://www.any.com/rep/saison/14/41/2-1.html')).toBeUndefined();
			expect(Page.byLocation('http://www.any.com/rep/saison/15/42/1-2.html')).toEqualWithoutLogger(reportPage);
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
	
		it('and throw error if user accessing private page without authentication', () => {
			
			let fixture = Fixture.createDocument('Diese Seite ist ohne Team nicht verfügbar!');
	
			expect(() => page.check(fixture)).toThrowError('Anmeldung erforderlich');
		});

		it('and throw error if user accessing page during season interval', () => {
			
			let fixture = Fixture.createDocument('Diese Funktion ist erst ZAT 1 wieder verfügbar!');
	
			expect(() => page.check(fixture)).toThrowError('Saisonwechsel läuft');
		});
	});
	
	describe('should handle', () => {

		/** @type {ExtensionData} */ let data;

		beforeEach(() => {
			data = new ExtensionData();

			spyOn(Requestor, 'cleanUp').and.callFake(() => {});
			spyOn(Persistence, 'updateExtensionData').and.callFake((modifyData) => {
				modifyData(data);
				return Promise.resolve(data);
			});
		});

		it('warning', () => {
			
			Page.handleError(new Warning('test'));

			let messageBox = document.querySelector('.' + STYLE_WARNING);

			expect(messageBox).toBeDefined();
			expect(messageBox.lastChild.textContent).toEqual('test');
		});

		it('error', () => {
			
			Page.handleError(new Error('test'));

			let messageBox = document.querySelector('.' + STYLE_ERROR);

			expect(messageBox).toBeDefined();
			expect(messageBox.lastChild.textContent).toEqual('test');
		});
	});

	describe('should be processed', () => {
		
		/** @type {Page} */ let page
		/** @type {Requestor} */ let requestor;
		/** @type {ExtensionData} */ let data;
		
		beforeEach(() => {
			data = new ExtensionData();
			data.nextZat = 7;
			requestor = null;
						
			Options.logDataElement = null;

			spyOn(Persistence, 'updateExtensionData').and.callFake((modifyData) => {
				try {
					modifyData(data);
					return Promise.resolve(data);
				} catch (e) {
					return Promise.reject(e.message);
				}
			});
			spyOn(Persistence, 'storeExtensionData').and.callFake(() => {
				return Promise.resolve();
			});
			spyOn(Requestor, 'cleanUp').and.callFake(() => {});
			
			page = new Page();
		});

		afterEach(() => {
			if (requestor) requestor.finish();
		});
	    		
		it('by extracting and extending single page', (done) => {
			
			spyOn(Requestor, 'getCurrent').and.returnValue(null);

			spyOn(page, 'extract');
			spyOn(page, 'extend').and.callFake(() => {done();});
			
			page.process(document);
			
			expect(Persistence.updateExtensionData).toHaveBeenCalled();
			expect(page.extract).toHaveBeenCalled();
		});

		it('before basic initialization', (done) => {

			data.nextZat = null;
			requestor = Requestor.create(document);

			spyOn(Requestor, 'getCurrent').and.returnValue(null);
			spyOn(Requestor, 'create').and.returnValue(requestor);

			spyOn(requestor, 'requestPage').and.callFake((page) => {
				expect(page.equals(new Page.Main())).toBeTruthy();
				done();
			});
			
			page.process(document);
		});

		it('with warning on extracting', (done) => {
			
			spyOn(Requestor, 'getCurrent').and.returnValue(null);

			spyOn(page, 'extract').and.callFake(() => {
				throw new Warning('TheWarning');
			});
			spyOn(Page, 'handleError').and.callFake(() => {
				done();
			});
			
			page.process(document);
		});

		it('with error on extending', (done) => {
			
			spyOn(Requestor, 'getCurrent').and.returnValue(null);

			spyOn(page, 'extend').and.callFake(() => {
				throw new Error('TheError');
			});
			spyOn(Page, 'handleError').and.callFake(() => {
				done();
			});
			
			page.process(document);
		});
	
		it('by start requesting further pages', (done) => {

			requestor = Requestor.create(document);

			let firstPage = new Page('Test1', 'test1.html');

			data.pagesToRequest.push(firstPage);
			
			spyOn(Requestor, 'getCurrent').and.returnValue(null);
			spyOn(Requestor, 'create').and.returnValue(requestor);

			spyOn(requestor, 'requestPage').and.callFake((page) => {
				expect(page).toBe(firstPage);
				done();
			});

			page.process(document);			
		});

		it('by continue requesting further pages', (done) => {
		
			requestor = Requestor.create(document);

			let firstPage = new Page('Test1', 'test1.html');
			let lastPage = new Page('Test2', 'test2.html');

			data.pagesToRequest.push(firstPage);
			data.pagesToRequest.push(lastPage);
			
			spyOn(Requestor, 'getCurrent').and.returnValue(requestor);

			spyOn(requestor, 'requestPage').and.callFake((page) => {
				expect(page).toBe(lastPage);
				done();
			});

			firstPage.process(document);
		});

		it('by finish requesting further pages', (done) => {
			
			let firstPage = new Page('Test1', 'test1.html');
			let lastPage = new Page('Test2', 'test2.html');
			
			data.pagesToRequest.push(firstPage);
			data.pagesToRequest.push(lastPage);
			
			let originalRequestorCreate = Requestor.create;
			spyOn(Requestor, 'create').and.callFake((doc, finished) => {
				requestor = originalRequestorCreate(document, finished);
				spyOn(requestor, 'requestPage').and.callFake((page) => {
					page.process(document);
				});
				return requestor;
			});

			spyOn(Requestor, 'getCurrent').and.callFake(() => {
				return requestor;
			});

			spyOn(data, 'complete').and.callFake(() => {
				expect(data.pagesToRequest.length).toEqual(0);
				requestor = null;
				done();
			});

			firstPage.process(document);
		});
	});

});

