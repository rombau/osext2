
Page.MatchDayLineUp = class extends Page {

	constructor() {

		super('ZA-Aufstellung', 'zugabgabe.php', new Page.Param('p', 0, true));

	}

	static HEADERS = ['Raster', 'Name', 'Alter', 'U', 'Moral', 'Fitness', 'Skillschnitt', 'Opt.Skill', 'S'];

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

		HtmlUtil.getTableRowsByHeader(doc, ...Page.MatchDayLineUp.HEADERS).forEach(row => {

			/** @type {HTMLTableCellElement} */
			let nameCell = row.cells['Name'];
			if (nameCell) {

				/** @type {HTMLSelectElement} */
				let gridSelect = row.cells['Raster'].firstChild;

				/** @type {HTMLAnchorElement} */
				let nameLink = row.cells['Name'].firstChild;
				if (nameLink && nameLink.tagName && nameLink.tagName.toLowerCase === 'a') {

					if (gridSelect.value) {

						let id = HtmlUtil.extractIdFromHref(nameLink.href);
						let player = data.team.getSquadPlayer(id);
	
						player.nextTraining = player.nextTraining || new SquadPlayer.Training();

						// if (gridSelect.value)
						// player.nextTraining.matchBonus = gridSelect.value


					}


				}

			}

		});
	}
}
