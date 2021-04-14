
class ShowteamContractsPage extends Page {
	
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

			let id = HtmlUtil.extractIdFromHref(row.cells[2].firstChild.href);
			let player = data.currentTeam.getSquadPlayer(id); 
			
			player.birthday = +row.cells[4].textContent;
			player.contractTerm = +row.cells[11].textContent;
			player.salary = +row.cells[12].textContent.replace(/\./g, '');
			player.marketValue = +row.cells[13].textContent.replace(/\./g, '');

		});
	}
}
