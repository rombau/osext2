/**
 * Warning implementation
 */
class Warning extends Error {

	constructor(message) {
		super(message);
	}
}

/**
 * Enum for http methods.
 * @readonly
 */
 const HttpMethod = Object.freeze({
	GET: 'GET',
	POST: 'POST'
});

/**
 * Page representation
 */
class Page {

	/**
	 * @param {String} name the name shown when loading
	 * @param {String} path the path (e.g showteam.php)
	 * @param  {...Page.Param} params the parameters this page can handle
	 */
	constructor(name, path, ...params) {

		/** @type {String} the request method */
		this.method = HttpMethod.GET;

		/** @type {String} the name */
		this.name = name;

		/** @type {String} the path */
		this.path = path;

		/** @type {[Page.Param]} the parameters this page can handle */
		this.params = params;
	}

	/**
	 * Check if the given location matches the path and params of this page.
	 * 
	 * @param {String} location the location of a href
	 * @returns {boolean}
	 */
	match (location) {
		let url = new URL(location, document.location.href);
		if (!url.pathname.includes(this.path)) {
			return false;
		}
		return this.params.every(param => {
			let value = url.searchParams.get(param.name);
			return value ? (param.value === undefined || value == param.value) : param.optional;
		});
	}

	/**
	 * Creates a URL with the given parameters.
	 * 
	 * @returns {URL} the resulting URL
	 */
	createUrl () {
		let url = new URL(this.path, document.location.href);
		this.params.forEach((param) => {
			if (!param.optional) {
				if (param.value) {
					url.searchParams.append(param.name, param.value);
				} else {
					throw new Error(`Value for ${param.name} (url: ${url}) is missing.`);
				}
			}
		});
		return url;
	}

	/**
	 * Returns the registered page for a given document location.
	 * 
	 * @param {string} location of the document
	 */
	static byLocation (location) {
		let pageFound = Object.values(Page).map(constructor => new (constructor)).find(page => {
			return page && page instanceof Page && page.match(location);
		});
		if (pageFound) {
			let url = new URL(location, document.location.href);
			pageFound.params.forEach((param) => {
				let paramValue = url.searchParams.get(param.name);
				param.value = (isNaN(paramValue) ? paramValue : +paramValue);
			});
		}
		return pageFound;
	}

	/**
	 * Checks the given document if a current calculation is running or a login is required.
	 * 
	 * @param {Document} doc the document that should be checked
	 */
	check (doc) {
		if (doc.body.textContent.search(/F.+r\sdie\sDauer\svon\sZAT\s.+\ssind\sdie\sSeiten\svon\sOS\s2\.0\sgesperrt!/) != -1) {
			throw new Warning('Auswertung läuft');
		}
		if (doc.body.textContent.search(/(Willkommen im Managerb.+ro von )*Demo[T|t]eam/) != -1 ||
			doc.body.textContent.search(/Diese Seite ist ohne Team nicht verf.+gbar!/) != -1) {
			throw new Warning('Anmeldung erforderlich');
		}
	}

	/**
	 * The extract method used when processing the page. 
	 * This method is intended be overridden!
	 * 
	 * @param {Document} _doc the current document
	 * @param {ExtensionData} _data the extension data
	 * @returns {[Page]} additional pages to load on initialization
	 */
	extract (_doc, _data) {}

	/**
	 * The extend method used when processing the page. 
	 * This method is intended be overridden!
	 * 
	 * @param {Document} _doc the current document
	 * @param {ExtensionData} _data the extension data
	 */
	extend (_doc, _data) {}

	/**
	 * Registers a visibility change listener to update the background cache
	 * when leaving the current page (document).
	 * 
	 * @param {Document} doc the current document
	 * @param {ExtensionData} data the extension data
	 */
	registerSaveOnExitListener (doc, data) {
		doc.addEventListener('visibilitychange', () => {
			if (doc.visibilityState === 'hidden') {
				Persistence.storeExtensionData(data).then(console.log, Page.handleError);
			}
		});
	}

	/**
	 * Processes the given document.
	 * 
	 * @param {Document} doc the document that should be processed
	 * @param {Window} win the current window
	 */
	process (doc, win = window) {
		let page = this;
		let pagesToRequest;
		Persistence.updateExtensionData(data => {
			pagesToRequest = page.extract(doc, data);
		}).then(data => {
			if (win.frameElement && win.frameElement.id === Requestor.FRAME_ID) {
				if (pagesToRequest && pagesToRequest.length) {
					win.frameElement.requestAdditionalPages(pagesToRequest);
				}
				win.frameElement && win.frameElement.pageLoaded();
			} else if (pagesToRequest && pagesToRequest.length) {
				let requestor = Requestor.create(doc);
				pagesToRequest.forEach((page) => requestor.addPage(page));
				requestor.start(page, () => {
					Persistence.getExtensionData(data.team.name).then(newdata => {
						page.registerSaveOnExitListener(doc, newdata);
						try {
							page.extend(doc, newdata);
						} catch (e) {
							Page.handleError(e);
						}
					}, Page.handleError);
				});
			} else {
				page.registerSaveOnExitListener(doc, data);
				try {
					page.extend(doc, data);	
				} catch (e) {
					Page.handleError(e);
				}
			}			
		}, Page.handleError);
	}

	/**
	 * Handles errors and should also be used in reject implementation of Promises.
	 * 
	 * @param {Error} e 
	 */
	static handleError (e) {

		if (e instanceof Warning) {
			console.warn(e.message);
		} else {
			console.error(e);
		}
	
		/** @type {Document} the element with the progress */
		let parentDoc = top.frames.os_main ? top.frames.os_main.document : doc;
	
		/** @type {HTMLElement} the element with the progress */
		let errorDiv = parentDoc.createElement('div');
	
		errorDiv.innerHTML = `<i class="fas fa-frown"></i> ${e.message || e}`;
		errorDiv.classList.add(STYLE_MESSAGE);
		errorDiv.classList.add(e instanceof Warning ? STYLE_WARNING : STYLE_ERROR);
		errorDiv.addEventListener('click', (event) => {
			errorDiv.remove();
		});
		parentDoc.body.appendChild(errorDiv);
	}
}

/**
 * Page parameter representation
 */
Page.Param = class {

	/**
	 * @param {String} name the parameter name
	 * @param {String} value the parameter value
	 * @param {Boolean} optional flag indicating an optional parameter (default = false)
	 */
	constructor(name, value, optional = false) {

		/** @type {String} the parameter name */
		this.name = name;

		/** @type {String} the parameter value */
		this.value = value;

		/** @type {Boolean} flag indicatingthe parameter is optional (default = false) */
		this.optional = optional;
	}
};