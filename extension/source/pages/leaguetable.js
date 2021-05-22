
Page.LeagueTable = class extends Page {
	
	constructor() {

		super('Ligatabelle', 'lt.php');
	}

	static HEADERS = ['#', '', 'Club', 'Spiele', 'Si.', 'Un.', 'Ni.', 'Tore+', 'Tore-', 'Tore +/-', 'Punkte'];

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

		data.team = Object.assign(new Team(), data.team);
		
		data.team.league.size = 0;

		HtmlUtil.getTableRowsByHeader(doc, ...Page.LeagueTable.HEADERS).forEach(row => {
			
			data.team.league.size++;

			if (HtmlUtil.extractIdFromHref(row.cells['Club'].firstChild.href) === data.team.id) {
				data.team.leagueRanking = data.team.league.size;
			}
		});
	};
}

