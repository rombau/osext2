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
	static FRAME_ID = 'osext-page-request-frame';

	/**
	 * @returns {String} the id of the status element
	 */
	static STATUS_ID = 'osext-page-request-status';

	/**
	 * @returns {String} the id of the status element
	 */
	static OVERLAY_ID = 'osext-page-request-overlay';
	
	/**
	 * @returns {String} the id of the form element
	 */
	static FORM_ID = 'osext-page-request-form';
	
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
		top.addEventListener("load", event => this.addOverlayToFrame(top.frames.os_menu));
		Array.from(top.frames).forEach(frame => this.addOverlayToFrame(frame));
		let statusDoc = top.frames.os_main ? top.frames.os_main.document : doc;
		let status = statusDoc.getElementById(Requestor.STATUS_ID) || statusDoc.createElement('div');
		status.id = Requestor.STATUS_ID;
		status.classList.add(STYLE_MESSAGE);
		status.classList.add(STYLE_STATUS);
		status.classList.remove(STYLE_HIDDEN);
		statusDoc.body.appendChild(status);
		return status;
	}

	/**
	 * Adds a overlay to rthe given frame window.
	 * 
	 * @param {Window} frameWindow
	 */
	addOverlayToFrame(frameWindow) {
		let overlay = frameWindow.document.getElementById(Requestor.OVERLAY_ID) || frameWindow.document.createElement('div');
		overlay.id = Requestor.OVERLAY_ID;
		overlay.classList.remove(STYLE_HIDDEN);
		frameWindow.document.body.appendChild(overlay);
	}

	/**
	 * Creates the hidden frame element where the pages are loaded in.
	 * 
	 * @param {Document} doc the parent document for the status (only used when there is no os_main frame)
	 * @returns {HTMLFrameElement} the frame element
	 */
	createHiddenFrame (doc) {
		/** @type {HTMLFrameElement} */
		let frame = doc.getElementById(Requestor.FRAME_ID) || doc.createElement('iframe');
		frame.id = Requestor.FRAME_ID;
		frame.name = Requestor.FRAME_ID; // for form target
		frame.src = 'about:blank';
		frame.className = STYLE_HIDDEN;
		frame.requestAdditionalPages = (additionalPagesToLoad) => {
			this.pageQueue = this.pageQueue.concat(additionalPagesToLoad);
		};
		frame.pageLoaded = () => this.requestNextPage();
		doc.body.appendChild(frame);
		return frame;
	}

	/**
	 * Creates the form element for POST requests.
	 * 
	 * @param {Document} doc the parent document for the status (only used when there is no os_main frame)
	 * @param {Page} page the page with the form parameters
	 * @returns {HTMLFormElement} the form element
	 */
	createForm (doc, page) {
		/** @type {HTMLFormElement} */
		let form = doc.getElementById(Requestor.FORM_ID) || doc.createElement('form');
		form.id = Requestor.FORM_ID;
		form.className = STYLE_HIDDEN;
		form.action = page.createUrl();
		form.method = page.method;
		form.target = Requestor.FRAME_ID;
		form.textContent = ''; // remove all inputs
		page.params.forEach(param => {
			/** @type {HTMLInputElement} */
			let input = doc.createElement('input');
			input.name = param.name;
			input.type = 'number';
			input.value = param.value;
			form.appendChild(input);
		});
		doc.body.appendChild(form);
		return form;
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
				this.status.innerHTML = `<i class="fas fa-spinner"></i> Initialisiere ${page.name}`;
				if (page.method === HttpMethod.POST) {
					this.createForm(this.doc, page).submit();
				} else {
					this.frame.src = page.createUrl();
				}
			}
		} else {
			this.status.classList.add(STYLE_HIDDEN);
			Array.from(top.frames).forEach(frame => {
				let overlay = frame.document.getElementById(Requestor.OVERLAY_ID);
				if (overlay) overlay.classList.add(STYLE_HIDDEN);
			});
			this.finish();
		}
	}
}
