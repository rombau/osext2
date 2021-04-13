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

		/** @type {String} the class name of the page */
		this.className = this.constructor.name;

		/** @type {String} the request method */
		this.method = HttpMethod.GET;

		/** @type {String} the name */
		this.name = name;

		/** @type {String} the path */
		this.path = path;

		/** @type {[Page.Param]} the parameters this page can handle */
		this.params = params;

		Page.register(this);
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
	 * Registers a page.
	 * 
	 * @param {Page} pageToRegister the page to register
	 */
	static register (pageToRegister) {
		Persistence.updateCachedData(data => {
			data.pageRegistry = Array.from(data.pageRegistry || []);
			if (!data.pageRegistry.filter(page => page.className == pageToRegister.className).find(page => {
				let pageClass = eval(page.className);
				Object.setPrototypeOf(page, pageClass.prototype);
				return page && page instanceof Page && page.createUrl().toString() == pageToRegister.createUrl().toString();
			})) {
				data.pageRegistry.push(pageToRegister);
			}
		});
	}

	/**
	 * @callback pageFoundCallback
	 * @param {Page} page
	 */

	/**
	 * Returns the registered page for a given document location.
	 * 
	 * @param {string} location of the document
	 * @param {pageFoundCallback} found
	 */
	static byLocation (location, found = () => {}) {
		Persistence.getCachedData().then(data => {
			data.pageRegistry = Array.from(data.pageRegistry);
			let pageFound = data.pageRegistry.find(page => {
				if (!page.className) return false;
				let pageClass = eval(page.className);
				Object.setPrototypeOf(page, pageClass.prototype);
				return page && page instanceof Page && page.match(location);
			});
			if (pageFound) {
				pageFound.params.forEach((param, p) => pageFound.params[p] = Object.assign(new Page.Param(),param));
			}
			found(pageFound);
		}, console.error);
	}

	/**
	 * Checks the given document if a current calculation is running or a login is required.
	 * 
	 * @param {Document} doc the document that should be checked
	 */
	check (doc) {
		if (doc.body.textContent.search(/F.+r\sdie\sDauer\svon\sZAT\s.+\ssind\sdie\sSeiten\svon\sOS\s2\.0\sgesperrt!/) != -1) {
			throw new Error('Auswertung läuft!');
		}
		if (doc.body.textContent.search(/(Willkommen im Managerb.+ro von )*Demo[T|t]eam/) != -1 ||
			doc.body.textContent.search(/Diese Seite ist ohne Team nicht verf.+gbar!/) != -1) {
			throw new Error('Anmeldung erforderlich!');
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
	extend (_doc, _data) {}	extend (_doc, _data) {}

	/**
	 * Processes the given document.
	 * 
	 * TODO: errors without a solution (DOM changes, ...) should disable the extension
	 * 
	 * @param {Document} doc the document that should be processed
	 * @param {Window} win the current window
	 */
	process (doc, win = window) {
		let page = this;
		let pagesToRequest;
		Persistence.updateCachedData(data => {
			pagesToRequest = page.extract(doc, data);
		}).then(data => {
			if (win.frameElement && win.frameElement.id === Requestor.FRAME_ID) {
				if (pagesToRequest && pagesToRequest.length) {
					win.frameElement.requestAdditionalPages(pagesToRequest);
				}
				win.frameElement.pageLoaded();
			} else if (pagesToRequest && pagesToRequest.length) {
				let requestor = Requestor.create(doc);
				pagesToRequest.forEach((page) => requestor.addPage(page));
				requestor.start(page, () => page.extend(doc, data));
			} else {
				page.extend(doc, data);
			}			
		});
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