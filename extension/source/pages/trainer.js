
Page.Trainer = class extends Page {
	
	constructor() {

		super('Trainer', 'trainer.php');
	}

	static HEADERS = ['#', 'Skill', 'Gehalt', 'Vertrag', 'Aktion'];

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {
	
		if (!doc.querySelector('input[type="submit"][name="te"]')) {

			doc.getElementsByTagName('div')[0].classList.add(STYLE_TRAINER);

			HtmlUtil.getTableRowsByHeader(doc, ...Page.Trainer.HEADERS).forEach(row => {

				let trainer = data.team.getTrainer(+row.cells['#'].textContent); 

				trainer.salary = +row.cells['Gehalt'].textContent.replaceAll('.', '');
				trainer.contractTerm = +row.cells['Vertrag'].textContent;

				trainer.legacySkill = Team.Trainer.LIST[row.cells['Skill'].textContent].legacySkill;
				trainer.upToSkill = Team.Trainer.LIST[row.cells['Skill'].textContent].upToSkill;
				
			});
		}
	}

}
