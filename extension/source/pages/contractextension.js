
Page.ContractExtension = class extends Page {

	constructor() {

		super('Vertragsverlängerungen', 'vt.php');

	}

	static HEADERS = ['Name', 'Alter', 'Land', 'Gehalt', 'Laufzeit', 'Skillschnitt', 'Opt. Skill', '24', 'Monate', '36', 'Monate', '48', 'Monate', '60', 'Monate'];

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

		HtmlUtil.getTableRowsByHeader(doc, ...Page.ContractExtension.HEADERS).forEach(row => {

			let id = HtmlUtil.extractIdFromHref(row.cells['Name'].firstChild.href);
			let player = data.team.getSquadPlayer(id);

			player.followUpSalary['24'] = +row.cells[8].textContent.replaceAll('.', '');
			player.followUpSalary['36'] = +row.cells[10].textContent.replaceAll('.', '');
			player.followUpSalary['48'] = +row.cells[12].textContent.replaceAll('.', '');
			player.followUpSalary['60'] = +row.cells[14].textContent.replaceAll('.', '');

		});

		// initialize new players
		if (data.team.squadPlayerAdded) {
			data.requestSquadPlayerPages();
		}
	}

}
