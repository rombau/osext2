
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

		if (+doc.querySelector('select[name=ligaauswahl]').value && 
			+doc.querySelector('select[name=landauswahl]').value && 
			!(+doc.querySelector('select[name=tabauswahl]').value) &&
			doc.querySelector('select[name=saauswahl]').value === doc.querySelector('select[name=saauswahl] :last-child').value) {

			let size = 0;
			let leagueOfCurrentTeam = false;

			HtmlUtil.getTableRowsByHeader(doc, ...Page.LeagueTable.HEADERS).forEach(row => {

				size++;
				if (HtmlUtil.extractIdFromHref(row.cells['Club'].firstChild.href) === data.team.id) {
					data.viewSettings.leagueRanking = size;
					leagueOfCurrentTeam = true;
				}
			});

			if (leagueOfCurrentTeam) data.team.league.size = size;
		}
	}
}
