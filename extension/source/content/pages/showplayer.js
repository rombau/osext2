
class ShowPlayerPage extends Page {
	
	/** 
	 * @param {Number} id the player id
	 * @param {String} name the player name shown when loading
	 */
	constructor(id, name = '') {

		super(`Spieler ${name}`, 'sp.php', new Page.Param('s', id));

	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {
		
		let id = HtmlUtil.extractIdFromHref(doc.querySelector('img[src^=face]').src);


	};
}


