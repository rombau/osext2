/**
 * Persistence layer of the extension.
 * 
 * Handles the chrome messaging with the background cache 
 * and the chrome storage of data to be persisted.
 */
class Persistence {
	
	/**
	 * @callback cacheCallback
	 * @param {ExtensionData} data
	 */

	/**
	 * Returns the data from the background cache. 
	 * The data is sent as parameter to the given callback.
	 * 
	 * @async
	 * @param {cacheCallback} success is called when data was loaded from cache and/or restored
	 * @param failed is called when something went wrong
	 */
	static getCachedData (success = () => {}, failed = () => {}) {
		chrome.runtime.sendMessage({}, data => {
			if (chrome.runtime.lastError) {
				failed('Caching failed: ' + chrome.runtime.lastError);
			} else {
				data = Object.assign(new ExtensionData(), data);
				success(data);
			}
		});
	}

	/**
	 * Sends the given data to the background cache.
	 * The data is sent as parameter to the given callback.
	 * 
	 * @async
	 * @param {ExtensionData} data 
	 * @param {cacheCallback} success is called when data was cached
	 * @param failed is called when something went wrong
	 */
	static setCachedData (data, success = () => {}, failed = () => {}) {
		chrome.runtime.sendMessage({data}, () => {
			if (chrome.runtime.lastError) {
				failed('Caching failed: ' + chrome.runtime.lastError);
			} else {
				success(data);
			}
		});
	}

	/**
	 * @callback storageCallback
	 * @param {Team} team
	 */

	/**
	 * Loads the team data by team name from the local storage.
	 * The data is sent as parameter to the given callback.
	 * 
	 * @async
	 * @param {String} teamName the name of the team
	 * @param {storageCallback} success is called when team was restored
	 * @param failed is called when something went wrong
	 */
	static loadData (teamName, success = () => {}, failed = () => {}) {
		if (teamName) {
			chrome.storage.local.get(teamName, stored => {
				if (chrome.runtime.lastError) {
					failed('Loading failed: ' + chrome.runtime.lastError);
				} else {
					let restoredTeam = Object.assign(new Team(), stored[teamName]);
					success(restoredTeam);
				}
			});
		} else {
			failed('Loading failed: Missing team name');
		}
	}

	/**
	 * Persists the team data in the local storage with the team name. The team 
	 * The given callback is called on success.
	 * 
	 * @async
	 * @param {Team} data the team data that should be stored. Should only contain data not availaible after reinitialization.
	 * @param success is called when data was persisted
	 * @param failed is called when something went wrong
	 */
	static persistData (team, success = () => {}, failed = () => {}) {
		if (team.name) {
			chrome.storage.local.set({[team.name]: team}, () => {
				if (chrome.runtime.lastError) {
					failed('Persisting failed: ' + chrome.runtime.lastError);
				} else {
					success();
				}
			});
		} else {
			failed('Persisting failed: Missing team name');
		}
	}
}
