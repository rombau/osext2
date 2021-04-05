/**
 * Persistence layer of the extension.
 * 
 * Handles the chrome messaging with the background cache 
 * and the chrome storage of data to be persisted.
 */
class Persistence {
	
	/**
	 * @callback messageCallback
	 * @param {ExtensionData} data
	 */

	/**
	 * Returns the persisted data from cache or storage. If data was restored, the related flag is set.
	 * The data is sent as parameter to the given callback.
	 * 
	 * @param {messageCallback} callback is called when data was loaded from cache and/or restored
	 */
	static getData (callback) {
		chrome.runtime.sendMessage({}, data => {
			data = Object.assign(new ExtensionData(), data);
			if (data.currentTeam.name && !data.restored) {
				chrome.storage.local.get(data.currentTeam.name, stored => {
					data.currentTeam = Object.assign(new Team(), data.currentTeam);
					data.currentTeam.applyStorageData(stored[data.currentTeam.name]);
					data.restored = true;
					callback(data);
				});
			} else {
				callback(data);
			}
		});
	}

	/**
	 * Sends the given data to the background cache.
	 * The data (from cache) is sent as parameter to the given callback.
	 * 
	 * @param {ExtensionData} data 
	 * @param {messageCallback} callback is called when data was cached
	 */
	static setData (data, callback) {
		chrome.runtime.sendMessage({data}, callback);
	}

	/**
	 * Persists the intended team data (part of the given data).
	 * 
	 * @param {ExtensionData} data 
	 * @param {*} callback is called when data was persisted
	 */
	static persist (data, callback) {
		if (data.currentTeam.name) {
			let dataToPersist = {[data.currentTeam.name]: Object.assign(new Team(), data.currentTeam).getStorageData()};
			chrome.storage.local.set(dataToPersist, () => {
				callback();
			});
		} else {
			console.warn('No current team to persist data');
		}
	}
}
