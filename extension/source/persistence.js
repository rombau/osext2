/**
 * Persistence layer of the extension.
 * 
 * Handles the chrome storage calls.
 */
class Persistence {
	
	static CURRENT_TEAM = 'currentTeam';

	/**
	 * Returns a promise with the given operation. The new promise always waits for the last 
	 * requested promise to resolve. This ensures synchronized serial execution.
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
	 * Returns the extension data for the given team name from the local storage.
	 * 
	 * If loading is successful the data is returned with the resolved promise.
	 * 
	 * @async
	 * @param {String} teamName the name of the team
	 * @returns {Promise<ExtensionData>} promise with data when resolved
	 */
	static getExtensionData (teamName) {
		if (teamName) {
			return Persistence.getPromise((resolve, reject) => {
				chrome.storage.local.get(teamName, (storedData) => {
					if (chrome.runtime.lastError) {
						reject('Loading team data failed: ' + chrome.runtime.lastError);
					} else {
						resolve(new ExtensionData(storedData[teamName]));
					}
				});
			});
		} else {
			return Promise.reject('Loading team data failed: No team name given');
		}
	}

	/**
	 * Updates the current team name in local storage.
	 * 
	 * @param {String} teamName the name of the current team
	 * @returns {Promise}
	 */
	static updateCurrentTeam (teamName) {
		return Persistence.getPromise((resolve, reject) => {
			chrome.storage.local.set({[Persistence.CURRENT_TEAM]: teamName}, () => {
				if (chrome.runtime.lastError) {
					reject('Storing team name failed: ' + chrome.runtime.lastError);
				} else {
					resolve();
				}
			});
		});
	}

	/**
	 * @callback extendsionDataCallback
	 * @param {ExtensionData} data
	 */

	/**
	 * Updates the extension data of the current team in the local storage.
	 * 
	 * With the given callback the data can be modified before it is stored. If persisting is successful
	 * the data is returned with the resolved promise.
	 * 
	 * @async
	 * @param {extendsionDataCallback} modifyData callback for updating the data
	 * @returns {Promise<ExtensionData>} promise with data when resolved
	 */
	static updateExtensionData (modifyData = () => {}) {
		return Persistence.getPromise((resolve, reject) => {
			chrome.storage.local.get(Persistence.CURRENT_TEAM, (stored) => {
				let currentTeamName = stored[Persistence.CURRENT_TEAM];
				let extensionData;
				if (chrome.runtime.lastError) {
					reject('Loading team name failed: ' + chrome.runtime.lastError);
				} else if (!currentTeamName) {
					extensionData = new ExtensionData();
					modifyData(extensionData);
					Persistence.storeExtensionData(extensionData).then(resolve, reject);
				} else {
					chrome.storage.local.get(currentTeamName, (storedData) => {
						if (chrome.runtime.lastError) {
							reject('Loading team data failed: ' + chrome.runtime.lastError);
						} else {
							extensionData = new ExtensionData(storedData[currentTeamName]);
							modifyData(extensionData);
							Persistence.storeExtensionData(extensionData).then(resolve, reject);
						}
					});
				}
			});
		});
	}

	/**
	 * Stores the given extension data and set the current team name.
	 * 
	 * This method is not synchronized and data can be overridden by pending async calls!
	 * Use the synchronized Persistence.updateExtensionData instead, to avoid data loss.
	 * 
	 * @async
	 * @param {ExtensionData} data the data to store
	 * @returns {Promise<ExtensionData>} promise with data when resolved
	 */
	static storeExtensionData (data) {
		if (data.currentTeam.name) {
			return new Promise((resolve, reject) => {
				let objectToStore = {
					[Persistence.CURRENT_TEAM]: data.currentTeam.name,
					[data.currentTeam.name]: data
				};
				chrome.storage.local.set(objectToStore, () => {
					if (chrome.runtime.lastError) {
						reject('Storing team data failed: ' + chrome.runtime.lastError);
					} else {
						resolve(data);
					}
				});
			});
		} else {
			return Promise.resolve(data);
		}
	}
	
}
