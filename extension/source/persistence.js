/**
 * Persistence layer of the extension.
 *
 * Handles the chrome storage calls.
 */
class Persistence {

	static CURRENT_TEAM = 'currentTeam';

	static LOGGER = new Logger('Persistence');

	/**
	 * Returns the extension data for the given team name from the local storage.
	 *
	 * If loading is successful the data is returned with the resolved promise.
	 *
	 * @async
	 * @returns {Promise<Object>} promise with data when resolved
	 */
	static getExtensionData () {
		return getQueuedPromise((resolve, reject) => {
			chrome.storage.local.get(Persistence.CURRENT_TEAM, (stored) => {
				let currentTeamName = stored[Persistence.CURRENT_TEAM];
				if (chrome.runtime.lastError) {
					reject(new Error('Laden der Teamdaten fehlgeschlagen: ' + chrome.runtime.lastError));
				} else if (!currentTeamName) {
					reject(new Error('Laden der Teamdaten fehlgeschlagen: Kein aktives Team'));
				} else {
					chrome.storage.local.get(currentTeamName, (storedData) => {
						if (chrome.runtime.lastError) {
							reject(new Error('Laden der Teamdaten fehlgeschlagen: ' + chrome.runtime.lastError));
						} else {
							resolve(storedData[currentTeamName]);
						}
					});
				}
			});
		});
	}

	/**
	 * Updates the current team name in local storage.
	 *
	 * @param {String} teamName the name of the current team
	 * @returns {Promise}
	 */
	static updateCurrentTeam (teamName) {
		return getQueuedPromise((resolve, reject) => {
			chrome.storage.local.set({[Persistence.CURRENT_TEAM]: teamName}, () => {
				if (chrome.runtime.lastError) {
					reject(new Error('Speichern der Teamdaten fehlgeschlagen: ' + chrome.runtime.lastError));
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
		return getQueuedPromise((resolve, reject) => {
			chrome.storage.local.get(Persistence.CURRENT_TEAM, (stored) => {
				let currentTeamName = stored[Persistence.CURRENT_TEAM];
				let extensionData;
				if (chrome.runtime.lastError) {
					reject(new Error('Laden der Teamdaten fehlgeschlagen: ' + chrome.runtime.lastError));
				} else if (!currentTeamName) {
					extensionData = new ExtensionData();
					try {
						modifyData(extensionData);
					} catch (e) {
						reject(e);
					}
					Persistence.storeExtensionData(extensionData, false).then(resolve, reject);
				} else {
					chrome.storage.local.get(currentTeamName, (storedData) => {
						if (chrome.runtime.lastError) {
							reject(new Error('Laden der Teamdaten fehlgeschlagen: ' + chrome.runtime.lastError));
						} else {
							extensionData = ensurePrototype(storedData[currentTeamName], ExtensionData) || new ExtensionData();
							try {
								modifyData(extensionData);
							} catch (e) {
								reject(e);
							}
							Persistence.storeExtensionData(extensionData, false).then(resolve, reject);
						}
					});
				}
			});
		});
	}

	/**
	 * Stores the given extension data only with a current team name.
	 *
	 * @async
	 * @param {ExtensionData} data the data to store
	 * @param {Boolean} synchronized flag indicating synchronization (default = true)
	 * @returns {Promise<ExtensionData>} promise with data when resolved
	 */
	static storeExtensionData (data, synchronized = true) {
		Persistence.LOGGER.log('storeExtensionData', Logger.prepare(data));
		if (data._team.name) {
			let storeFunction = (resolve, reject) => {
				let objectToStore = {
					[Persistence.CURRENT_TEAM]: data._team.name,
					[data._team.name]: Persistence.prepare(data)
				};
				chrome.storage.local.set(objectToStore, () => {
					if (chrome.runtime.lastError) {
						reject(new Error('Speichern der Teamdaten fehlgeschlagen: ' + chrome.runtime.lastError));
					} else {
						resolve(data);
					}
				});
			};
			return synchronized ? getQueuedPromise(storeFunction) : getTimedPromise(storeFunction);
		} else {
			return Promise.resolve(data);
		}
	}

	/**
	 * Prepares the extension data. Unnecessary functions and empty arrays/objects are removed.
	 * 
	 * @param {*} dataObject the data object to prepare
	 * @returns {*} prepared extension data
	 */
	static prepare (dataObject) {
		Object.entries(dataObject).forEach(([key, value]) => {
			if (value === null || (Array.isArray(value) && value.length === 0 && key.startsWith('_')) || key === 'sortedMatchDays') {
				delete dataObject[key];
			} else if (typeof value === 'object') {
				Persistence.prepare(value);
			}
		});
		return JSON.parse(JSON.stringify(dataObject));
	}
}
