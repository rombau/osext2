
Page.YouthOverview = class extends Page.Youth {
	
	constructor() {

		super('Jugendübersicht', 'ju.php', new Page.Param('page', 1, true));

		/** @type {HTMLTableElement} */
		this.table;
	}

	static HEADERS = ['Alter', 'Geb.', 'Land', 'U', 'Skillschnitt', 'Talent', 'Aktion', 'Aufwertung'];

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

		data.team = Object.assign(new Team(), data.team);
		
		this.fixCountryHeader(doc);

		HtmlUtil.getTableRowsByHeader(doc, ...Page.YouthOverview.HEADERS)
			.filter(row => row.cells['U']).forEach((row, index) => {
	
			let player = data.team.getYouthPlayer(index);
				
			player.age = +row.cells['Alter'].textContent;
			player.birthday = +row.cells['Geb.'].textContent;

			if (row.cells['Alter'].className && row.cells['Alter'].className == Position.TOR) {
				player.pos = Position.TOR;
			}

			player.countryCode = row.cells['Land'].textContent;
			player.countryName = row.cells['Land'].firstChild.title;
			player.uefa = row.cells['U'].textContent ? false : true;

			player.talent = row.cells['Talent'].textContent;			
		});
	}
	
	/**
	 * Fix the country header by adding a header cell to the HTML table and the HEADERS.
	 * 
	 * @param {Document} doc 
	 */
	fixCountryHeader(doc) {

		let headerRow = HtmlUtil.getTableByHeader(doc, ...Page.YouthOverview.HEADERS).rows[0];
		
		headerRow.cells['Flag'] = headerRow.cells['Land'].cloneNode(true);
		headerRow.cells['Flag'].textContent = 'Flag';
		headerRow.insertBefore(headerRow.cells['Flag'], headerRow.cells['Land']);
		Page.YouthOverview.HEADERS.splice(2, 0, 'Flag');

		headerRow.cells['Flag'].removeAttribute('colspan');
		headerRow.cells['Land'].removeAttribute('colspan');
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extend(doc, data) {

		data.team = Object.assign(new Team(), data.team);

		this.table = HtmlUtil.getTableByHeader(doc, ...Page.YouthOverview.HEADERS);

		Array.from(this.table.rows).forEach((row, i) => {


		});
		
		this.table.parentNode.insertBefore(this.createToolbar(doc, data), this.table);
	}

	/**
	 * @param {Team} team
	 * @param {Boolean} current indicating the current team
	 */
	updateWithTeam (team, current) {

		Array.from(this.table.rows).slice(1, -1).forEach(row => {


		});
	}
}
