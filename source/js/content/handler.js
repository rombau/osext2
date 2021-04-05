// TODO maybe remove this ...
let topthema = document.getElementById('TopThema');
if (topthema) {
	topthema.style.display = 'none';
}

let page = Page.byLocation(document.location);
if (page) {
	try {
		page.check(document);
		page.process(document, RequestQueue.InitializerQueue);
	} catch (e) {
		// TODO improve error handling
		console.error(e);
	}
}
