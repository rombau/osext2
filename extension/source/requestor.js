/**
 * Request frame (and status) for requesting additional pages.
 */
class Requestor {
	
	/**
	 * @param {HTMLElement} the element with the progress
	 */
	constructor (status) {

		/** @type {HTMLElement} the element with the progress */
		this.status = status;
	}

	/**
	 * @returns {String} the id of the hidden IFrame
	 */
	static ID_PREFIX = 'osext-page-request-';

	/**
	 * @returns {String} the id of the status element
	 */
	static STATUS_ID = Requestor.ID_PREFIX + 'status';

	/**
	 * @returns {String} the id of the status element
	 */
	static OVERLAY_ID = Requestor.ID_PREFIX + 'overlay';

	/**
	 * @returns {MutationObserver} the observer for menu changes
	 */
	static overlayObserver;
	
	/**
	 * Returns the current requestor instance. Therefore a new requestor object is created
	 * with the (status) message box found in the DOM.
	 * 
	 * @param {Document} doc the current document
	 * @returns {Requestor} the current requestor
	 */
	static getCurrent (doc) {
		let status = document.getElementById(Requestor.STATUS_ID);
		if (status) {
			return new Requestor(status);
		}
		return null;
	}

	/**
	 * @callback finishCallback
	 */

	/**
	 * Creates a requestor instance with the (status) message box.
	 * The finish callback is added to the message box click listener (closing the box).
	 * 
	 * @param {Document} doc the current document
	 * @param {finishCallback} finished the method called when requests finished
	 * @returns {Requestor} the new requestor
	 */
	static create (doc, finished = () => {} ) {

		Requestor.addOverlays();

		let status = HtmlUtil.createMessageBox(doc, STYLE_STATUS, null, Requestor.STATUS_ID, finished);
		doc.body.appendChild(status);

		return new Requestor(status);
	}

	/**
	 * Requests the given page. 
	 * 
	 * @param {Page} page the page to request
	 */
	requestPage (page) {
		let throwError = () => { 
			throw new Error(`${page.name} kann nicht initialisiert werden`); 
		}
		if (this.status) {
			this.status.lastChild.textContent = `Initialisiere ${page.name}`;
			let data = null;
			if (page.method === HttpMethod.POST) {
				data = new FormData();
				page.params.forEach(param => {
					data.append(param.name, param.value);
				});
			}
			let xhr = new XMLHttpRequest();
			xhr.open(page.method, page.createUrl(), true);
			xhr.responseType = 'document';
			xhr.onload = (event) => {
				if (xhr.readyState === 4) {
					if (xhr.status === 200) {
						Page.byLocation(xhr.responseURL).process(xhr.responseXML);
					} else {
						throwError();
					}
				}
			};
			xhr.onerror = (event) => {
				throwError();
			};
			xhr.send(data);
		} else {
			throwError();
		}
	}

	/**
	 * Finishes the page requests by dispatching a click event to the status message box.
	 * Therefore the message box is closed and a registered callback is called.
	 * 
	 * Additionally all requestor elements (status and overlays) removed from the DOM.
	 */
	finish () {
		this.status.dispatchEvent(new Event('click'));
		this.status = null;
		Requestor.cleanUp();
	}

	/**
	 * Removes status, frame, form and overlays.
	 */
	static cleanUp () {
		Array.from(top.frames).forEach(frame => {
			Array.from(frame.document.querySelectorAll('[id^=' + Requestor.ID_PREFIX + ']')).forEach(element => element.remove());
		});
		Requestor.overlayObserver && Requestor.overlayObserver.disconnect();
	}

	/**
	 * Adds a overlay to rthe given frame window.
	 */
	static addOverlays() {
		let addOverlay = (frameWindow) => {
			let overlay = frameWindow.document.getElementById(Requestor.OVERLAY_ID);
			if (!overlay) {
				overlay = frameWindow.document.createElement('div');
				overlay.id = Requestor.OVERLAY_ID;
				frameWindow.document.body.appendChild(overlay);
			}
		};
		Array.from(top.frames).forEach(frame => {
			if (frame.name === 'os_menu') {
				Requestor.overlayObserver = new MutationObserver((records) => {
					records.forEach(record => {
						Array.from(record.addedNodes).forEach(node => {
							if (node.nodeName.toUpperCase() === 'HTML') {
								addOverlay(node.ownerDocument.defaultView);
							}
						});
					});
				});
				Requestor.overlayObserver.observe(frame.document, { childList: true });
			} 
			if (frame.document.readyState === 'complete') {
				addOverlay(frame);
			} else {
				frame.document.addEventListener('DOMContentLoaded', addOverlay(frame));
			}
		});
	}
	
}
