
class LeagueTablePage extends Page {
	
	constructor() {

		super('Ligatabelle', 'lt.php');
	}

	static HEADERS = ['#', '', 'Club', 'Spiele', 'Si.', 'Un.', 'Ni.', 'Tore+', 'Tore-', 'Tore +/-', 'Punkte'];

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

		data.currentTeam = Object.assign(new Team(), data.currentTeam);
		
		data.currentTeam.league.size = 0;

		HtmlUtil.getTableRowsByHeader(doc, ...LeagueTablePage.HEADERS).forEach(row => {
			
			data.currentTeam.league.size++;

			if (HtmlUtil.extractIdFromHref(row.cells['Club'].firstChild.href) === data.currentTeam.id) {
				data.currentTeam.leagueRanking = data.currentTeam.league.size;
			}
		});
	};
}

