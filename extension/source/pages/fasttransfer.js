
Page.FastTransfer = class extends Page {

	constructor() {

		super('Schnelltransfer', 'blitz.php');

	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extend (doc, data) {

		if (!doc.querySelector('input[type="checkbox"][value]')) {
			return;
		}

		this.table = new ManagedTable(this.name,
			new Column('Name'),
			new Column('Alter'),
			new Column('Land'),
			new Column('').withRef('U').withHeader('U'),
			new Column('Skillschnitt'),
			new Column('Opti'),
			new Column('Laufzeit'),
			new Column('Gehalt'),
			new Column('Ablöse')
		);

		this.table.initialize(doc, false, true);

		this.table.rows.slice(1, -1).forEach(row => {

			let player = data.team.getSquadPlayer(HtmlUtil.extractIdFromHref(row.cells['Name'].firstChild.href));

			if (player.fastTransferMatchDay && data.lastMatchDay.equals(player.fastTransferMatchDay)) {
				row.cells['Ablöse'].nextElementSibling.firstElementChild.checked = true;
			}
		});
	}
}
