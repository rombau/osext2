/**
 * Persistence layer of the extension.
 * 
 * Handles the chrome messaging with the background cache 
 * and the chrome storage of data to be persisted.
 */
class Persistence {
	
	/** @type {ExtensionData} local data cache remains as long there is no new page loaded */
	static localCachedData = undefined;

	/**
	 * Returns a promise with the given operation. The new promise always waits for the last 
	 * requested promise to resolve. This ensures synchronized access on the background cache
	 * data.
	 * 
	 * @returns {Promise}
	 */
	static getPromise = (() => {
		let pending = Promise.resolve();
		const run = async (operation) => {
			try {
				await pending;
			} finally {
				return new Promise(operation);
			}
		}
		return (operation) => (pending = run(operation));
	})();

	/**
	 * Returns the data from the background cache. 
	 * The data is sent back with the resolved promise.
	 * 
	 * @async
	 * @returns {Promise} resolved promise returns the data
	 */
	static getCachedData () {
		if (Persistence.localCachedData) {
			return Promise.resolve(Persistence.localCachedData);
		}
		return Persistence.getPromise((resolve, reject) => {
			chrome.runtime.sendMessage({}, data => {
				if (chrome.runtime.lastError) {
					reject('Caching failed: ' + chrome.runtime.lastError);
				} else {
					Persistence.localCachedData = Object.assign(new ExtensionData(), data)
					resolve(Persistence.localCachedData);
				}
			});
		});
	}

	/**
	 * @callback modifyDataCallback
	 * @param {ExtensionData} data
	 */

	/**
	 * Updates the cached data in the background cache.
	 * The cached data referenrce can be modified in the given callback.
	 * The data is sent back with the resolved promise.
	 * 
	 * @async
	 * @param {modifyDataCallback} modifyData 
	 * @returns {Promise} resolved promise returns the data
	 */
	static updateCachedData (modifyData = (_data) => {}) {
		return Persistence.getPromise((resolve, reject) => {
			let sendStoreMessage = (data) => chrome.runtime.sendMessage({data}, () => {
				if (chrome.runtime.lastError) {
					reject('Caching failed: ' + chrome.runtime.lastError);
				} else {
					resolve(data);
				}
			});
			if (Persistence.localCachedData) {
				modifyData(Persistence.localCachedData);
				sendStoreMessage(Persistence.localCachedData);
			} else {
				chrome.runtime.sendMessage({}, data => {
					if (chrome.runtime.lastError) {
						reject('Caching failed: ' + chrome.runtime.lastError);
					} else {
						Persistence.localCachedData = Object.assign(new ExtensionData(), data);
						modifyData(Persistence.localCachedData);
						sendStoreMessage(Persistence.localCachedData);
					}
				});
			}
		});
	}

	/**
	 * Loads the team data by team name from the local storage.
	 * The data is sent back with the resolved promise.
	 * 
	 * @async
	 * @param {String} teamName the name of the team
	 * @returns {Promise} resolved promise returns the data
	 */
	static loadData (teamName) {
		return new Promise((resolved, reject) => {
			if (teamName) {
				chrome.storage.local.get(teamName, stored => {
					if (chrome.runtime.lastError) {
						reject('Loading failed: ' + chrome.runtime.lastError);
					} else {
						let restoredTeam = Object.assign(new Team(), stored[teamName]);
						resolved(restoredTeam);
					}
				});
			} else {
				reject('Loading failed: Missing team name');
			}
		});
	}

	/**
	 * Persists the team data in the local storage with the team name. 
	 * Given team should only contain data not availaible after reinitialization.
	 * The resolved promise indicates success.
	 * 
	 * @async
	 * @param {Team} data the team data that should be stored.
	 * @returns {Promise} resolved promise returns the data
	 */
	static persistData (team) {
		return new Promise((resolved, reject) => {
			if (team.name) {
				chrome.storage.local.set({[team.name]: team}, () => {
					if (chrome.runtime.lastError) {
						reject('Persisting failed: ' + chrome.runtime.lastError);
					} else {
						resolved();
					}
				});
			} else {
				reject('Persisting failed: Missing team name');
			}
		});
	}
}
