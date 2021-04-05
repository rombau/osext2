
class WappenPage extends Page {
	
	constructor() {

		super('Wappen', 'wappen.php');
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {
		
		let teamNameSpan = doc.querySelector('div > span[style*=red]');

		if (!data.currentTeam || data.currentTeam.name !== teamNameSpan.textContent) {
			data.initialized = false;
			data.currentTeam = new Team();
			data.currentTeam.name = teamNameSpan.textContent;
		}	
	};
}

Page.register(new WappenPage());

