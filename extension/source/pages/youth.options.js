
Page.YouthOptions = class extends Page {
	
	constructor() {

		super('Jugendoptionen', 'ju.php', new Page.Param('page', 4));
	}
		
	static HEADERS = ['Land', 'U', 'Alter', 'Skill', 'TOR', 'ABW', 'DMI', 'MIT', 'OMI', 'STU'];

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extend(doc, data) {

		this.table = HtmlUtil.getTableByHeader(doc, ...Page.YouthOptions.HEADERS);
		this.table.classList.add(STYLE_YOUTH);

		Array.from(this.table.rows).forEach((row, index) => {

			
		});
		
		this.table.parentNode.insertBefore(this.createToolbar(doc, data), this.table);
	};
	
}

