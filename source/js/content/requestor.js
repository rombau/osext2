/**
 * Request frame (and status) for requesting additional pages.
 */
class Requestor {
	
	/**
	 * @param {Document} doc the HTML document where to create the hidden IFrame.
	 */
	constructor (doc = document) {

		/** @type {Document} the document */
		this.doc = doc;

		/** @type {[Page]} the queue with the pages to request */
		this.pageQueue = [];

		/** @type {HTMLFrameElement} the IFrame where the pages are loaded in */
		this.frame = this.createHiddenFrame(this.doc);

		/** @type {HTMLElement} the element with the progress */
		this.status;

		/** the method called after the last page was loaded */
		this.finish = () => {};
	}

	/**
	 * Adds a page to the queue.
	 * 
	 * @param {Page} page
	 */
	addPage (page) {
		this.pageQueue.push(page);
	}

	/**
	 * Starts requesting pages from the queue. Until the last page is loaded,
	 * the given callback funktion is called.
	 * 
	 * @param {Page} triggerPage the page where the requests are started
	 * @param finish the callback funktion
	 */
	start (triggerPage = new Page(), finish = () => {}) {
		this.triggerPage = triggerPage;
		this.finish = finish;
		this.status = this.createStatus(this.doc);
		this.requestNextPage();
	}
	
	/**
	 * @returns {String} the id of the hidden IFrame
	 */
	static get FRAME_ID () {
		return 'page-request-frame';
	}

	/**
	 * @returns {String} the id of the status element
	 */
	static get STATUS_ID () {
		return 'page-request-status';
	}
	
	/**
	 * @returns {Requestor} a new instance
	 */
	static create () {
		return new Requestor();
	}

	/**
	 * Creates the status bar where the request progress is shown.
	 * 
	 * @param {Document} doc the parent document for the status (only used when there is no os_main frame)
	 * @returns {HTMLElement} the status element
	 */
	createStatus (doc) {
		let statusDoc = top.frames.os_main ? top.frames.os_main.document : doc;
		statusDoc.body.firstElementChild.style.marginTop = "25px"; 

		let status = statusDoc.getElementById(Requestor.STATUS_ID) || statusDoc.createElement('div');
		status.id = Requestor.STATUS_ID;
		status.style.display = 'block';
		status.style.padding = '2px 20px';
		status.style.position = 'fixed';
		status.style.left = '0px';
		status.style.right = '0px';
		status.style.top = '0px';
		status.style.backgroundColor = '#CCCCFF';
		status.style.color = '#6666CC';

		statusDoc.body.appendChild(status);

		return status;
	}

	/**
	 * Creates the hidden frame element where the pages are loaded in.
	 * 
	 * @param {Document} doc the parent document for the status (only used when there is no os_main frame)
	 * @returns {HTMLElement} the status element
	 */
	createHiddenFrame (doc) {
		let frame = doc.getElementById(Requestor.FRAME_ID) || doc.createElement('iframe');
		frame.id = Requestor.FRAME_ID;
		frame.src = 'about:blank';
		frame.style.display = 'none';
		frame.requestAdditionalPages = (additionalPagesToLoad) => {
			this.pageQueue = this.pageQueue.concat(additionalPagesToLoad);
		};
		frame.pageLoaded = () => this.requestNextPage();

		doc.body.appendChild(frame);

		return frame;
	}
		
	/**
	 * Requests the next page from the queue. 
	 * 
	 * If no more pages to load, the triggering page is notified with the finish callback.
	 */
	requestNextPage () {
		if (this.pageQueue.length > 0) {
			let page = this.pageQueue.shift();
			if (page.name === this.triggerPage.name) {
				this.requestNextPage();
			} else {
				this.status.textContent = `Initialisiere ${page.name} ...`;
				
				this.frame.src = page.createUrl();
			}
		} else {
			this.status.style.display = 'none';
			this.status.parentElement.firstElementChild.style.marginTop = "0px"; 
			this.finish();
		}
	}
}
