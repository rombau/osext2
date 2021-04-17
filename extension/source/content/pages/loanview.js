
class LoanViewPage extends Page {
	
	constructor() {

		super('Leihübersicht', 'viewleih.php');
	}

	static HEADERS = ['Name', 'Alter', 'Land', 'U', 'Skillschnitt', 'Opt. Skill', 'Leihdauer', 'Gehalt', 'Leihgebühr', 'Leihclub'];

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

		data.currentTeam = Object.assign(new Team(), data.currentTeam);
		
		/** @type {[HTMLTableRowElement]} */
		let rows = Array.from(doc.querySelectorAll('table tr'));
		rows.forEach(row => {
			if (row.cells[0].firstChild && row.cells[0].firstChild.href) {
				let id = HtmlUtil.extractIdFromHref(row.cells[0].firstChild.href);
				let player = data.currentTeam.getSquadPlayer(id);
				player.loan.fee = +row.cells[8].textContent.replace(/\./g, "");
				if (player.pos !== 'LEI') player.loan.fee *= -1;
				player.pos = row.cells[0].className;
			}
		});


	}

}
