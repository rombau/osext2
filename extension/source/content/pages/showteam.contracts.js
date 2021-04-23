
class ShowteamContractsPage extends ShowteamPage {
	
	constructor() {

		super('Verträge', 'showteam.php', new Page.Param('s', 1));

	}
	
	static HEADERS = ['#', 'Nr.', 'Name', 'Alter', 'Geb.Tag', 'Pos', '', 'Land', 'U', 'Skillschnitt', 'Opt.Skill', 'Vertrag', 'Monatsgehalt', 'Spielerwert', 'TS'];
	
	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

		data.currentTeam = Object.assign(new Team(), data.currentTeam);
		
		HtmlUtil.getTableRowsByHeaderAndFooter(doc, ...ShowteamContractsPage.HEADERS).forEach(row => {

			let id = HtmlUtil.extractIdFromHref(row.cells['Name'].firstChild.href);
			let player = data.currentTeam.getSquadPlayer(id); 
			
			player.birthday = +row.cells['Geb.Tag'].textContent;
			player.contractTerm = +row.cells['Vertrag'].textContent;
			player.salary = +row.cells['Monatsgehalt'].textContent.replace(/\./g, '');
			player.marketValue = +row.cells['Spielerwert'].textContent.replace(/\./g, '');

		});
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extend(doc, data) {

		// TODO extend page
	}

	/**
	 * @param {Team} team
	 * @param {Boolean} current indicating the current team
	 */
	updateWithTeam (team, current) {

		// TODO update with forecast values
	}
}
