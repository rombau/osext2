let topthema = document.getElementById('TopThema');
if (topthema) {
	topthema.style.display = 'none';
}

new MainPage(); // register main page

Page.byLocation(document.location, page => {
	if (page) {
		console.log(`Page found for ${document.location}: ${page.className}`);
		start = new Date();
		try {
			page.check(document);
			page.process(document);
		} catch (e) {
			// TODO improve error handling
			console.error(e);
		}
	}
});
