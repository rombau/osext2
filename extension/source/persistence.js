/**
 * Persistence layer of the extension.
 * 
 * Handles the chrome storage calls.
 */
class Persistence {
	
	static CURRENT_TEAM = 'currentTeam';

	static LOGGER = new Logger('Persistence');

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
					Persistence.LOGGER.log('getExtensionData', Logger.prepare(storedData[teamName]));
					if (chrome.runtime.lastError) {
						reject(new Error('Laden der Teamdaten fehlgeschlagen: ' + chrome.runtime.lastError));
					} else {
						resolve(Object.assign(new ExtensionData(), storedData[teamName]));
					}
				});
			});
		} else {
			return Promise.reject(new Error('Laden der Teamdaten fehlgeschlagen: Name fehlt'));
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
		return Persistence.getPromise((resolve, reject) => {
			chrome.storage.local.get(Persistence.CURRENT_TEAM, (stored) => {
				let currentTeamName = stored[Persistence.CURRENT_TEAM];
				let extensionData;
				if (chrome.runtime.lastError) {
					reject(new Error('Laden der Teamdaten fehlgeschlagen: ' + chrome.runtime.lastError));
				} else if (!currentTeamName) {
					extensionData = new ExtensionData();
					try {
						Persistence.LOGGER.log('updateExtensionData', Logger.prepare(extensionData));
						modifyData(extensionData);
					} catch (e) {
						reject(e);
					}
					Persistence.storeExtensionData(extensionData).then(resolve, reject);
				} else {
					chrome.storage.local.get(currentTeamName, (storedData) => {
						if (chrome.runtime.lastError) {
							reject(new Error('Laden der Teamdaten fehlgeschlagen: ' + chrome.runtime.lastError));
						} else {
							extensionData = ensurePrototype(storedData[currentTeamName], ExtensionData) || new ExtensionData();
							try {
								Persistence.LOGGER.log('updateExtensionData', Logger.prepare(extensionData));
								modifyData(extensionData);
							} catch (e) {
								reject(e);
							}
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
		Persistence.LOGGER.log('storeExtensionData', Logger.prepare(data));
		if (data.team.name) {
			return new Promise((resolve, reject) => {
				let objectToStore = {
					[Persistence.CURRENT_TEAM]: data.team.name,
					[data.team.name]: data
				};
				chrome.storage.local.set(objectToStore, () => {
					if (chrome.runtime.lastError) {
						reject(new Error('Speichern der Teamdaten fehlgeschlagen: ' + chrome.runtime.lastError));
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
