
Page.YouthSkills = class extends Page.Youth {
	
	constructor() {

		super('Jugendeinzelskills', 'ju.php', new Page.Param('page', 2));

		/** @type {HTMLTableElement} */
		this.table;
	}
	
	static HEADERS = ['Land', 'U', 'Alter', 'SCH', 'BAK', 'KOB', 'ZWK', 'DEC', 'GES', 'FUQ', 'ERF', 'AGG', 'PAS', 'AUS', 'UEB', 'WID', 'SEL', 'DIS', 'ZUV', 'EIN'];
	
	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

		data.currentTeam = Object.assign(new Team(), data.currentTeam);

		this.fixCountryHeader(doc);

		HtmlUtil.getTableRowsByHeader(doc, ...Page.YouthSkills.HEADERS)
			.filter(row => row.cells['U']).forEach((row, index) => {
	
			let player = data.currentTeam.getYouthPlayer(index);
			
			Object.keys(player.skills).forEach((skillname, s) => {
				player.skills[skillname] = +row.cells[skillname.toUpperCase()].textContent;
			});
		});
	}
	
	/**
	 * Fix the country header by adding a header cells to the HTML table and the HEADERS.
	 * 
	 * @param {Document} doc 
	 */
	fixCountryHeader(doc) {

		let headerRow = HtmlUtil.getTableByHeader(doc, ...Page.YouthSkills.HEADERS).rows[0];

		headerRow.cells['Flag'] = headerRow.cells['Land'].cloneNode(true);
		headerRow.cells['Flag'].textContent = 'Flag';
		headerRow.insertBefore(headerRow.cells['Flag'], headerRow.cells['Land']);
		Page.YouthSkills.HEADERS.splice(0, 0, 'Flag');

		headerRow.cells[''] = headerRow.cells['Land'].cloneNode(true);
		headerRow.cells[''].textContent = '';
		headerRow.insertBefore(headerRow.cells[''], headerRow.cells['U']);
		Page.YouthSkills.HEADERS.splice(2, 0, '');

		headerRow.cells['Flag'].removeAttribute('colspan');
		headerRow.cells['Land'].removeAttribute('colspan');
		headerRow.cells[''].removeAttribute('colspan');
	}
	
	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extend(doc, data) {

		data.currentTeam = Object.assign(new Team(), data.currentTeam);

		this.table = HtmlUtil.getTableByHeader(doc, ...Page.YouthSkills.HEADERS);

		Array.from(this.table.rows).forEach((row, index) => {

			
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

