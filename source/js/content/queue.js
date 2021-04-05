class RequestQueue {
	constructor (doc = document) {
		this.doc = doc;
		this.pages = [];
		this.frame = this._createFrame(this.doc);
	}

	/**
	 * Fügt eine Seite zur Queue hinzu.
	 */
	addPage (page, ...params) {
		let url = page.createUrl(...params);
		let name = page.name;
		this.pages.push({url, name});
	}

	/**
	 * Startet die Verarbeitung der Queue. Sobald die letze Seite geladen wurde,
	 * wird die angegeben Callback-Funktion aufgerufen.
	 */
	start (triggerPage = new Page(), finishCallback = (doc, data) => {}) {
		this.triggerPage = triggerPage;
		this.finishCallback = finishCallback;
		this.status = this._createStatus(this.doc);
		this._next();
	}
	
	/**
	 * Liefert die Frame-ID der Queue.
	 */
	static get FRAME_ID () {
		return 'page-request-frame';
	}

	static get STATUS_ID () {
		return 'page-request-status';
	}
	
	static get InitializerQueue () {
		let queue = new RequestQueue();
		queue.addPage(new ShowteamOverviewPage());
		queue.addPage(new ShowteamSkillsPage());
		queue.addPage(new ShowteamContractsPage());
		// to be continued ...
		return queue;
	}
	
	_createStatus (currentDoc) {
		/** @type {HTMLDocument} */
		let doc = top.frames.os_main ? top.frames.os_main.document : currentDoc;
		let status = doc.getElementById(RequestQueue.STATUS_ID) || doc.createElement('div');
		doc.body.firstElementChild.style.marginTop = "25px"; 
		status.id = RequestQueue.STATUS_ID;
		status.style.display = 'block';
		status.style.padding = '2px 20px';
		status.style.position = 'fixed';
		status.style.left = '0px';
		status.style.right = '0px';
		status.style.top = '0px';
		status.style.backgroundColor = '#CCCCFF';
		status.style.color = '#6666CC';
		if (doc.body) {
			doc.body.appendChild(status);
		}
		return status;
	}

	_createFrame (doc) {
		let frame = doc.getElementById(RequestQueue.FRAME_ID) || doc.createElement('iframe');
		frame.id = RequestQueue.FRAME_ID;
		frame.src = 'about:blank';
		frame.style.display = 'none';
		frame.readyAfterLoad = additionalPagesToLoad => {
			if (additionalPagesToLoad) { 
				this.pages = this.pages.concat(additionalPagesToLoad);
			}
			this._next();
		};
		doc.body.appendChild(frame);
		return frame;
	}
		
	_next () {
		if (this.pages.length > 0) {
			let page = this.pages.shift();
			if (page.name === this.triggerPage.name) {
				this._next();
			} else {
				this.frame.src = page.url;
				this.status.textContent = `Initialisiere ${page.name} ...`;
			}
		} else {
			this.status.style.display = 'none';
			this.status.parentElement.firstElementChild.style.marginTop = "0px"; 
			chrome.runtime.sendMessage({}, data => {
				this.finishCallback(this.doc, data);
				chrome.runtime.sendMessage({data});
			});
		}
	}
}
