
class LeagueTablePage extends Page {
	
	constructor() {

		super('Ligatabelle', 'lt.php');
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {
		
		let queue = new Requestor(doc);
		queue.addPage(Page.StSkills, {c: 3});
		queue.addPage(Page.StSkills, {c: 4});
		queue.addPage(Page.StSkills, {c: 5});
		return queue.start((doc, data) => {
			this.extend(doc, data);
		});
	};
}

Page.register(new LeagueTablePage());
