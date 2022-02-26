
Page.YouthOptskills = class extends Page.Youth {
	
	constructor() {

		super('Jugend-Optis', 'ju.php', new Page.Param('page', 3));

		/** @type {HTMLTableElement} */
		this.table;
	}
	
	static HEADERS = ['|Land', 'U', 'Alter', 'Skill', 'TOR', 'ABW', 'DMI', 'MIT', 'OMI', 'STU'];
		
	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extend(doc, data) {

		this.table = HtmlUtil.getTableByHeader(doc, ...Page.YouthOptskills.HEADERS);
		
		this.table.classList.add(STYLE_YOUTH);

		Array.from(this.table.rows)
			.filter(row => !this.handleYearHeader(row))
			.slice(0, -1)
			.forEach((row, index) => {

			// player rows
		
		});
		
		this.table.parentNode.insertBefore(this.createToolbar(doc, data), this.table);
	};

	/**
	 * @param {Team} team
	 * @param {Boolean} current indicating the current team
	 * @param {MatchDay} matchDay
	 */
	updateWithTeam (team, current, matchDay) {

		Array.from(this.table.rows)
			.filter(row => this.isPlayerRow(row))
			.slice(1)
			.forEach((row, index) => {
			
			let player = team.youthPlayers[index];


		});
	}
}

