
let page = Page.byLocation(document.location.href);
if (page) {
	new Logger('Handler').info(`Page found for ${document.location}: ${page.name}`);
	try {
		page.process(document);
	} catch (e) {
		Page.handleError(e);
	}
}
