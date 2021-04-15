
class TrainerPage extends Page {
	
	constructor() {

		super('Trainer', 'trainer.php');
	}

	static HEADERS = ['#', 'Skill', 'Gehalt', 'Vertrag', 'Aktion'];

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

		data.currentTeam = Object.assign(new Team(), data.currentTeam);
		
		HtmlUtil.getTableRowsByHeader(doc, ...TrainerPage.HEADERS).forEach(row => {

			/** @type {Team.Trainer} */
			let trainer = data.currentTeam.getTrainer(+row.cells[0].textContent); 

			trainer.salary = +row.cells[2].textContent.replace(/\./g, "");
			trainer.contractTerm = +row.cells[3].textContent;

		});
	}
	
}
