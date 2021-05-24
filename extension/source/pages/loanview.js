
Page.LoanView = class extends Page {
	
	constructor() {

		super('Leihübersicht', 'viewleih.php');
	}

	static HEADERS = ['Name', 'Alter', 'Land', 'U', 'Skillschnitt', 'Opt. Skill', 'Leihdauer', 'Gehalt', 'Leihgebühr', 'Leihclub'];

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {
	
		/** @type {[HTMLTableRowElement]} */
		let rows = Array.from(doc.querySelectorAll('table tr'));
		rows.forEach(row => {
			Page.LoanView.HEADERS.forEach((header, i) => row.cells[header] = row.cells[i]);
			let nameCell = row.cells['Name'];
			if (nameCell.firstChild && nameCell.firstChild.href) {
				let id = HtmlUtil.extractIdFromHref(nameCell.firstChild.href);
				let player = data.team.getSquadPlayer(id);
				player.loan.fee = +row.cells['Leihgebühr'].textContent.replace(/\./g, "");
				if (player.pos !== 'LEI') player.loan.fee *= -1;
				player.pos = nameCell.className;
			}
		});


	}

}
