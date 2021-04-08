describe('Persistence', () => {
	
	/** @type {ExtensionData} */ let cachedData;
	/** @type {Team} */ let storedTeam;
	
	beforeEach(() => {
		cachedData = new ExtensionData();
		storedTeam = new Team();

		chrome.runtime.lastError = undefined;

		spyOn(chrome.runtime, 'sendMessage').and.callFake((data, callback) => callback(cachedData));

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
   
	it('should return data from the background cache', () => {

		cachedData.currentTeam.id = 1;

		Persistence.getCachedData(data => {
			expect(data.currentTeam.id).toEqual(1);
			expect(data instanceof ExtensionData).toBeTruthy();
			expect(chrome.runtime.sendMessage).toHaveBeenCalled();
		}, _error => {
			fail();
		});
	});

	it('should handle error when getting data from the background cache', () => {

		chrome.runtime.lastError = 'Error';

		Persistence.getCachedData(_data => {
			fail();
		}, error => {
			expect(chrome.runtime.sendMessage).toHaveBeenCalled();
			expect(error).toEqual('Caching failed: Error');
		});
	});

	it('should set data to the background cache', () => {

		let newData = new ExtensionData();
		newData.currentTeam.id = 1;
		newData.currentTeam.name = 'Wanderers';

		Persistence.setCachedData(newData, data => {
			expect(data.currentTeam.id).toEqual(1);
			expect(data.currentTeam.name).toEqual('Wanderers');
			expect(chrome.runtime.sendMessage).toHaveBeenCalled();
		}, _error => {
			fail();
		});
	});

	it('should handle error when setting data to the background cache', () => {

		chrome.runtime.lastError = 'Error';

		Persistence.setCachedData(new ExtensionData(), _data => {
			fail();
		}, error => {
			expect(chrome.runtime.sendMessage).toHaveBeenCalled();
			expect(error).toEqual('Caching failed: Error');
		});
	});

	it('should load team data from the local storage', () => {

		storedTeam.id = 1;
		storedTeam.name = 'Wanderers';

		Persistence.loadData('Wanderers', team => {
			expect(team.id).toEqual(1);
			expect(team.name).toEqual('Wanderers');
			expect(team instanceof Team).toBeTruthy();
			expect(chrome.storage.local.get).toHaveBeenCalled();
		}, _error => {
			fail();
		});
	});

	it('should handle error when loading team data from the local storage', () => {

		chrome.runtime.lastError = 'Error';

		Persistence.loadData('Wanderers', _team => {
			fail();
		}, error => {
			expect(chrome.storage.local.get).toHaveBeenCalled();
			expect(error).toEqual('Loading failed: Error');
		});
	});

	it('should handle error when loading team data from the local storage without team name', () => {

		Persistence.loadData(null, _team => {
			fail();
		}, error => {
			expect(error).toEqual('Loading failed: Missing team name');
		});
	});

	it('should persist team data to the local storage', () => {

		storedTeam.id = 1;
		storedTeam.name = 'Wanderers';

		Persistence.persistData(new Team(2, 'Swallows'), () => {
			expect(storedTeam.id).toEqual(2);
			expect(storedTeam.name).toEqual('Swallows');
			expect(chrome.storage.local.set).toHaveBeenCalled();
		}, _error => {
			fail();
		});
	});

	it('should handle error when persisting team data to the local storage', () => {

		chrome.runtime.lastError = 'Error';

		Persistence.persistData(new Team(2, 'Swallows'), () => {
			fail();
		}, error => {
			expect(chrome.storage.local.set).toHaveBeenCalled();
			expect(error).toEqual('Persisting failed: Error');
		});
	});

	it('should handle error when persisting team data to the local storage without team name', () => {

		Persistence.persistData(new Team(), () => {
			fail();
		}, error => {
			expect(error).toEqual('Persisting failed: Missing team name');
		});
	});

});
