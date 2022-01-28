
let page = Page.byLocation(document.location);
if (page) {
	console.log(`Page found for ${document.location}: ${page.name}`);
	try {
		page.check(document);
		page.process(document);
	} catch (e) {
		console.error(e);

		let parentDoc = top.frames.os_main ? top.frames.os_main.document : doc;
		let errorDiv = parentDoc.createElement('div');
		errorDiv.id = 'osext-error';
		errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${e.message}`;
		errorDiv.addEventListener('click', (event) => {
			errorDiv.remove();
		});
		parentDoc.body.appendChild(errorDiv);
	}
}
