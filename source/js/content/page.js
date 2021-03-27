class Page {
	constructor(name, path, ...params) {
		this.name = name;
		this.path = path;
		this.params = params;
		this.extract = () => { };
		this.extend = () => { };
	}

	match(location) {
		let url = new URL(location, document.location.href);
		if (!url.pathname.includes(this.path)) {
			return false;
		}
		return this.params.every(param => {
			let value = url.searchParams.get(param.name);
			return value ? (param.value === undefined || value == param.value) : param.optional;
		});
	}

	createUrl(...params) {
		let url = new URL(this.path, document.location.href);
		this.params.forEach((param) => {
			let value = param.value;
			if (!value) {
				let givenParam = params.find(p => p[param.name]);
				if (givenParam) {
					value = givenParam[param.name];
				}
			}
			if (!param.optional) {
				if (!value) {
					throw new Error(`Value for ${param.name} (url: ${url}) is missing.`);
				}
				url.searchParams.append(param.name, value);
			}
		});
		return url;
	}

	/**
	 * Returns the registered page for a given document location.
	 * 
	 * @param {string} location of the document
	 * @returns {Page} the registered page 
	 */
	static byLocation(location) {
		let page = Object.values(Page).find(registered => {
			return registered && registered instanceof Page && registered.match(location);
		});
		if (page) {
			console.info(`${page.name} found for ${location}.`);
			return page;
		}
		console.log(`No page registered for ${location}`);
		return null;
	}

	/**
	 * Checks the given document if a current calculation is running or a login is required.
	 * 
	 * @param {Document} doc the document that should be checked
	 */
	check(doc) {
		if (doc.body.textContent.search(/F.+r\sdie\sDauer\svon\sZAT\s.+\ssind\sdie\sSeiten\svon\sOS\s2\.0\sgesperrt!/) != -1) {
			throw new Error('Es läuft derzeit eine Auswertung.');
		}
		if (doc.body.textContent.search(/(Willkommen im Managerb.+ro von )*Demo[T|t]eam/) != -1 ||
			doc.body.textContent.search(/Diese Seite ist ohne Team nicht verf.+gbar!/) != -1) {
			throw new Error('Es ist eine Anmeldung erforderlich.');
		}
	}

	/**
	 * Processes the given document.
	 * 
	 * @param {Document} doc the document that should be processed
	 * @param {RequestQueue} initQueue the initialization request queue
	 * @param {Window} win the current window
	 */
	process(doc, initQueue, win = window) {
		let page = this;
		Storage.getData(data => {
			let additionalPagesToLoad = page.extract(doc, data);
			Storage.setData(data, data => {
				if (win.frameElement && win.frameElement.id === RequestQueue.FRAME_ID) {
					win.frameElement.loadedAndCached(additionalPagesToLoad);
				} else {
					if (data.initialized) {
						page.extend(doc, data);
					} else {
						initQueue.start(page, (doc, data) => {
							data.initialized = true;
							Storage.persist(data, () => page.extend(doc, data));
						});
					}
				}
			});
		});
	}
}

Page.Param = class {
	constructor(name, value, optional) {
		this.name = name;
		// TODO post flag for form params
		this.value = value;
		this.optional = optional;
	}
};
