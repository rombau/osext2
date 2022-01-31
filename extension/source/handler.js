
let page = Page.byLocation(document.location);
if (page) {
	console.log(`Page found for ${document.location}: ${page.name}`);
	try {
		page.check(document);
		page.process(document);
	} catch (e) {
		if (e instanceof Warning) {
			console.warn(e.message);
		} else {
			console.error(e);
		}

		/** @type {Document} the element with the progress */
		let parentDoc = top.frames.os_main ? top.frames.os_main.document : doc;

		/** @type {HTMLElement} the element with the progress */
		let errorDiv = parentDoc.createElement('div');

		errorDiv.innerHTML = `<i class="fas fa-frown"></i> ${e.message}`;
		errorDiv.classList.add(STYLE_MESSAGE);
		errorDiv.classList.add(e instanceof Warning ? STYLE_WARNING : STYLE_ERROR);
		errorDiv.addEventListener('click', (event) => {
			errorDiv.remove();
		});
		parentDoc.body.appendChild(errorDiv);
	}
}
