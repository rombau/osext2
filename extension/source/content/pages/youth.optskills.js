
class YouthOptskillsPage extends YouthPage {
	
	constructor() {

		super('Jugend-Optis', 'ju.php', new Page.Param('page', 3));

		/** @type {HTMLTableElement} */
		this.table;
	}
	
	static HEADERS = ['Land', 'U', 'Alter', 'Skill', 'TOR', 'ABW', 'DMI', 'MIT', 'OMI', 'STU'];
	
	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

		this.fixCountryHeader(doc);
	}
	
	/**
	 * Fix the country header by adding a header cells to the HTML table and the HEADERS.
	 * 
	 * @param {Document} doc 
	 */
	fixCountryHeader(doc) {

		let headerRow = HtmlUtil.getTableByHeader(doc, ...YouthOptskillsPage.HEADERS).rows[0];

		headerRow.cells['Flag'] = headerRow.cells['Land'].cloneNode(true);
		headerRow.cells['Flag'].textContent = 'Flag';
		headerRow.insertBefore(headerRow.cells['Flag'], row.cells['Land']);
		YouthOptskillsPage.HEADERS.splice(2, 0, 'Flag');
	}
	
	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extend(doc, data) {

		data.currentTeam = Object.assign(new Team(), data.currentTeam);

		this.table = HtmlUtil.getTableByHeader(doc, ...YouthOptskillsPage.HEADERS);

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

