
class LeagueTablePage extends Page {
	
	constructor() {

		super('Ligatabelle', 'lt.php');
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {
		
		let pagesToLoad = [];
		
		pagesToLoad.push(new TeamSkillsPage(1, ''));
		pagesToLoad.push(new TeamSkillsPage(2, ''));
		

		// return pagesToLoad;
	};
}

