
class ContractExtensionPage extends Page {
	
	constructor() {

		super('Vertragsverlängerungen', 'vt.php');

	}
	
	static HEADERS = ['Name', 'Alter', 'Land', 'Gehalt', 'Laufzeit', 'Skillschnitt', 'Opt. Skill', '24', 'Monate', '36', 'Monate', '48', 'Monate', '60', 'Monate'];

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

		data.currentTeam = Object.assign(new Team(), data.currentTeam);
		
		HtmlUtil.getTableRowsByHeader(doc, ...ContractExtensionPage.HEADERS).forEach(row => {

			let id = HtmlUtil.extractIdFromHref(row.cells['Name'].firstChild.href);
			let player = data.currentTeam.getSquadPlayer(id); 
			
			player.followUpSalary['24'] = +row.cells[8].textContent.replace(/\./g, '');
			player.followUpSalary['36'] = +row.cells[10].textContent.replace(/\./g, '');
			player.followUpSalary['48'] = +row.cells[12].textContent.replace(/\./g, '');
			player.followUpSalary['60'] = +row.cells[14].textContent.replace(/\./g, '');

		});
	}

}
