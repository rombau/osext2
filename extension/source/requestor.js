/**
 * Request frame (and status) for requesting additional pages.
 */
class Requestor {
	
	/**
	 * @param {HTMLIFrameElement} the IFrame for page loading
	 * @param {HTMLElement} the element with the progress
	 */
	constructor (frame, status) {

		/** @type {HTMLIFrameElement} the IFrame for page loading */
		this.frame = frame;

		/** @type {HTMLElement} the element with the progress */
		this.status = status;
	}

	/**
	 * @returns {String} the id of the hidden IFrame
	 */
	static ID_PREFIX = 'osext-page-request-';

	/**
	 * @returns {String} the id of the hidden IFrame
	 */
	static FRAME_ID = Requestor.ID_PREFIX + 'frame';

	/**
	 * @returns {String} the id of the status element
	 */
	static STATUS_ID = Requestor.ID_PREFIX + 'status';

	/**
	 * @returns {String} the id of the status element
	 */
	static OVERLAY_ID = Requestor.ID_PREFIX + 'overlay';
	
	/**
	 * @returns {String} the id of the form element
	 */
	static FORM_ID = Requestor.ID_PREFIX + 'form';
	
	/**
	 * Returns the current requestor instance. Therefore a new requestor object is created
	 * with the hidden frame and the message box found in the DOM.
	 * 
	 * @param {Document} doc the current document
	 * @returns {Requestor} the current requestor
	 */
	static getCurrent (doc) {
		if (doc.defaultView && doc.defaultView.frameElement && doc.defaultView.frameElement.id === Requestor.FRAME_ID) {
			let status = doc.defaultView.frameElement.parentElement.querySelector('#' + Requestor.STATUS_ID);
			if (status) {
				return new Requestor(doc.defaultView.frameElement, status);
			}
		}
		return null;
	}

	/**
	 * @callback finishCallback
	 */

	/**
	 * Creates a requestor instance with the a new hidden frame and the message box.
	 * The finish callback is added to the message box click listener (closing the box).
	 * 
	 * @param {Document} doc the current document
	 * @param {finishCallback} finished the method called when requests finished
	 * @returns {Requestor} the new requestor
	 */
	static create (doc, finished = () => {} ) {

		Requestor.addOverlays();

		let frame = Requestor.createHiddenFrame(doc);
		doc.body.appendChild(frame);
		let status = HtmlUtil.createMessageBox(doc, STYLE_STATUS, null, Requestor.STATUS_ID, finished);
		doc.body.appendChild(status);

		return new Requestor(frame, status);
	}

	/**
	 * Requests the given page. 
	 * 
	 * For pages with POST parameters a FORM is created and submitted to the frame.
	 * 
	 * @param {Page} page the page to request
	 */
	requestPage (page) {
		if (this.frame && this.status) {
			this.status.lastChild.textContent = `Initialisiere ${page.name}`;
			if (page.method === HttpMethod.POST) {
				Requestor.createForm(this.frame.ownerDocument, page).submit();
			} else {
				this.frame.src = page.createUrl();
			}
		} else {
			throw new Error(`${page.name} kann nicht initialisiert werden.`);
		}
	}

	/**
	 * Finishes the page requests by dispatching a click event to the status message box.
	 * Therefore the message box is closed and a registered callback is called.
	 * 
	 * Additionally all requestor elements (status, frame, form and overlays) removed from the DOM.
	 */
	finish () {
		this.status.dispatchEvent(new Event('click'));
		this.status = null;
		this.frame = null;
		Requestor.cleanUp();
	}

	/**
	 * Removes status, frame, form and overlays.
	 */
	static cleanUp () {
		Array.from(top.frames).forEach(frame => {
			Array.from(frame.document.querySelectorAll('[id^=' + Requestor.ID_PREFIX + ']')).forEach(element => element.remove());
		});
	}

	/**
	 * Adds a overlay to rthe given frame window.
	 */
	static addOverlays() {
		let addOverlay = (frameWindow) => {
			let overlay = frameWindow.document.createElement('div');
			overlay.id = Requestor.OVERLAY_ID;
			frameWindow.document.body.appendChild(overlay);
		};
		top.addEventListener("load", (event) => addOverlay(top.frames.os_menu));
		Array.from(top.frames).forEach(frame => addOverlay(frame));
	}

	/**
	 * Creates the hidden frame element where the pages are loaded in.
	 * 
	 * @param {Document} doc the parent document for the status (only used when there is no os_main frame)
	 * @returns {HTMLIFrameElement} the frame element
	 */
	static createHiddenFrame (doc) {
		/** @type {HTMLIFrameElement} */
		let frame = doc.getElementById(Requestor.FRAME_ID) || doc.createElement('iframe');
		frame.id = Requestor.FRAME_ID;
		frame.name = Requestor.FRAME_ID; // for FORM target
		frame.src = 'about:blank';
		frame.className = STYLE_HIDDEN;
		return frame;
	}

	/**
	 * Creates the form element for POST requests.
	 * 
	 * @param {Document} doc the parent document for the status (only used when there is no os_main frame)
	 * @param {Page} page the page with the form parameters
	 * @returns {HTMLFormElement} the form element
	 */
	static createForm (doc, page) {
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
		
}
