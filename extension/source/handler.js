
let page = Page.byLocation(document.location);
if (page) {
	console.log(`Page found for ${document.location}: ${page.name}`);
	try {
		page.check(document);
		page.process(document);
	} catch (e) {
		handleError(e);
	}
}
