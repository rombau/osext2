
Page.YouthSkills = class extends Page.Youth {
	
	constructor() {

		super('Jugendeinzelskills', 'ju.php', new Page.Param('page', 2));

		/** @type {HTMLTableElement} */
		this.table;
	}
	
	static HEADERS = ['|Land|', 'U', 'Alter', 'SCH', 'BAK', 'KOB', 'ZWK', 'DEC', 'GES', 'FUQ', 'ERF', 'AGG', 'PAS', 'AUS', 'UEB', 'WID', 'SEL', 'DIS', 'ZUV', 'EIN'];
	
	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

		HtmlUtil.getTableRowsByHeader(doc, ...Page.YouthSkills.HEADERS)
			.filter(row => this.isPlayerRow(row)).forEach((row, index) => {
	
			let player = data.team.youthPlayers[index];
			if (!player) {
				player = new YouthPlayer();
			}
			data.team.youthPlayers[index] = player;
			
			Object.keys(player.skills).forEach((skillname, s) => {
				player.skills[skillname] = +row.cells[skillname.toUpperCase()].textContent;
			});
		});
	}
		
	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extend(doc, data) {

		this.table = HtmlUtil.getTableByHeader(doc, ...Page.YouthSkills.HEADERS);
		
		this.table.classList.add(STYLE_YOUTH);
		
		Array.from(this.table.rows).forEach((row, index) => {

			if (!this.handleYearHeader(row)) {

				// player rows

			}
		
		});
		
		this.table.parentNode.insertBefore(this.createToolbar(doc, data), this.table);
	};

	/**
	 * @param {Team} team
	 * @param {Boolean} current indicating the current team
	 */
	updateWithTeam (team, current) {

		Array.from(this.table.rows).slice(1, -1).forEach((row, index) => {


		});
	}
}

