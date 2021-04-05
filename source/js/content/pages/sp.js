
class ShowPlayerPage extends Page {
	
	constructor() {

		super('Spieler', 'sp.php', new Page.Param('s'));
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {
		
		let id = HtmlUtil.extractIdFromHref(doc.querySelector('img[src^=face]').src);


	};
}

Page.register(new ShowPlayerPage());

