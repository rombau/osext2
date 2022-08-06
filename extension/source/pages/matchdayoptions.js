
Page.MatchDayOptions = class extends Page {

	constructor() {

		super('ZA-Einstellungen', 'zuzu.php');

	}

	static HEADERS = ['#', 'Spieler', 'FIT', 'Physio', 'Kosten'];

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

		data.viewSettings.ticketPrice.league = +doc.getElementsByName("liga")[0].value;
		data.viewSettings.ticketPrice.cup = +doc.getElementsByName("pokal")[0].value;
		data.viewSettings.ticketPrice.international = +doc.getElementsByName("int")[0].value;

		HtmlUtil.getTableRowsByHeaderAndFooter(doc, ...Page.MatchDayOptions.HEADERS).forEach(row => {

			let id = HtmlUtil.extractIdFromHref(row.cells['Spieler'].firstChild.href);
			let player = data.team.getSquadPlayer(id);

			if (row.cells['Physio'].firstChild.checked) {
				player.physioCosts = +row.cells['Kosten'].textContent.replaceAll('.', '');
			} else {
				player.physioCosts = null;
			}
		});
	}
}
