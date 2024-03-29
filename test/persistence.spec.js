describe('Persistence', () => {

	let storageMock = {};

	beforeEach(() => {

		storageMock = {};

		Options.logDataElement = null;
		spyOn(Options, 'initialize').and.callFake(() => {});

		chrome.runtime.lastError = undefined;

		spyOn(chrome.storage.local, 'get').and.callFake((key, callback) => {
			console.error('test get', key);
			callback({[key]: storageMock[key]});
		});
		spyOn(chrome.storage.local, 'set').and.callFake((object, callback) => {
			Object.assign(storageMock, object);
			callback();
		});
	});

	it('should load data', (done) => {

		let data = new ExtensionData();
		data.team.id = 1;
		storageMock['FC Cork'] = data;
		storageMock[Persistence.CURRENT_TEAM] = 'FC Cork';

		Persistence.getExtensionData().then(data => {
			expect(data.team.id).toEqual(1);
			expect(data instanceof ExtensionData).toBeTruthy();
			expect(chrome.storage.local.get).toHaveBeenCalledTimes(2);
			done();
		}).catch(fail);
	});

	it('should handle error when loading data', (done) => {

		chrome.runtime.lastError = 'Error';

		Persistence.getExtensionData('FC Cork').then(fail).catch(error => {
			expect(chrome.storage.local.get).toHaveBeenCalled();
			expect(error.message).toEqual('Laden der Teamdaten fehlgeschlagen: Error');
			done();
		});
	});

	it('should handle error when loading data without team', (done) => {

		Persistence.getExtensionData().then(fail).catch(error => {
			expect(chrome.storage.local.get).toHaveBeenCalledTimes(1);
			expect(error.message).toEqual('Laden der Teamdaten fehlgeschlagen: Kein aktives Team');
			done();
		});
	});


	it('should store current team name', (done) => {

		Persistence.updateCurrentTeam('FC Cork').then(() => {
			expect(storageMock[Persistence.CURRENT_TEAM]).toEqual('FC Cork');
			done();
		}).catch(fail);
	});

	it('should store data', (done) => {

		let data = new ExtensionData();
		data.team.name = 'FC Cork';
		storageMock['FC Cork'] = data;
		storageMock[Persistence.CURRENT_TEAM] = 'FC Cork';

		Persistence.updateExtensionData((data) => {
			data.team.name = 'Wanderers';
		}).then(data => {
			expect(data.team.name).toEqual('Wanderers');
			expect(storageMock[Persistence.CURRENT_TEAM]).toEqual('Wanderers');
			expect(storageMock['Wanderers']).toBeDefined();
			expect(chrome.storage.local.get).toHaveBeenCalled();
			expect(chrome.storage.local.set).toHaveBeenCalled();
			done();
		}).catch(fail);
	});

	it('should store data not initialized', (done) => {

		Persistence.updateExtensionData((data) => {
			data.team.name = 'Wanderers';
		}).then(data => {
			expect(data.team.name).toEqual('Wanderers');
			expect(storageMock[Persistence.CURRENT_TEAM]).toEqual('Wanderers');
			expect(storageMock['Wanderers']).toBeDefined();
			expect(chrome.storage.local.get).toHaveBeenCalled();
			expect(chrome.storage.local.set).toHaveBeenCalled();
			done();
		}).catch(fail);
	});

	it('should handle error when store data', (done) => {

		chrome.runtime.lastError = 'Error';

		Persistence.updateExtensionData((data) => {
			data.team.id = 2;
		}).then(fail).catch(error => {
			expect(chrome.storage.local.get).toHaveBeenCalled();
			expect(error.message).toEqual('Laden der Teamdaten fehlgeschlagen: Error');
			done();
		});
	});

});
