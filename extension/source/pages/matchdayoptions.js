
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

		let nextMatchDay = data.nextMatchDay;
		if (nextMatchDay) {
			nextMatchDay.ticketPrice = null;
			if (nextMatchDay.location === GameLocation.HOME) {
				switch (nextMatchDay.competition) {
					case Competition.LEAGUE:
						nextMatchDay.ticketPrice = data.viewSettings.ticketPrice.league;
						break;
					case Competition.CUP:
						nextMatchDay.ticketPrice = data.viewSettings.ticketPrice.cup;
						break;
					case Competition.OSC:
					case Competition.OSCQ:
					case Competition.OSE:
					case Competition.OSEQ:
						nextMatchDay.ticketPrice = data.viewSettings.ticketPrice.international;
						break;
				}
			}
		}

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
