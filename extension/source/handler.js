
new Page.Main(); // register main page

let page = Page.byLocation(document.location);
if (page) {
	console.log(`Page found for ${document.location}: ${page.name}`);
	try {
		page.check(document);
		page.process(document);
	} catch (e) {
		// TODO improve error handling; replace other console.error occurrences
		console.error(e);
	}
}
