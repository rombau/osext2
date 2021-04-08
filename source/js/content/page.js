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
		if (this.method === HttpMethod.GET) {
			this.params.forEach((param) => {
				if (!param.value && !param.optional) {
					throw new Error(`Value for ${param.name} (url: ${url}) is missing.`);
				}
				url.searchParams.append(param.name, param.value);
			});
		}
		return url;
	}

	/**
	 * Registers a page.
	 * 
	 * @param {Page} pageToRegister the page to register
	 */
	static register (pageToRegister) {
		if (!Page.registry.find(page => page && page instanceof Page && page.name === pageToRegister.name && page.path === pageToRegister.path)) {
			Page.registry.push(pageToRegister);
		}
	}

	/**
	 * Returns the registered page for a given document location.
	 * 
	 * @param {string} location of the document
	 * @returns {Page} the registered page 
	 */
	static byLocation (location) {
		return Page.registry.find(page => {
			return page && page instanceof Page && page.match(location);
		});
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
	 * @param {Document} doc the document that should be processed
	 * @param {Window} win the current window
	 */
	process (doc, win = window) {
		let page = this;
		Persistence.getCachedData(data => {
			let pagesToRequest = page.extract(doc, data);
			Persistence.setCachedData(data, () => {
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
		});
	}
}

/**
 * Registered pages for processing.
 * @type {[Page]}
 */
Page.registry = [];

/**
 * Page parameter representation
 */
Page.Param = class {

	/**
	 * @param {String} name the paramtere name
	 * @param {String} value the paramtere value
	 * @param {Boolean} optional flag indicating an optional parameter (default = false)
	 */
	constructor(name, value, optional = false) {

		this.name = name;
		this.value = value;
		this.optional = optional;
	}
};