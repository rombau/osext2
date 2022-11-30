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
	static menuObserver;

	/**
	 * Returns the current requestor instance. Therefore a new requestor object is created
	 * with the (status) message box found in the DOM.
	 *
	 * @param {Document} doc the current document
	 * @returns {Requestor} the current requestor
	 */
	static getCurrent (doc = document) {
		let status = doc.getElementById(Requestor.STATUS_ID);
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

		let status = HtmlUtil.createMessageBox(doc, STYLE_STATUS, null, Requestor.STATUS_ID, false);
		status.addEventListener('finished', () => {
			status.remove();
			finished();
		});
		doc.body.appendChild(status);

		return new Requestor(status);
	}

	/**
	 * Requests the given page.
	 *
	 * @async
	 * @param {Page} page the page to request
	 */
	async fetchPage (page) {
		if (this.status) {
			this.status.lastChild.textContent = `Initialisiere ${page.name}`;
		}
		let init = {};
		if (page.method === HttpMethod.POST) {
			let data = new FormData();
			page.params.forEach(param => {
				data.append(param.name, param.value);
			});
			init.method = page.method;
			init.body = data;
		}
		const response = await fetch(page.createUrl(), init);
		const html = await response.text();
		const doc = new DOMParser().parseFromString(html, 'text/html');
		
		// prototype of the page implementation needed for the right extract method
		Object.setPrototypeOf(page, Object.getPrototypeOf(Page.byLocation(page.createUrl().href)));

		// the given page should be processed
		page.process(doc);
	}

	/**
	 * Finishes the page requests by dispatching a click event to the status message box.
	 * Therefore the message box is closed and a registered callback is called.
	 *
	 * Additionally all requestor elements (status and overlays) removed from the DOM.
	 */
	finish () {
		this.status.dispatchEvent(new CustomEvent('finished'));
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
		Requestor.menuObserver && Requestor.menuObserver.disconnect();
	}

	/**
	 * Adds overlay(s) to all frames/windows.
	 */
	static addOverlays() {
		let addOverlay = (frameWindow) => {
			let overlay = frameWindow.document.getElementById(Requestor.OVERLAY_ID);
			if (!overlay && frameWindow.document.body) {
				overlay = frameWindow.document.createElement('div');
				overlay.id = Requestor.OVERLAY_ID;
				frameWindow.document.body.appendChild(overlay);
			}
		};
		Array.from(top.frames).forEach(frame => {
			if (frame.name === 'os_menu') {
				Requestor.menuObserver = new MutationObserver((records) => {
					records.forEach(record => {
						Array.from(record.addedNodes).forEach(node => {
							if (node.nodeName.toUpperCase() === 'HTML') {
								addOverlay(node.ownerDocument.defaultView);
							}
						});
					});
				});
				Requestor.menuObserver.observe(frame.document, { childList: true });
			}
			if (frame.document.readyState === 'complete') {
				addOverlay(frame);
			} else {
				frame.document.addEventListener('DOMContentLoaded', addOverlay(frame));
			}
		});
	}

}
