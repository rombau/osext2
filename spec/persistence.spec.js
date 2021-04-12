describe('Persistence', () => {
	
	/** @type {ExtensionData} */ let cachedData;
	/** @type {Team} */ let storedTeam;
	
	beforeEach(() => {
		cachedData = new ExtensionData();
		storedTeam = new Team();

		Persistence.localCachedData = undefined;
		chrome.runtime.lastError = undefined;

		spyOn(chrome.runtime, 'sendMessage').and.callFake((data, callback) => {
			setTimeout(callback, 10, cachedData);
		});

		spyOn(chrome.storage.local, 'get').and.callFake((key, callback) => {
			let object = {};
			object[key] = storedTeam;
			callback(object);
		});
		spyOn(chrome.storage.local, 'set').and.callFake((object, callback) => {
			storedTeam = object[Object.keys(object).find(key => object[key].id)];
			callback();
		});
	});
   
	it('should return data from the background cache', (done) => {

		cachedData.currentTeam.id = 1;

		let firstOkay = false;

		Persistence.getCachedData().then(data => {
			expect(data.currentTeam.id).toEqual(1);
			expect(data instanceof ExtensionData).toBeTruthy();
			expect(chrome.runtime.sendMessage).toHaveBeenCalled();
			firstOkay = true;
		}, error => {
			fail(error);
		});

		Persistence.getCachedData().then(() => {
			if (firstOkay) done();
		}, error => {
			fail(error);
		});
	});

	it('should handle error when getting data from the background cache', (done) => {

		chrome.runtime.lastError = 'Error';

		Persistence.getCachedData().then(() => {
			fail();
		}, error => {
			expect(chrome.runtime.sendMessage).toHaveBeenCalled();
			expect(error).toEqual('Caching failed: Error');
			done();
		});
	});

	it('should set data to the background cache', (done) => {

		cachedData.currentTeam.id = 1;

		Persistence.updateCachedData((data) => {
			data.currentTeam.id = 2;
		}).then(data => {
			expect(data.currentTeam.id).toEqual(2);
			expect(chrome.runtime.sendMessage).toHaveBeenCalled();
			done();
		}, _error => {
			fail();
		});
	});

	it('should handle error when setting data to the background cache', (done) => {

		cachedData.currentTeam.id = 1;
		chrome.runtime.lastError = 'Error';

		Persistence.updateCachedData((data) => {
			data.currentTeam.id = 2;
		}).then(() => {
			fail();
		}, error => {
			expect(chrome.runtime.sendMessage).toHaveBeenCalled();
			expect(error).toEqual('Caching failed: Error');
			done();
		});
	});

	it('should load team data from the local storage', (done) => {

		storedTeam.id = 1;
		storedTeam.name = 'Wanderers';

		Persistence.loadData('Wanderers').then((team) => {
			expect(team.id).toEqual(1);
			expect(team.name).toEqual('Wanderers');
			expect(team instanceof Team).toBeTruthy();
			expect(chrome.storage.local.get).toHaveBeenCalled();
			done();
		}, _error => {
			fail();
		});
	});

	it('should handle error when loading team data from the local storage', () => {

		chrome.runtime.lastError = 'Error';

		Persistence.loadData('Wanderers').then((_team) => {
			fail();
		}, error => {
			expect(chrome.storage.local.get).toHaveBeenCalled();
			expect(error).toEqual('Loading failed: Error');
			done();
		});
	});

	it('should handle error when loading team data from the local storage without team name', () => {

		Persistence.loadData(null).then((_team) => {
			fail();
		}, error => {
			expect(error).toEqual('Loading failed: Missing team name');
			done();
		});
	});

	it('should persist team data to the local storage', () => {

		storedTeam.id = 1;
		storedTeam.name = 'Wanderers';

		Persistence.persistData(new Team(2, 'Swallows')).then(() => {
			expect(storedTeam.id).toEqual(2);
			expect(storedTeam.name).toEqual('Swallows');
			expect(chrome.storage.local.set).toHaveBeenCalled();
			done();
		}, _error => {
			fail();
		});
	});

	it('should handle error when persisting team data to the local storage', () => {

		chrome.runtime.lastError = 'Error';

		Persistence.persistData(new Team(2, 'Swallows')).then(() => {
			fail();
		}, error => {
			expect(chrome.storage.local.set).toHaveBeenCalled();
			expect(error).toEqual('Persisting failed: Error');
			done();
		});
	});

	it('should handle error when persisting team data to the local storage without team name', () => {

		Persistence.persistData(new Team()).then(() => {
			fail();
		}, error => {
			expect(error).toEqual('Persisting failed: Missing team name');
			done();
		});
	});

});
