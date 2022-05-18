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

const ID_MARKER = 'osext-marker';

/**
 * Page representation
 */
class Page {

	/**
	 * @param {String} name the name shown when loading
	 * @param {String} path the path (e.g showteam.php)
	 * @param {...Page.Param} params the parameters this page can handle
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

		/** @type {Logger} the logger of the page */
		this.logger = new Logger(name);
	}

	/**
	 * Check if the given location matches the path and params of this page.
	 *
	 * @param {String} location the location of a href
	 * @returns {boolean}
	 */
	match (location) {
		let url = new URL(location, document.location.href);
		if (url.pathname !== ('/' + this.path)) {
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
					throw new Error(`Parameter ${param.name} fehlt (url: ${url}).`);
				}
			}
		});
		return url;
	}

	/**
	 * Returns true if the page is the same as the the given one.
	 *
	 * All parameters of the given page must be present and equal in this page.
	 *
	 * @param {Page} page the page to compare
	 * @returns {Boolean} the result
	 */
	equals (page) {
		if (!page.name.includes(this.name)) return false;
		if (page.path !== this.path) return false;
		let thisPage = this;
		return page.params.every(p1 => {
			return thisPage.params.find(p2 => p2.name === p1.name && p2.optional === p1.optional && p2.value === p1.value);
		});
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
		let contains = (element, regexp) => {
			if (!element) return false;
			return (element.textContent.search(regexp) != -1);
		}
		if (contains(doc.body, /F.r\sdie\sDauer\svon\sZAT\s.+\ssind\sdie\sSeiten\svon\sOS\s2\.0\sgesperrt!/)) {
			throw new Warning('Auswertung läuft');
		}
		else if (contains(doc.body, /Willkommen im Managerb.ro von Demo[Tt]eam/) ||
			contains(doc.body, /Diese Seite ist ohne Team nicht verf.gbar!/) ||			
			contains(doc.body, /Du ben.tigst ein Team um diese Seite verwenden zu k.nnen!/) ||			
			contains(doc.querySelector('a[href="javascript:writePM()"]'), /DemoManager/)) {
			throw new Warning('Anmeldung erforderlich');
		}
		else if (contains(doc.body, /Diese Funktion ist erst ZAT 1 wieder verf.gbar/)) {
			throw new Warning('Saisonwechsel läuft');
		}
	}

	/**
	 * Reloads the given document if already extended with a marker element,
	 * to ensure a clean original page after e.g. extension reload.
	 *
	 * Ajax response without location and test documents and are not reloaded.
	 *
	 * @param {Document} doc the document
	 */
	reloadIfAlreadyExtended (doc) {
		if (doc.getElementById(ID_MARKER) && doc.location && doc.location.hostname !== 'localhost') {
			doc.location.reload();
			return true;
		}
		return false;
	}

	/**
	 * Adds a marker element to the given document.
	 *
	 * Ajax response documents without location are not marked.
	 *
	 * @param {Document} doc the document
	 */
	markExtended (doc = document) {
		if (!doc.getElementById(ID_MARKER) && doc.location) {
			let marker = HtmlUtil.createDivElement('', '', doc);
			marker.id = ID_MARKER;
			doc.body.appendChild(marker);
		}
	}

	/**
	 * Reverts Greasemonkey script modifications on the given document.
	 *
	 * @param {Document} doc the document
	 */
	unscript (doc = document) {}

	/**
	 * The extract method used when processing the page.
	 *
	 * Modifications to the given extension data during extract are stored
	 * immediatly after return.
	 *
	 * In the extract implementation optional and POST parameter values
	 * should be set in the page params array for the use in a initialization
	 * process, so that the requested page can be found and removed from the queue.
	 *
	 * This method is intended be overridden.
	 *
	 * @param {Document} _doc the current document
	 * @param {ExtensionData} _data the extension data
	 */
	extract (_doc, _data) {}

	/**
	 * The extend method used when processing the page.
	 *
	 * Modifications to the given extension data during extend are NOT stored
	 * automatically. Use the synchronized version of Persistence.storeExtensionData()
	 * to store modified data.
	 *
	 * This method is intended be overridden.
	 *
	 * @param {Document} _doc the current document
	 * @param {ExtensionData} _data the extension data
	 */
	extend (_doc, _data) {}

	/**
	 * Processes the given document.
	 *
	 * @param {Document} doc the document that should be processed
	 * @param {Window} win the current window
	 */
	process (doc) {
		let page = this;
		if (page.reloadIfAlreadyExtended(doc)) return;
		page.check(doc);
		if (doc.getElementById('options')) {	// Greasemonkey script invoked!
			page.unscript(doc);
		}
		Persistence.updateExtensionData(data => {
			if (!data.nextZat && !page.equals(new Page.Main())) {
				data.pagesToRequest = [];
				data.pagesToRequest.push(new Page.Main());
			} else {
				page.logger = Object.assign(new Logger(page.name), page.logger);
				page.logger.log('extract', Logger.prepare(data));
				page.extract(doc, data);
				data.pagesToRequest = data.pagesToRequest.filter(pageToRequest => !page.equals(pageToRequest)); // filter after extract to consider all POST parameters
			}
		}).then(updatedData => {
			let requestor = Requestor.getCurrent();
			if (updatedData.pagesToRequest.length > 0) {
				if (!requestor) {
					requestor = Requestor.create(doc, () => {
						Persistence.updateExtensionData(dataToComplete => {
							dataToComplete.complete();
						}).then(completedData => {
							page.logger.log('extend after init', Logger.prepare(completedData));
							page.extend(doc, completedData);
							page.markExtended(doc);
						}).catch(e => {
							Page.handleError(e);
						});
					});
				}
				return requestor.fetchPage(ensurePrototype(updatedData.pagesToRequest[0], Page));
			} else {
				if (requestor) {
					requestor.finish();
				} else {
					page.logger.log('extend', Logger.prepare(updatedData));
					page.extend(doc, updatedData);
					page.markExtended(doc);
				}
			}
		}).catch(e => {
			Page.handleError(e);
		});
	}

	/**
	 * Handles errors and should also be used in reject implementation of Promises.
	 *
	 * @param {Error} e
	 */
	static handleError (e) {

		Requestor.cleanUp();

		if (e instanceof Warning) {
			new Logger('Warning').warn(e.message);
		} else {
			new Logger('Error').error(e);
		}

		let parentDoc = top.frames.os_main ? top.frames.os_main.document : document;
		let messageBox = HtmlUtil.createMessageBox(parentDoc, e instanceof Warning ? STYLE_WARNING : STYLE_ERROR, e.message || e);

		parentDoc.body.appendChild(messageBox);
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