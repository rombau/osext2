describe('Persistence', () => {
	
	let storageMock = {};
	
	beforeEach(() => {

		storageMock = {};

		chrome.runtime.lastError = undefined;

		spyOn(chrome.storage.local, 'get').and.callFake((key, callback) => {
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

		Persistence.getExtensionData('FC Cork').then(data => {
			expect(data.team.id).toEqual(1);
			expect(data instanceof ExtensionData).toBeTruthy();
			expect(chrome.storage.local.get).toHaveBeenCalled();
			done();
		}, error => {
			fail(error);
		});
	});

	it('should handle error when loading data', (done) => {

		chrome.runtime.lastError = 'Error';

		Persistence.getExtensionData('FC Cork').then(data => {
			fail();
		}, error => {
			expect(chrome.storage.local.get).toHaveBeenCalled();
			expect(error).toEqual('Loading team data failed: Error');
			done();
		});
	});

	it('should handle error when loading data without team', (done) => {

		Persistence.getExtensionData().then(data => {
			fail();
		}, error => {
			expect(chrome.storage.local.get).not.toHaveBeenCalled();
			expect(error).toEqual('Loading team data failed: No team name given');
			done();
		});
	});


	it('should store current team name', (done) => {

		Persistence.updateCurrentTeam('FC Cork').then(() => {
			expect(storageMock[Persistence.CURRENT_TEAM]).toEqual('FC Cork');
			done();
		}, _error => {
			fail();
		});
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
		}, _error => {
			fail();
		});
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
		}, _error => {
			fail();
		});
	});

	it('should handle error when store data', (done) => {

		chrome.runtime.lastError = 'Error';

		Persistence.updateExtensionData((data) => {
			data.team.id = 2;
		}).then(() => {
			fail();
		}, error => {
			expect(chrome.storage.local.get).toHaveBeenCalled();
			expect(error).toEqual('Loading team name failed: Error');
			done();
		});
	});

});
