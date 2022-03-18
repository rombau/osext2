
Page.AccountStatement = class extends Page {
	
	/**
	 * @param {Number} season 
	 */
	constructor(season) {

		super('Kontoauszug', 'ka.php');

		if (season) {
			this.method = HttpMethod.POST;
			this.name += ` (Saison ${season})`;
			this.params.push(new Page.Param('saison', season, true));
		}
	}

	static HEADERS = ['Datum', 'Eingang', 'Ausgang', 'Buchungstext', 'Kontostand nach Buchung'];

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {
		
		let season = +doc.querySelector('select[name=saison]').value;
		this.params.push(new Page.Param('saison', season, true));

		let matches = /Kontoauszug - Kontostand : ([\d\.]+) Euro/gm.exec(doc.querySelector('b > font').textContent);
			
		data.team.accountBalance = +matches[1].replace(/\./g, '');

		HtmlUtil.getTableRowsByHeader(doc, ...Page.AccountStatement.HEADERS).forEach(row => {
			

		});

	}
}
