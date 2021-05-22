
Page.YouthOptions = class extends Page {
	
	constructor() {

		super('Jugendoptionen', 'ju.php', new Page.Param('page', 4));
	}
		
	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

		data.team = Object.assign(new Team(), data.team);

	}
	
}

