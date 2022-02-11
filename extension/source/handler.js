
let page = Page.byLocation(document.location);
if (page) {
	new Logger('Handler').info(`Page found for ${document.location}: ${page.name}`);
	try {
		page.check(document);
		page.process(document);
	} catch (e) {
		Page.handleError(e);
	}
}
