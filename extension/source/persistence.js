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
				/*eslint no-unsafe-finally: "off"*/
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
		if (data.team.name) {
			let storeFunction = (resolve, reject) => {
				let objectToStore = {
					[Persistence.CURRENT_TEAM]: data.team.name,
					[data.team.name]: JSON.parse(JSON.stringify(data))
				};
				chrome.storage.local.set(objectToStore, () => {
					if (chrome.runtime.lastError) {
						reject(new Error('Speichern der Teamdaten fehlgeschlagen: ' + chrome.runtime.lastError));
					} else {
						resolve(data);
					}
				});
			};
			return synchronized ? Persistence.getPromise(storeFunction) : new Promise(storeFunction);
		} else {
			return Promise.resolve(data);
		}
	}
	
}
