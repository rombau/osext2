
Page.FastTransfer = class extends Page {

	constructor() {

		super('Schnelltransfer', 'blitz.php');

	}

	static HEADERS = ['Name', 'Alter', 'Land', '', 'Skillschnitt', 'Opti', 'Laufzeit', 'Gehalt', 'Ablöse'];

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extend(doc, data) {

		HtmlUtil.getTableRowsByHeader(doc, ...Page.FastTransfer.HEADERS).slice(0, -1).forEach((row, i) => {

			let player = data.team.getSquadPlayer(HtmlUtil.extractIdFromHref(row.cells['Name'].firstChild.href));

			if (player.fastTransferMatchDay && data.lastMatchDay.equals(player.fastTransferMatchDay)) {
				row.cells['Ablöse'].nextElementSibling.firstElementChild.checked = true;
			}
		});
	}
}
